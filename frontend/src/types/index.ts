// Types miroir du backend

export type Metier = 'serrurerie' | 'plomberie' | 'electricite';

export type DemandeStatus = 'pending' | 'analyzed' | 'validated';

export type TarifCategorie = 'main_oeuvre' | 'materiaux';

// Tarif unitaire
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

export interface LigneDevis {
  code?: string;
  designation: string;
  unite: string;
  quantite: number;
  prixUnitaire?: number;
  prixTotal?: number;
  notes?: string;
  tarifManquant?: boolean; // true si le code tarif n'existe pas dans la base
}

export interface Materiel {
  nom: string;
  quantite?: number;
  marque?: string;
  specifications?: string;
}

export interface Variante {
  nom: string;
  description: string;
  lignesDevis: LigneDevis[];
  avantages?: string[];
  inconvenients?: string[];
}

export interface Solution {
  description: string;
  diagnostic: string;
  materiel: Materiel[];
  lignesDevis: LigneDevis[];
  variantes?: Variante[];
  recommandations?: string[];
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
  raisonnementIA?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AnalyseResponse {
  demande: Demande;
  interventionsSimilaires: Intervention[];
  solution: Solution;
  raisonnement: string;
  confiance: 'haute' | 'moyenne' | 'basse';
}
