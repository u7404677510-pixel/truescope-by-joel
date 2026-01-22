import { v4 as uuidv4 } from 'uuid';
import { db, COLLECTIONS } from '../config/firebase.js';
import { analyzeWithGemini, extractKeywords, determineProblemType } from './gemini.js';
import { findSimilarInterventions, saveIntervention } from './similarity.js';
import type {
  Demande,
  CreateDemandeRequest,
  ValidateDemandeRequest,
  AnalyseResponse,
  Intervention,
  Metier,
  MediaFile,
} from '../types/index.js';

// Store en mémoire pour les demandes en mode mock
const mockDemandes: Map<string, Demande> = new Map();

/**
 * Joël Core - Le cerveau du système
 * Orchestre tout le processus d'analyse de demande de devis
 */
export class JoelCore {
  /**
   * Crée et analyse une nouvelle demande de devis
   * C'est le point d'entrée principal du système
   */
  static async createAndAnalyzeDemande(request: CreateDemandeRequest): Promise<AnalyseResponse> {
    const { metier, description, mediaUrls = [], mediaFiles = [] } = request;

    // 1. Créer la demande avec un ID unique
    const demandeId = uuidv4();
    const demande: Demande = {
      id: demandeId,
      metier,
      description,
      mediaUrls,
      status: 'pending',
      interventionsSimilaires: [],
      createdAt: new Date(),
    };

    // 2. Sauvegarder la demande initiale
    await this.saveDemande(demande);

    // 3. Rechercher les interventions similaires
    console.log(`🔍 Recherche d'interventions similaires pour: ${description.substring(0, 50)}...`);
    const similarResults = await findSimilarInterventions(metier, description);
    const interventionsSimilaires = similarResults.map(r => r.intervention);
    
    console.log(`📊 ${interventionsSimilaires.length} intervention(s) similaire(s) trouvée(s)`);
    
    // 4. Analyser avec Gemini (avec les images si fournies)
    console.log(`🤖 Analyse TrueScope...${mediaFiles.length > 0 ? ` (avec ${mediaFiles.length} image(s))` : ''}`);
    const { solution } = await analyzeWithGemini(
      metier,
      description,
      mediaUrls,
      interventionsSimilaires,
      mediaFiles
    );

    // 5. Déterminer le niveau de confiance basé sur les similarités
    const confiance = this.determineConfidence(similarResults);

    // 6. Mettre à jour la demande avec la solution
    demande.status = 'analyzed';
    demande.solutionProposee = solution;
    demande.interventionsSimilaires = interventionsSimilaires.map(i => i.id);
    demande.updatedAt = new Date();

    await this.saveDemande(demande);

    console.log(`✅ Diagnostic TrueScope terminé pour demande ${demandeId}`);

    return {
      demande,
      interventionsSimilaires,
      solution,
      confiance,
    };
  }

  /**
   * Valide une demande et l'enregistre comme nouvelle intervention de référence
   */
  static async validateDemande(
    demandeId: string,
    validation: ValidateDemandeRequest
  ): Promise<Intervention> {
    // 1. Récupérer la demande
    const demande = await this.getDemandeById(demandeId);
    if (!demande) {
      throw new Error(`Demande ${demandeId} non trouvée`);
    }

    if (demande.status === 'validated') {
      throw new Error('Cette demande a déjà été validée');
    }

    // 2. Extraire les mots-clés
    const keywords = validation.keywords || await extractKeywords(
      demande.metier,
      demande.description,
      validation.problemType
    );

    // 3. Créer la nouvelle intervention de référence
    const intervention: Omit<Intervention, 'id'> = {
      metier: demande.metier,
      description: demande.description,
      keywords,
      problemType: validation.problemType,
      mediaUrls: demande.mediaUrls,
      solution: validation.solutionFinale,
      validated: true,
      createdAt: demande.createdAt,
      validatedAt: new Date(),
    };

    // 4. Sauvegarder l'intervention
    const interventionId = await saveIntervention(intervention);

    // 5. Mettre à jour le statut de la demande
    demande.status = 'validated';
    demande.updatedAt = new Date();
    await this.saveDemande(demande);

    console.log(`✅ Intervention ${interventionId} créée à partir de la demande ${demandeId}`);

    return { ...intervention, id: interventionId };
  }

  /**
   * Ré-analyse une demande existante (par exemple après modification)
   */
  static async reanalyzeDemande(demandeId: string): Promise<AnalyseResponse> {
    const demande = await this.getDemandeById(demandeId);
    if (!demande) {
      throw new Error(`Demande ${demandeId} non trouvée`);
    }

    // Relancer l'analyse complète
    return this.createAndAnalyzeDemande({
      metier: demande.metier,
      description: demande.description,
      mediaUrls: demande.mediaUrls,
    });
  }

  /**
   * Récupère une demande par son ID
   */
  static async getDemandeById(id: string): Promise<Demande | null> {
    if (!db) {
      return mockDemandes.get(id) || null;
    }

    try {
      const doc = await db.collection(COLLECTIONS.DEMANDES).doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() } as Demande;
    } catch (error) {
      console.error('Erreur récupération demande:', error);
      return null;
    }
  }

  /**
   * Récupère toutes les demandes (avec pagination optionnelle)
   */
  static async getAllDemandes(options?: {
    status?: Demande['status'];
    metier?: Metier;
    limit?: number;
  }): Promise<Demande[]> {
    const { status, metier, limit = 50 } = options || {};

    if (!db) {
      const results: Demande[] = [];
      mockDemandes.forEach(d => {
        if (status && d.status !== status) return;
        if (metier && d.metier !== metier) return;
        results.push(d);
      });
      return results.slice(0, limit);
    }

    try {
      let query = db.collection(COLLECTIONS.DEMANDES)
        .orderBy('createdAt', 'desc')
        .limit(limit) as FirebaseFirestore.Query;

      if (status) {
        query = query.where('status', '==', status);
      }
      if (metier) {
        query = query.where('metier', '==', metier);
      }

      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Demande));
    } catch (error) {
      console.error('Erreur récupération demandes:', error);
      return [];
    }
  }

  /**
   * Sauvegarde ou met à jour une demande
   */
  private static async saveDemande(demande: Demande): Promise<void> {
    if (!db) {
      mockDemandes.set(demande.id, demande);
      console.log(`📦 Mode mock: demande ${demande.id} sauvegardée`);
      return;
    }

    try {
      await db.collection(COLLECTIONS.DEMANDES).doc(demande.id).set(demande, { merge: true });
    } catch (error) {
      console.error('Erreur sauvegarde demande:', error);
      throw new Error('Impossible de sauvegarder la demande');
    }
  }

  /**
   * Détermine le niveau de confiance basé sur les interventions similaires
   */
  private static determineConfidence(
    similarResults: Array<{ score: number }>
  ): 'haute' | 'moyenne' | 'basse' {
    if (similarResults.length === 0) {
      return 'basse';
    }

    const maxScore = Math.max(...similarResults.map(r => r.score));
    const avgScore = similarResults.reduce((sum, r) => sum + r.score, 0) / similarResults.length;

    if (maxScore >= 0.7 && avgScore >= 0.5) {
      return 'haute';
    } else if (maxScore >= 0.4 || avgScore >= 0.3) {
      return 'moyenne';
    }
    return 'basse';
  }

  /**
   * Détermine automatiquement le type de problème
   */
  static async determineProblemType(metier: Metier, description: string): Promise<string> {
    return determineProblemType(metier, description);
  }

  /**
   * Statistiques du système Joël
   */
  static async getSystemStats(): Promise<{
    totalDemandes: number;
    demandesEnCours: number;
    demandesValidees: number;
    tauxValidation: number;
  }> {
    const stats = {
      totalDemandes: 0,
      demandesEnCours: 0,
      demandesValidees: 0,
      tauxValidation: 0,
    };

    if (!db) {
      mockDemandes.forEach(d => {
        stats.totalDemandes++;
        if (d.status === 'pending' || d.status === 'analyzed') {
          stats.demandesEnCours++;
        } else if (d.status === 'validated') {
          stats.demandesValidees++;
        }
      });
    } else {
      try {
        const snapshot = await db.collection(COLLECTIONS.DEMANDES).get();
        snapshot.docs.forEach(doc => {
          const data = doc.data() as Demande;
          stats.totalDemandes++;
          if (data.status === 'pending' || data.status === 'analyzed') {
            stats.demandesEnCours++;
          } else if (data.status === 'validated') {
            stats.demandesValidees++;
          }
        });
      } catch (error) {
        console.error('Erreur récupération stats système:', error);
      }
    }

    stats.tauxValidation = stats.totalDemandes > 0 
      ? Math.round((stats.demandesValidees / stats.totalDemandes) * 100) 
      : 0;

    return stats;
  }
}

export default JoelCore;

