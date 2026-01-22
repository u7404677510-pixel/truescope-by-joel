import { db } from '../config/firebase.js';
import type { Metier, TarifCategorie, Tarif, TarifsMetier, AllTarifs } from '../types/index.js';

// ============================================================
// DONNÉES INITIALES DES TARIFS (121 tarifs au total)
// ============================================================

const TARIFS_SERRURERIE_MO: Omit<Tarif, 'categorie' | 'metier'>[] = [
  { code: 'SER-MO-001', designation: 'Déplacement', prix: 29, unite: 'forfait' },
  { code: 'SER-MO-002', designation: 'Ouverture porte claquée simple', prix: 60, unite: 'forfait' },
  { code: 'SER-MO-003', designation: 'Ouverture porte claquée blindée', prix: 90, unite: 'forfait' },
  { code: 'SER-MO-004', designation: 'Ouverture porte verrouillée simple', prix: 90, unite: 'forfait' },
  { code: 'SER-MO-005', designation: 'Ouverture porte verrouillée blindée', prix: 150, unite: 'forfait' },
  { code: 'SER-MO-006', designation: 'Ouverture haute sécurité', prix: 200, unite: 'forfait' },
  { code: 'SER-MO-007', designation: 'Pose cylindre', prix: 40, unite: 'forfait' },
  { code: 'SER-MO-008', designation: 'Remplacement serrure complète', prix: 60, unite: 'forfait' },
  { code: 'SER-MO-009', designation: 'Remplacement serrure 3 points', prix: 90, unite: 'forfait' },
  { code: 'SER-MO-010', designation: 'Remplacement serrure 5 points', prix: 120, unite: 'forfait' },
  { code: 'SER-MO-011', designation: 'Pose blindage', prix: 150, unite: 'forfait' },
  { code: 'SER-MO-012', designation: 'Installation verrou', prix: 35, unite: 'forfait' },
  { code: 'SER-MO-013', designation: 'Réparation serrure', prix: 45, unite: 'forfait' },
  { code: 'SER-MO-014', designation: 'Dégrippage entretien', prix: 25, unite: 'forfait' },
  { code: 'SER-MO-015', designation: 'Majoration nuit (21h-6h)', prix: 50, unite: '%' },
  { code: 'SER-MO-016', designation: 'Majoration dimanche/férié', prix: 50, unite: '%' },
];

const TARIFS_SERRURERIE_MA: Omit<Tarif, 'categorie' | 'metier'>[] = [
  { code: 'SER-MA-001', designation: 'Cylindre standard', prix: 15, unite: 'pièce' },
  { code: 'SER-MA-002', designation: 'Cylindre sécurisé', prix: 45, unite: 'pièce' },
  { code: 'SER-MA-003', designation: 'Cylindre haute sécurité', prix: 90, unite: 'pièce' },
  { code: 'SER-MA-004', designation: 'Serrure encastrée simple', prix: 25, unite: 'pièce' },
  { code: 'SER-MA-005', designation: 'Serrure 3 points encastrée', prix: 120, unite: 'pièce' },
  { code: 'SER-MA-006', designation: 'Serrure 3 points applique', prix: 150, unite: 'pièce' },
  { code: 'SER-MA-007', designation: 'Serrure 5 points', prix: 200, unite: 'pièce' },
  { code: 'SER-MA-008', designation: 'Serrure haute sécurité', prix: 350, unite: 'pièce' },
  { code: 'SER-MA-009', designation: 'Verrou simple', prix: 15, unite: 'pièce' },
  { code: 'SER-MA-010', designation: 'Verrou haute sécurité', prix: 45, unite: 'pièce' },
  { code: 'SER-MA-011', designation: 'Poignée de porte', prix: 20, unite: 'pièce' },
  { code: 'SER-MA-012', designation: 'Gâche électrique', prix: 35, unite: 'pièce' },
  { code: 'SER-MA-013', designation: 'Cornière anti-pince', prix: 25, unite: 'pièce' },
  { code: 'SER-MA-014', designation: 'Protège cylindre', prix: 20, unite: 'pièce' },
  { code: 'SER-MA-015', designation: 'Blindage porte', prix: 800, unite: 'pièce' },
  { code: 'SER-MA-016', designation: 'Porte blindée complète', prix: 1200, unite: 'pièce' },
];

const TARIFS_PLOMBERIE_MO: Omit<Tarif, 'categorie' | 'metier'>[] = [
  { code: 'PLO-MO-001', designation: 'Déplacement', prix: 29, unite: 'forfait' },
  { code: 'PLO-MO-002', designation: 'Recherche fuite visuelle', prix: 45, unite: 'forfait' },
  { code: 'PLO-MO-003', designation: 'Recherche fuite technique', prix: 90, unite: 'forfait' },
  { code: 'PLO-MO-004', designation: 'Réparation fuite simple', prix: 50, unite: 'forfait' },
  { code: 'PLO-MO-005', designation: 'Réparation fuite complexe', prix: 90, unite: 'forfait' },
  { code: 'PLO-MO-006', designation: 'Débouchage manuel', prix: 50, unite: 'forfait' },
  { code: 'PLO-MO-007', designation: 'Débouchage furet', prix: 80, unite: 'forfait' },
  { code: 'PLO-MO-008', designation: 'Débouchage haute pression', prix: 120, unite: 'forfait' },
  { code: 'PLO-MO-009', designation: 'Remplacement robinet', prix: 35, unite: 'forfait' },
  { code: 'PLO-MO-010', designation: 'Remplacement mitigeur', prix: 45, unite: 'forfait' },
  { code: 'PLO-MO-011', designation: 'Remplacement chasse d\'eau', prix: 50, unite: 'forfait' },
  { code: 'PLO-MO-012', designation: 'Remplacement WC complet', prix: 90, unite: 'forfait' },
  { code: 'PLO-MO-013', designation: 'Remplacement lavabo', prix: 70, unite: 'forfait' },
  { code: 'PLO-MO-014', designation: 'Remplacement évier', prix: 80, unite: 'forfait' },
  { code: 'PLO-MO-015', designation: 'Remplacement baignoire', prix: 150, unite: 'forfait' },
  { code: 'PLO-MO-016', designation: 'Remplacement douche', prix: 120, unite: 'forfait' },
  { code: 'PLO-MO-017', designation: 'Pose cumulus', prix: 150, unite: 'forfait' },
  { code: 'PLO-MO-018', designation: 'Remplacement groupe sécurité', prix: 45, unite: 'forfait' },
  { code: 'PLO-MO-019', designation: 'Détartrage chauffe-eau', prix: 80, unite: 'forfait' },
  { code: 'PLO-MO-020', designation: 'Remplacement flexible', prix: 20, unite: 'forfait' },
  { code: 'PLO-MO-021', designation: 'Soudure cuivre', prix: 25, unite: 'point' },
  { code: 'PLO-MO-022', designation: 'Remplacement vanne', prix: 40, unite: 'forfait' },
  { code: 'PLO-MO-023', designation: 'Majoration nuit (21h-6h)', prix: 50, unite: '%' },
  { code: 'PLO-MO-024', designation: 'Majoration dimanche/férié', prix: 50, unite: '%' },
];

const TARIFS_PLOMBERIE_MA: Omit<Tarif, 'categorie' | 'metier'>[] = [
  { code: 'PLO-MA-001', designation: 'Robinet simple', prix: 15, unite: 'pièce' },
  { code: 'PLO-MA-002', designation: 'Mitigeur standard', prix: 35, unite: 'pièce' },
  { code: 'PLO-MA-003', designation: 'Mitigeur thermostatique', prix: 80, unite: 'pièce' },
  { code: 'PLO-MA-004', designation: 'Flexible inox', prix: 8, unite: 'pièce' },
  { code: 'PLO-MA-005', designation: 'Siphon PVC', prix: 8, unite: 'pièce' },
  { code: 'PLO-MA-006', designation: 'Mécanisme chasse d\'eau', prix: 20, unite: 'pièce' },
  { code: 'PLO-MA-007', designation: 'Réservoir WC', prix: 45, unite: 'pièce' },
  { code: 'PLO-MA-008', designation: 'WC complet', prix: 90, unite: 'pièce' },
  { code: 'PLO-MA-009', designation: 'Lavabo', prix: 40, unite: 'pièce' },
  { code: 'PLO-MA-010', designation: 'Évier inox', prix: 50, unite: 'pièce' },
  { code: 'PLO-MA-011', designation: 'Cumulus 100L', prix: 250, unite: 'pièce' },
  { code: 'PLO-MA-012', designation: 'Cumulus 150L', prix: 300, unite: 'pièce' },
  { code: 'PLO-MA-013', designation: 'Cumulus 200L', prix: 350, unite: 'pièce' },
  { code: 'PLO-MA-014', designation: 'Groupe de sécurité', prix: 25, unite: 'pièce' },
  { code: 'PLO-MA-015', designation: 'Vanne arrêt', prix: 10, unite: 'pièce' },
  { code: 'PLO-MA-016', designation: 'Tube cuivre', prix: 8, unite: 'ml' },
  { code: 'PLO-MA-017', designation: 'Tube PER', prix: 3, unite: 'ml' },
  { code: 'PLO-MA-018', designation: 'Raccord laiton', prix: 5, unite: 'pièce' },
  { code: 'PLO-MA-019', designation: 'Joint fibre (lot)', prix: 2, unite: 'lot' },
  { code: 'PLO-MA-020', designation: 'Colonne douche', prix: 80, unite: 'pièce' },
];

const TARIFS_ELECTRICITE_MO: Omit<Tarif, 'categorie' | 'metier'>[] = [
  { code: 'ELE-MO-001', designation: 'Déplacement', prix: 29, unite: 'forfait' },
  { code: 'ELE-MO-002', designation: 'Diagnostic panne', prix: 45, unite: 'forfait' },
  { code: 'ELE-MO-003', designation: 'Recherche panne complexe', prix: 80, unite: 'forfait' },
  { code: 'ELE-MO-004', designation: 'Remplacement prise', prix: 25, unite: 'forfait' },
  { code: 'ELE-MO-005', designation: 'Remplacement interrupteur', prix: 25, unite: 'forfait' },
  { code: 'ELE-MO-006', designation: 'Installation prise neuve', prix: 60, unite: 'forfait' },
  { code: 'ELE-MO-007', designation: 'Installation interrupteur neuf', prix: 60, unite: 'forfait' },
  { code: 'ELE-MO-008', designation: 'Remplacement disjoncteur', prix: 35, unite: 'forfait' },
  { code: 'ELE-MO-009', designation: 'Remplacement différentiel', prix: 45, unite: 'forfait' },
  { code: 'ELE-MO-010', designation: 'Remplacement tableau', prix: 200, unite: 'forfait' },
  { code: 'ELE-MO-011', designation: 'Mise aux normes tableau', prix: 150, unite: 'forfait' },
  { code: 'ELE-MO-012', designation: 'Installation point lumineux', prix: 50, unite: 'forfait' },
  { code: 'ELE-MO-013', designation: 'Remplacement luminaire', prix: 35, unite: 'forfait' },
  { code: 'ELE-MO-014', designation: 'Installation VMC', prix: 120, unite: 'forfait' },
  { code: 'ELE-MO-015', designation: 'Remplacement convecteur', prix: 45, unite: 'forfait' },
  { code: 'ELE-MO-016', designation: 'Prise spécialisée four/plaque', prix: 80, unite: 'forfait' },
  { code: 'ELE-MO-017', designation: 'Tirage câble', prix: 8, unite: 'ml' },
  { code: 'ELE-MO-018', designation: 'Vérification circuit', prix: 15, unite: 'circuit' },
  { code: 'ELE-MO-019', designation: 'Majoration nuit (21h-6h)', prix: 50, unite: '%' },
  { code: 'ELE-MO-020', designation: 'Majoration dimanche/férié', prix: 50, unite: '%' },
];

const TARIFS_ELECTRICITE_MA: Omit<Tarif, 'categorie' | 'metier'>[] = [
  { code: 'ELE-MA-001', designation: 'Prise standard', prix: 3, unite: 'pièce' },
  { code: 'ELE-MA-002', designation: 'Prise design', prix: 8, unite: 'pièce' },
  { code: 'ELE-MA-003', designation: 'Interrupteur simple', prix: 3, unite: 'pièce' },
  { code: 'ELE-MA-004', designation: 'Interrupteur va-et-vient', prix: 5, unite: 'pièce' },
  { code: 'ELE-MA-005', designation: 'Interrupteur design', prix: 10, unite: 'pièce' },
  { code: 'ELE-MA-006', designation: 'Disjoncteur 10-20A', prix: 8, unite: 'pièce' },
  { code: 'ELE-MA-007', designation: 'Disjoncteur 32A', prix: 12, unite: 'pièce' },
  { code: 'ELE-MA-008', designation: 'Différentiel type A', prix: 25, unite: 'pièce' },
  { code: 'ELE-MA-009', designation: 'Différentiel type AC', prix: 20, unite: 'pièce' },
  { code: 'ELE-MA-010', designation: 'Tableau 2 rangées', prix: 40, unite: 'pièce' },
  { code: 'ELE-MA-011', designation: 'Tableau 3 rangées', prix: 60, unite: 'pièce' },
  { code: 'ELE-MA-012', designation: 'Tableau 4 rangées', prix: 80, unite: 'pièce' },
  { code: 'ELE-MA-013', designation: 'Câble 1.5mm²', prix: 0.80, unite: 'ml' },
  { code: 'ELE-MA-014', designation: 'Câble 2.5mm²', prix: 1.20, unite: 'ml' },
  { code: 'ELE-MA-015', designation: 'Câble 6mm²', prix: 2.50, unite: 'ml' },
  { code: 'ELE-MA-016', designation: 'Gaine ICTA', prix: 0.50, unite: 'ml' },
  { code: 'ELE-MA-017', designation: 'Boîte encastrement', prix: 0.80, unite: 'pièce' },
  { code: 'ELE-MA-018', designation: 'Spot encastrable', prix: 8, unite: 'pièce' },
  { code: 'ELE-MA-019', designation: 'Plafonnier', prix: 15, unite: 'pièce' },
  { code: 'ELE-MA-020', designation: 'VMC simple flux', prix: 80, unite: 'pièce' },
  { code: 'ELE-MA-021', designation: 'Convecteur 1000W', prix: 60, unite: 'pièce' },
  { code: 'ELE-MA-022', designation: 'Convecteur 1500W', prix: 80, unite: 'pièce' },
];

// ============================================================
// CACHE DES TARIFS (évite les appels répétés à Firebase)
// ============================================================

let tarifsCache: AllTarifs | null = null;
let tarifsCacheTime: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function isCacheValid(): boolean {
  return tarifsCache !== null && (Date.now() - tarifsCacheTime) < CACHE_TTL;
}

function setCache(tarifs: AllTarifs): void {
  tarifsCache = tarifs;
  tarifsCacheTime = Date.now();
  console.log('📦 Cache tarifs mis à jour');
}

export function clearTarifsCache(): void {
  tarifsCache = null;
  tarifsCacheTime = 0;
  console.log('🗑️ Cache tarifs vidé');
}

// ============================================================
// FONCTIONS DE SERVICE
// ============================================================

/**
 * Convertit les données brutes en tarifs complets
 */
function buildTarifs(
  data: Omit<Tarif, 'categorie' | 'metier'>[],
  categorie: TarifCategorie,
  metier: Metier
): Tarif[] {
  return data.map(t => ({
    ...t,
    categorie,
    metier,
  }));
}

/**
 * Récupère les tarifs par défaut (données en mémoire)
 */
export function getDefaultTarifs(): AllTarifs {
  return {
    serrurerie: {
      main_oeuvre: buildTarifs(TARIFS_SERRURERIE_MO, 'main_oeuvre', 'serrurerie'),
      materiaux: buildTarifs(TARIFS_SERRURERIE_MA, 'materiaux', 'serrurerie'),
    },
    plomberie: {
      main_oeuvre: buildTarifs(TARIFS_PLOMBERIE_MO, 'main_oeuvre', 'plomberie'),
      materiaux: buildTarifs(TARIFS_PLOMBERIE_MA, 'materiaux', 'plomberie'),
    },
    electricite: {
      main_oeuvre: buildTarifs(TARIFS_ELECTRICITE_MO, 'main_oeuvre', 'electricite'),
      materiaux: buildTarifs(TARIFS_ELECTRICITE_MA, 'materiaux', 'electricite'),
    },
  };
}

/**
 * Récupère tous les tarifs depuis Firebase (avec cache)
 */
export async function getAllTarifs(): Promise<AllTarifs> {
  // Retourner le cache si valide
  if (isCacheValid()) {
    return tarifsCache!;
  }

  try {
    const tarifsRef = db.collection('tarifs');
    const metiers: Metier[] = ['serrurerie', 'plomberie', 'electricite'];
    const categories: TarifCategorie[] = ['main_oeuvre', 'materiaux'];
    
    const result: AllTarifs = {
      serrurerie: { main_oeuvre: [], materiaux: [] },
      plomberie: { main_oeuvre: [], materiaux: [] },
      electricite: { main_oeuvre: [], materiaux: [] },
    };

    for (const metier of metiers) {
      for (const categorie of categories) {
        const snapshot = await tarifsRef
          .doc(metier)
          .collection(categorie)
          .orderBy('code')
          .get();
        
        if (!snapshot.empty) {
          result[metier][categorie] = snapshot.docs.map(doc => doc.data() as Tarif);
        }
      }
    }

    // Si aucun tarif n'existe, retourner les valeurs par défaut
    const totalTarifs = Object.values(result).reduce(
      (sum, m) => sum + m.main_oeuvre.length + m.materiaux.length,
      0
    );

    if (totalTarifs === 0) {
      console.log('⚠️ Aucun tarif en base, utilisation des tarifs par défaut');
      const defaults = getDefaultTarifs();
      setCache(defaults);
      return defaults;
    }

    setCache(result);
    return result;
  } catch (error) {
    console.error('Erreur getAllTarifs:', error);
    const defaults = getDefaultTarifs();
    setCache(defaults);
    return defaults;
  }
}

/**
 * Récupère les tarifs d'un métier spécifique (utilise le cache)
 */
export async function getTarifsByMetier(metier: Metier): Promise<TarifsMetier> {
  const allTarifs = await getAllTarifs(); // Utilise le cache automatiquement
  return allTarifs[metier];
}

/**
 * Met à jour le prix d'un tarif
 */
export async function updateTarif(
  metier: Metier,
  categorie: TarifCategorie,
  code: string,
  prix: number
): Promise<Tarif | null> {
  try {
    const tarifRef = db
      .collection('tarifs')
      .doc(metier)
      .collection(categorie)
      .doc(code);

    const doc = await tarifRef.get();
    if (!doc.exists) {
      console.error(`Tarif ${code} non trouvé`);
      return null;
    }

    await tarifRef.update({ prix, updatedAt: new Date() });
    clearTarifsCache(); // Invalider le cache
    
    const updated = await tarifRef.get();
    return updated.data() as Tarif;
  } catch (error) {
    console.error(`Erreur updateTarif(${code}):`, error);
    return null;
  }
}

/**
 * Initialise les tarifs dans Firebase avec les valeurs par défaut
 */
export async function initializeTarifs(): Promise<{ success: boolean; count: number }> {
  try {
    const defaultTarifs = getDefaultTarifs();
    const metiers: Metier[] = ['serrurerie', 'plomberie', 'electricite'];
    const categories: TarifCategorie[] = ['main_oeuvre', 'materiaux'];
    let count = 0;

    for (const metier of metiers) {
      for (const categorie of categories) {
        const tarifs = defaultTarifs[metier][categorie];
        
        for (const tarif of tarifs) {
          await db
            .collection('tarifs')
            .doc(metier)
            .collection(categorie)
            .doc(tarif.code)
            .set({
              ...tarif,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          count++;
        }
      }
    }

    console.log(`✅ ${count} tarifs initialisés dans Firebase`);
    return { success: true, count };
  } catch (error) {
    console.error('Erreur initializeTarifs:', error);
    return { success: false, count: 0 };
  }
}

/**
 * Recherche un tarif par son code (utilise le cache)
 */
export async function getTarifByCode(code: string): Promise<Tarif | null> {
  try {
    // Déterminer le métier et la catégorie à partir du code
    const prefix = code.substring(0, 3);
    const type = code.substring(4, 6);
    
    let metier: Metier;
    if (prefix === 'SER') metier = 'serrurerie';
    else if (prefix === 'PLO') metier = 'plomberie';
    else if (prefix === 'ELE') metier = 'electricite';
    else return null;

    const categorie: TarifCategorie = type === 'MO' ? 'main_oeuvre' : 'materiaux';

    // Utiliser le cache
    const allTarifs = await getAllTarifs();
    const tarifs = allTarifs[metier][categorie];
    return tarifs.find(t => t.code === code) || null;
  } catch (error) {
    console.error(`Erreur getTarifByCode(${code}):`, error);
    return null;
  }
}

/**
 * Calcule le prix total d'une liste de lignes de devis
 */
export function calculateDevisTotal(lignes: { prixTotal?: number }[]): number {
  return lignes.reduce((sum, ligne) => sum + (ligne.prixTotal || 0), 0);
}

/**
 * Génère le prochain code disponible pour un métier et une catégorie
 */
export async function getNextCode(metier: Metier, categorie: TarifCategorie): Promise<string> {
  const prefix = metier === 'serrurerie' ? 'SER' : metier === 'plomberie' ? 'PLO' : 'ELE';
  const typeCode = categorie === 'main_oeuvre' ? 'MO' : 'MA';
  
  try {
    const snapshot = await db
      .collection('tarifs')
      .doc(metier)
      .collection(categorie)
      .orderBy('code', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return `${prefix}-${typeCode}-001`;
    }

    const lastCode = snapshot.docs[0].data().code as string;
    const lastNumber = parseInt(lastCode.split('-')[2], 10);
    const nextNumber = (lastNumber + 1).toString().padStart(3, '0');
    
    return `${prefix}-${typeCode}-${nextNumber}`;
  } catch (error) {
    console.error('Erreur getNextCode:', error);
    // Fallback avec timestamp
    return `${prefix}-${typeCode}-${Date.now().toString().slice(-3)}`;
  }
}

/**
 * Crée un nouveau tarif
 */
export async function createTarif(
  metier: Metier,
  categorie: TarifCategorie,
  designation: string,
  prix: number,
  unite: string
): Promise<Tarif | null> {
  try {
    const code = await getNextCode(metier, categorie);
    
    const newTarif: Tarif = {
      code,
      designation,
      prix,
      unite,
      categorie,
      metier,
    };

    await db
      .collection('tarifs')
      .doc(metier)
      .collection(categorie)
      .doc(code)
      .set({
        ...newTarif,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    clearTarifsCache(); // Invalider le cache
    console.log(`✅ Nouveau tarif créé: ${code} - ${designation}`);
    return newTarif;
  } catch (error) {
    console.error('Erreur createTarif:', error);
    return null;
  }
}

/**
 * Supprime un tarif
 */
export async function deleteTarif(
  metier: Metier,
  categorie: TarifCategorie,
  code: string
): Promise<boolean> {
  try {
    const tarifRef = db
      .collection('tarifs')
      .doc(metier)
      .collection(categorie)
      .doc(code);

    const doc = await tarifRef.get();
    if (!doc.exists) {
      console.error(`Tarif ${code} non trouvé`);
      return false;
    }

    await tarifRef.delete();
    clearTarifsCache(); // Invalider le cache
    console.log(`🗑️ Tarif supprimé: ${code}`);
    return true;
  } catch (error) {
    console.error(`Erreur deleteTarif(${code}):`, error);
    return false;
  }
}

