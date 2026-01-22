// Types miroir du backend - TrueScope by Joël

export type Metier = 'serrurerie' | 'plomberie' | 'electricite';

export type DemandeStatus = 'pending' | 'analyzed' | 'validated';

export type TarifCategorie = 'main_oeuvre' | 'materiaux';

// Tarif unitaire (usage admin uniquement)
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

// Ligne de devis (avec prix calculé depuis les tarifs)
export interface LigneDevis {
  code?: string;
  designation: string;
  unite: string;
  quantite: number;
  prixUnitaire?: number;
  prixTotal?: number;
  tarifManquant?: boolean;
}

// Solution TrueScope - Format pour l'utilisateur
export interface Solution {
  descriptionProbleme: string;    // Ce qu'on a compris du problème
  solutionTrueScope: string;      // Comment résoudre le problème
  propositionJoel: string;        // Phrase d'accroche pour contacter Joël
  lignesDevis: LigneDevis[];      // Détail de l'intervention avec prix
  conseilsPrevention: string[];   // Conseils pour éviter que ça se reproduise
}

export interface Intervention {
  id: string;
  metier: Metier;
  description: string;
  keywords: string[];
  problemType: string;
  mediaUrls: string[];
  solution: Solution;
  validated: boolean;
  createdAt: string;
  validatedAt?: string;
}

export interface Demande {
  id: string;
  metier: Metier;
  description: string;
  mediaUrls: string[];
  status: DemandeStatus;
  solutionProposee?: Solution;
  interventionsSimilaires: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface AnalyseResponse {
  demande: Demande;
  interventionsSimilaires: Intervention[];
  solution: Solution;
  confiance: 'haute' | 'moyenne' | 'basse';
}
