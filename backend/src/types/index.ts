// Types pour le domaine métier du wrapper Joël

export type Metier = 'serrurerie' | 'plomberie' | 'electricite';

export type DemandeStatus = 'pending' | 'analyzed' | 'validated';

export type TarifCategorie = 'main_oeuvre' | 'materiaux';

// Tarif unitaire
export interface Tarif {
  code: string;           // Ex: "SER-MO-001"
  designation: string;    // Ex: "Déplacement"
  prix: number;          // Prix en euros
  unite: string;         // Ex: "forfait", "ml", "pièce", "%"
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

// Ligne de devis (avec prix calculé depuis les tarifs)
export interface LigneDevis {
  code?: string;         // Code tarif (ex: "SER-MO-001")
  designation: string;
  unite: string;
  quantite: number;
  prixUnitaire?: number; // Prix unitaire HT
  prixTotal?: number;    // Prix total ligne (prixUnitaire * quantite)
  notes?: string;
  tarifManquant?: boolean; // true si le code tarif n'existe pas dans la base
}

// Matériel nécessaire pour l'intervention
export interface Materiel {
  nom: string;
  quantite?: number;
  marque?: string;        // Marque si détectée ou recommandée
  specifications?: string; // Ex: "diamètre 15mm", "3 points"
}

// Solution proposée par Joël
export interface Solution {
  description: string;
  diagnostic: string;
  lignesDevis: LigneDevis[];
  materiel: Materiel[];   // Liste du matériel nécessaire
  variantes?: Variante[];
  recommandations?: string[];
}

// Variante de solution
export interface Variante {
  nom: string;
  description: string;
  lignesDevis: LigneDevis[];
  avantages?: string[];
  inconvenients?: string[];
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

// Demande de devis (en cours de traitement)
export interface Demande {
  id: string;
  metier: Metier;
  description: string;
  mediaUrls: string[];
  status: DemandeStatus;
  solutionProposee?: Solution;
  interventionsSimilaires: string[];
  raisonnementIA?: string;
  createdAt: Date;
  updatedAt?: Date;
}

// Fichier media encodé en base64
export interface MediaFile {
  data: string;      // Base64 encoded data
  mimeType: string;  // Ex: "image/jpeg", "video/mp4"
  name: string;      // Nom du fichier
}

// Requête pour créer une nouvelle demande
export interface CreateDemandeRequest {
  metier: Metier;
  description: string;
  mediaUrls?: string[];
  mediaFiles?: MediaFile[];  // Fichiers uploadés en base64
}

// Réponse d'analyse de Joël
export interface AnalyseResponse {
  demande: Demande;
  interventionsSimilaires: Intervention[];
  solution: Solution;
  raisonnement: string;
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

