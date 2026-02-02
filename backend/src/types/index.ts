// Types pour le domaine métier TrueScope by Joël

export type Metier = 'serrurerie' | 'plomberie' | 'electricite';

export type DemandeStatus = 'pending' | 'analyzed' | 'validated';

export type TarifCategorie = 'main_oeuvre' | 'materiaux';

// Tarif unitaire (usage interne uniquement)
export interface Tarif {
  code: string;
  designation: string;
  prix: number;
  unite: string;
  categorie: TarifCategorie;
  metier: Metier;
}

// Structure des tarifs par métier
export interface TarifsMetier {
  main_oeuvre: Tarif[];
  materiaux: Tarif[];
}

// Tous les tarifs
export interface AllTarifs {
  serrurerie: TarifsMetier;
  plomberie: TarifsMetier;
  electricite: TarifsMetier;
}

// Solution TrueScope - Format simplifié pour l'utilisateur
export interface Solution {
  descriptionProbleme: string;    // Ce qu'on a compris du problème
  solutionTrueScope: string;      // Comment résoudre le problème
  propositionJoel: string;        // Phrase d'accroche pour contacter Joël
  conseilsPrevention: string[];   // Conseils pour éviter que ça se reproduise
}

// Intervention de référence (stockée en base après validation)
export interface Intervention {
  id: string;
  metier: Metier;
  description: string;
  keywords: string[];
  problemType: string;
  mediaUrls: string[];
  solution: Solution;
  validated: boolean;
  createdAt: Date;
  validatedAt?: Date;
}

// Demande de diagnostic (en cours de traitement)
export interface Demande {
  id: string;
  metier: Metier;
  description: string;
  mediaUrls: string[];
  status: DemandeStatus;
  solutionProposee?: Solution;
  interventionsSimilaires: string[];
  createdAt: Date;
  updatedAt?: Date;
}

// Fichier media encodé en base64
export interface MediaFile {
  data: string;
  mimeType: string;
  name: string;
}

// Requête pour créer une nouvelle demande
export interface CreateDemandeRequest {
  metier: Metier;
  description: string;
  mediaUrls?: string[];
  mediaFiles?: MediaFile[];
}

// Réponse d'analyse TrueScope
export interface AnalyseResponse {
  demande: Demande;
  interventionsSimilaires: Intervention[];
  solution: Solution;
  confiance: 'haute' | 'moyenne' | 'basse';
}

// Requête pour valider une demande
export interface ValidateDemandeRequest {
  solutionFinale: Solution;
  problemType: string;
  keywords?: string[];
}

// Score de similarité pour le moteur de recherche
export interface SimilarityResult {
  intervention: Intervention;
  score: number;
  matchedKeywords: string[];
}

// Lead généré (quand l'utilisateur clique sur "Trouver un Joël")
export interface Lead {
  id: string;
  diagnosticId: string;
  metier: Metier;
  contact: {
    nom: string;
    telephone: string;
    email?: string;
    adresse?: string;
  };
  urgence: 'urgent' | 'aujourd_hui' | 'cette_semaine' | 'flexible';
  message?: string;
  status: 'new' | 'contacted' | 'converted' | 'lost';
  createdAt: Date;
}