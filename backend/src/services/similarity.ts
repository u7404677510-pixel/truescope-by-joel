import { db, COLLECTIONS } from '../config/firebase.js';
import { config } from '../config/index.js';
import type { Metier, Intervention, SimilarityResult } from '../types/index.js';

// Store en mémoire pour le mode mock (quand Firebase n'est pas configuré)
const mockInterventions: Map<string, Intervention> = new Map();

/**
 * Calcule un score de similarité entre deux ensembles de mots-clés
 * Utilise le coefficient de Jaccard
 */
function calculateKeywordSimilarity(keywords1: string[], keywords2: string[]): { score: number; matchedKeywords: string[] } {
  const set1 = new Set(keywords1.map(k => k.toLowerCase()));
  const set2 = new Set(keywords2.map(k => k.toLowerCase()));
  
  const matchedKeywords: string[] = [];
  set1.forEach(k => {
    if (set2.has(k)) {
      matchedKeywords.push(k);
    }
  });
  
  const intersection = matchedKeywords.length;
  const union = new Set([...set1, ...set2]).size;
  
  const score = union > 0 ? intersection / union : 0;
  
  return { score, matchedKeywords };
}

/**
 * Calcule la similarité textuelle entre deux descriptions
 * Utilise une approche simple basée sur les mots communs
 */
function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = new Set(
    text1.toLowerCase()
      .replace(/[^a-zàâäéèêëïîôùûüç\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3)
  );
  
  const words2 = new Set(
    text2.toLowerCase()
      .replace(/[^a-zàâäéèêëïîôùûüç\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3)
  );
  
  let matches = 0;
  words1.forEach(w => {
    if (words2.has(w)) matches++;
  });
  
  const total = Math.max(words1.size, words2.size);
  return total > 0 ? matches / total : 0;
}

/**
 * Calcule le score de similarité global entre une demande et une intervention
 */
function calculateSimilarityScore(
  metier: Metier,
  description: string,
  keywords: string[],
  intervention: Intervention
): SimilarityResult {
  // Bonus si même métier (obligatoire en fait, on ne compare que les mêmes métiers)
  if (intervention.metier !== metier) {
    return { intervention, score: 0, matchedKeywords: [] };
  }
  
  // Similarité des mots-clés (poids: 50%)
  const { score: keywordScore, matchedKeywords } = calculateKeywordSimilarity(keywords, intervention.keywords);
  
  // Similarité textuelle (poids: 30%)
  const textScore = calculateTextSimilarity(description, intervention.description);
  
  // Bonus si même type de problème (poids: 20%)
  const problemTypeBonus = keywords.includes(intervention.problemType) ? 0.2 : 0;
  
  const finalScore = (keywordScore * 0.5) + (textScore * 0.3) + problemTypeBonus;
  
  return {
    intervention,
    score: Math.min(finalScore, 1), // Plafonner à 1
    matchedKeywords,
  };
}

/**
 * Recherche les interventions similaires dans Firebase
 */
export async function findSimilarInterventions(
  metier: Metier,
  description: string,
  keywords: string[] = []
): Promise<SimilarityResult[]> {
  // Extraire des mots-clés de la description si non fournis
  const searchKeywords = keywords.length > 0 
    ? keywords 
    : description.toLowerCase()
        .replace(/[^a-zàâäéèêëïîôùûüç\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 3);

  // Mode mock si Firebase n'est pas configuré
  if (!db) {
    console.log('📦 Mode mock: recherche dans le store en mémoire');
    const results: SimilarityResult[] = [];
    
    mockInterventions.forEach(intervention => {
      if (intervention.metier === metier && intervention.validated) {
        const result = calculateSimilarityScore(metier, description, searchKeywords, intervention);
        if (result.score >= config.minSimilarityScore) {
          results.push(result);
        }
      }
    });
    
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, config.maxSimilarInterventions);
  }

  // Recherche dans Firebase
  try {
    // Requête de base: même métier et validée
    const snapshot = await db
      .collection(COLLECTIONS.INTERVENTIONS)
      .where('metier', '==', metier)
      .where('validated', '==', true)
      .get();

    const results: SimilarityResult[] = [];

    snapshot.docs.forEach(doc => {
      const intervention = { id: doc.id, ...doc.data() } as Intervention;
      const result = calculateSimilarityScore(metier, description, searchKeywords, intervention);
      
      if (result.score >= config.minSimilarityScore) {
        results.push(result);
      }
    });

    // Trier par score décroissant et limiter
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, config.maxSimilarInterventions);
      
  } catch (error) {
    console.error('Erreur recherche interventions similaires:', error);
    return [];
  }
}

/**
 * Récupère toutes les interventions validées d'un métier
 */
export async function getInterventionsByMetier(metier: Metier): Promise<Intervention[]> {
  if (!db) {
    const results: Intervention[] = [];
    mockInterventions.forEach(int => {
      if (int.metier === metier && int.validated) {
        results.push(int);
      }
    });
    return results;
  }

  try {
    const snapshot = await db
      .collection(COLLECTIONS.INTERVENTIONS)
      .where('metier', '==', metier)
      .where('validated', '==', true)
      .orderBy('validatedAt', 'desc')
      .limit(50)
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Intervention));
  } catch (error) {
    console.error('Erreur récupération interventions:', error);
    return [];
  }
}

/**
 * Récupère une intervention par son ID
 */
export async function getInterventionById(id: string): Promise<Intervention | null> {
  if (!db) {
    return mockInterventions.get(id) || null;
  }

  try {
    const doc = await db.collection(COLLECTIONS.INTERVENTIONS).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Intervention;
  } catch (error) {
    console.error('Erreur récupération intervention:', error);
    return null;
  }
}

/**
 * Sauvegarde une nouvelle intervention de référence
 */
export async function saveIntervention(intervention: Omit<Intervention, 'id'>): Promise<string> {
  if (!db) {
    const id = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    mockInterventions.set(id, { ...intervention, id } as Intervention);
    console.log(`📦 Mode mock: intervention sauvegardée avec ID ${id}`);
    return id;
  }

  try {
    const docRef = await db.collection(COLLECTIONS.INTERVENTIONS).add({
      ...intervention,
      createdAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Erreur sauvegarde intervention:', error);
    throw new Error('Impossible de sauvegarder l\'intervention');
  }
}

/**
 * Met à jour une intervention (pour la validation)
 */
export async function updateIntervention(id: string, updates: Partial<Intervention>): Promise<void> {
  if (!db) {
    const existing = mockInterventions.get(id);
    if (existing) {
      mockInterventions.set(id, { ...existing, ...updates });
    }
    return;
  }

  try {
    await db.collection(COLLECTIONS.INTERVENTIONS).doc(id).update(updates);
  } catch (error) {
    console.error('Erreur mise à jour intervention:', error);
    throw new Error('Impossible de mettre à jour l\'intervention');
  }
}

/**
 * Récupère les statistiques des interventions
 */
export async function getInterventionsStats(): Promise<{
  total: number;
  byMetier: Record<Metier, number>;
  recentCount: number;
}> {
  const stats = {
    total: 0,
    byMetier: {
      serrurerie: 0,
      plomberie: 0,
      electricite: 0,
    } as Record<Metier, number>,
    recentCount: 0,
  };

  if (!db) {
    mockInterventions.forEach(int => {
      if (int.validated) {
        stats.total++;
        stats.byMetier[int.metier]++;
      }
    });
    return stats;
  }

  try {
    const snapshot = await db
      .collection(COLLECTIONS.INTERVENTIONS)
      .where('validated', '==', true)
      .get();

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    snapshot.docs.forEach(doc => {
      const data = doc.data() as Intervention;
      stats.total++;
      stats.byMetier[data.metier]++;
      
      if (data.validatedAt && new Date(data.validatedAt.toString()) > oneWeekAgo) {
        stats.recentCount++;
      }
    });

    return stats;
  } catch (error) {
    console.error('Erreur récupération stats:', error);
    return stats;
  }
}

