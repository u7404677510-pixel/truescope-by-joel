import { getGeminiModel, generationConfig } from '../config/gemini.js';
import type { Metier, Intervention, Solution, LigneDevis, Variante, MediaFile, Materiel, Tarif } from '../types/index.js';
import { getTarifsByMetier, getTarifByCode } from './tarifs.js';

// Prompts système pour chaque métier
const METIER_CONTEXTS: Record<Metier, string> = {
  serrurerie: `Tu es un expert en serrurerie avec 20 ans d'expérience. Tu connais parfaitement :
- Les différents types de serrures (cylindre européen, à gorges, multipoints, etc.)
- Les techniques d'ouverture de porte (crochetage, by-pass, perçage, etc.)
- Les blindages de porte et leurs certifications (A2P BP1, BP2, BP3)
- Les problèmes courants : porte claquée, clé cassée dans la serrure, serrure grippée, effraction`,

  plomberie: `Tu es un expert en plomberie avec 20 ans d'expérience. Tu connais parfaitement :
- Les différents types de tuyauterie (cuivre, PER, multicouche, PVC)
- Les problèmes de fuite et leurs réparations
- Les installations sanitaires (WC, lavabo, douche, baignoire)
- Le chauffe-eau et la production d'eau chaude
- Les problèmes courants : fuite, bouchon, chasse d'eau défectueuse, ballon qui fuit`,

  electricite: `Tu es un expert en électricité avec 20 ans d'expérience. Tu connais parfaitement :
- Les normes électriques (NF C 15-100)
- Les tableaux électriques et disjoncteurs
- Les problèmes de court-circuit et de surcharge
- L'installation de prises, interrupteurs et éclairage
- Les problèmes courants : panne de courant, disjoncteur qui saute, prise défectueuse, tableau brûlé`
};

// Formater les tarifs pour le prompt
function formatTarifsForPrompt(tarifs: Tarif[]): string {
  return tarifs.map(t => `  - ${t.code}: ${t.designation} (${t.prix}€/${t.unite})`).join('\n');
}

// Prompt principal pour l'analyse
async function buildAnalysisPrompt(
  metier: Metier,
  description: string,
  mediaUrls: string[],
  interventionsSimilaires: Intervention[],
  uploadedMediaCount: number = 0
): Promise<string> {
  const contextMetier = METIER_CONTEXTS[metier];
  
  // Récupérer les tarifs du métier
  const tarifsMetier = await getTarifsByMetier(metier);
  const tarifsMainOeuvre = formatTarifsForPrompt(tarifsMetier.main_oeuvre);
  const tarifsMateriaux = formatTarifsForPrompt(tarifsMetier.materiaux);
  
  let similarContext = '';
  if (interventionsSimilaires.length > 0) {
    similarContext = `
## Interventions similaires déjà réalisées (pour référence)
${interventionsSimilaires.map((int, i) => `
### Intervention ${i + 1} (${int.problemType})
- Description: ${int.description}
- Solution appliquée: ${int.solution.description}
- Lignes de devis utilisées:
${int.solution.lignesDevis.map(l => `  - ${l.code || ''} ${l.designation} (${l.quantite} ${l.unite})`).join('\n')}
`).join('\n')}

Utilise ces interventions comme référence pour proposer une solution cohérente.
`;
  }

  let mediaContext = '';
  if (uploadedMediaCount > 0) {
    mediaContext = `\n## Photos fournies\nLe client a fourni ${uploadedMediaCount} photo(s) du problème qui sont jointes à ce message. ANALYSE CES IMAGES ATTENTIVEMENT pour identifier:
- L'état des éléments concernés (serrure, tuyau, tableau électrique, etc.)
- Les dégâts visibles
- Le type d'équipement/matériel
- Tout détail pertinent pour le diagnostic

Base ton diagnostic sur ces photos en plus de la description textuelle.`;
  } else if (mediaUrls.length > 0) {
    mediaContext = `\n## Médias mentionnés\nLe client a mentionné ${mediaUrls.length} photo(s)/vidéo(s) du problème.`;
  }

  return `${contextMetier}

# Mission
Tu dois analyser une demande de devis et proposer une solution technique structurée EN UTILISANT LES CODES TARIFS FOURNIS.

## GRILLE TARIFAIRE À UTILISER
Tu DOIS utiliser les codes tarifs suivants pour les lignes de devis. Choisis les codes les plus appropriés.

### Main d'œuvre disponible:
${tarifsMainOeuvre}

### Matériaux disponibles:
${tarifsMateriaux}

## Règles IMPORTANTES
1. Tu DOIS utiliser les CODES TARIFS (ex: SER-MO-002) dans tes lignes de devis.
2. Tu dois être précis et professionnel dans ton diagnostic.
3. Si plusieurs solutions sont possibles, propose des variantes.
4. Base-toi sur les interventions similaires si disponibles.
5. Liste TOUT le matériel nécessaire pour réaliser l'intervention.
6. Si tu détectes des MARQUES (ex: Fichet, Vachette, Grohe, Legrand), mentionne-les.
7. TOUJOURS inclure le déplacement dans les lignes de devis.

## Demande du client
**Métier**: ${metier}
**Description du problème**: ${description}
${mediaContext}
${similarContext}

## Format de réponse attendu (JSON strict)
Réponds UNIQUEMENT avec un objet JSON valide, sans commentaires ni texte avant ou après :
{
  "diagnostic": "Description détaillée du problème identifié",
  "description": "Description de la solution principale proposée",
  "materiel": [
    {
      "nom": "Nom du matériel/pièce/outil",
      "quantite": 1,
      "marque": "Marque si connue (optionnel)",
      "specifications": "Caractéristiques techniques (optionnel)"
    }
  ],
  "lignesDevis": [
    {
      "code": "CODE_TARIF (ex: SER-MO-001)",
      "designation": "Nom de la prestation",
      "unite": "unité (forfait, ml, pièce, etc.)",
      "quantite": 1,
      "notes": "notes optionnelles"
    }
  ],
  "variantes": [
    {
      "nom": "Nom de la variante",
      "description": "Description de cette alternative",
      "lignesDevis": [{ "code": "...", "designation": "...", "unite": "...", "quantite": 1 }],
      "avantages": ["avantage 1"],
      "inconvenients": ["inconvénient 1"]
    }
  ],
  "recommandations": ["conseil 1", "conseil 2"],
  "raisonnement": "Explication de ton analyse"
}
`;
}

// Interface pour la réponse parsée de Gemini
interface GeminiAnalysisResponse {
  diagnostic: string;
  description: string;
  materiel: Materiel[];
  lignesDevis: LigneDevis[];
  variantes?: Variante[];
  recommandations?: string[];
  raisonnement: string;
}

// Enrichir les lignes de devis avec les prix
async function enrichLignesDevisWithPrices(lignes: LigneDevis[]): Promise<LigneDevis[]> {
  const enriched: LigneDevis[] = [];
  
  for (const ligne of lignes) {
    if (ligne.code) {
      const tarif = await getTarifByCode(ligne.code);
      if (tarif) {
        // ✅ Tarif trouvé dans la base - on utilise le prix de la base
        enriched.push({
          ...ligne,
          designation: tarif.designation,
          unite: tarif.unite,
          prixUnitaire: tarif.prix,
          prixTotal: tarif.unite === '%' 
            ? undefined // Les majorations sont des pourcentages
            : tarif.prix * ligne.quantite,
          tarifManquant: false,
        });
      } else {
        // ⚠️ Tarif NON trouvé - on marque comme manquant, PAS de prix inventé
        console.warn(`⚠️ Tarif ${ligne.code} non trouvé dans la base de données`);
        enriched.push({
          ...ligne,
          tarifManquant: true,
          prixUnitaire: undefined,
          prixTotal: undefined,
        });
      }
    } else {
      // Ligne sans code tarif - on marque comme manquant
      enriched.push({
        ...ligne,
        tarifManquant: true,
        prixUnitaire: undefined,
        prixTotal: undefined,
      });
    }
  }
  
  return enriched;
}

// Service d'analyse Gemini
export async function analyzeWithGemini(
  metier: Metier,
  description: string,
  mediaUrls: string[],
  interventionsSimilaires: Intervention[],
  mediaFiles: MediaFile[] = []
): Promise<{ solution: Solution; raisonnement: string }> {
  const model = getGeminiModel();
  
  const prompt = await buildAnalysisPrompt(metier, description, mediaUrls, interventionsSimilaires, mediaFiles.length);

  // Préparer le contenu avec les images si disponibles
  const contentParts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [{ text: prompt }];

  // Ajouter les images uploadées pour analyse visuelle
  for (const mediaFile of mediaFiles) {
    // Ne traiter que les images (pas les vidéos pour l'instant)
    if (mediaFile.mimeType.startsWith('image/')) {
      contentParts.push({
        inlineData: {
          mimeType: mediaFile.mimeType,
          data: mediaFile.data
        }
      });
      console.log(`📸 Image ajoutée pour analyse: ${mediaFile.name} (${mediaFile.mimeType})`);
    }
  }

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: contentParts }],
      generationConfig,
    });

    const response = result.response;
    const text = response.text();
    
    // Extraire le JSON de la réponse
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Impossible de parser la réponse JSON de Gemini');
    }

    const parsed: GeminiAnalysisResponse = JSON.parse(jsonMatch[0]);

    // Enrichir les lignes de devis avec les prix
    const lignesDevisEnrichies = await enrichLignesDevisWithPrices(parsed.lignesDevis);
    
    // Enrichir les variantes aussi
    let variantesEnrichies: Variante[] | undefined;
    if (parsed.variantes) {
      variantesEnrichies = await Promise.all(
        parsed.variantes.map(async (v) => ({
          ...v,
          lignesDevis: await enrichLignesDevisWithPrices(v.lignesDevis),
        }))
      );
    }

    const solution: Solution = {
      diagnostic: parsed.diagnostic,
      description: parsed.description,
      materiel: parsed.materiel || [],
      lignesDevis: lignesDevisEnrichies,
      variantes: variantesEnrichies,
      recommandations: parsed.recommandations,
    };

    return {
      solution,
      raisonnement: parsed.raisonnement,
    };
  } catch (error) {
    console.error('Erreur lors de l\'appel à Gemini:', error);
    throw new Error(`Erreur d'analyse Gemini: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

// Extraire les mots-clés d'une description
export async function extractKeywords(
  metier: Metier,
  description: string,
  problemType: string
): Promise<string[]> {
  const model = getGeminiModel();

  const prompt = `Tu es un expert en ${metier}. Extrais les mots-clés pertinents de cette intervention pour faciliter les recherches futures.

Description: ${description}
Type de problème: ${problemType}

Réponds UNIQUEMENT avec un tableau JSON de mots-clés (5 à 10 mots-clés maximum), sans explication.
Exemple: ["serrure", "cylindre européen", "porte blindée", "ouverture", "urgence"]`;

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { ...generationConfig, temperature: 0.3 },
    });

    const text = result.response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback: extraire les mots importants manuellement
    return [metier, problemType, ...description.toLowerCase().split(/\s+/).filter(w => w.length > 4).slice(0, 5)];
  } catch (error) {
    console.error('Erreur extraction mots-clés:', error);
    return [metier, problemType];
  }
}

// Déterminer le type de problème
export async function determineProblemType(
  metier: Metier,
  description: string
): Promise<string> {
  const model = getGeminiModel();

  const problemTypes: Record<Metier, string[]> = {
    serrurerie: [
      'porte_claquee', 'cle_cassee', 'serrure_grippee', 'effraction', 
      'changement_serrure', 'blindage_porte', 'ouverture_coffre', 'autre_serrurerie'
    ],
    plomberie: [
      'fuite_tuyau', 'fuite_robinet', 'bouchon_canalisation', 'chasse_eau',
      'chauffe_eau', 'installation_sanitaire', 'degorgement', 'autre_plomberie'
    ],
    electricite: [
      'panne_courant', 'disjoncteur_saute', 'tableau_electrique', 'prise_defectueuse',
      'court_circuit', 'mise_aux_normes', 'installation_eclairage', 'autre_electricite'
    ]
  };

  const prompt = `Tu es un expert en ${metier}. Classe cette demande dans une catégorie.

Description: ${description}

Catégories possibles: ${problemTypes[metier].join(', ')}

Réponds UNIQUEMENT avec le nom de la catégorie (un seul mot, snake_case), sans explication.`;

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { ...generationConfig, temperature: 0.1 },
    });

    const text = result.response.text().trim().toLowerCase().replace(/[^a-z_]/g, '');
    
    if (problemTypes[metier].includes(text)) {
      return text;
    }
    
    return `autre_${metier}`;
  } catch (error) {
    console.error('Erreur détermination type problème:', error);
    return `autre_${metier}`;
  }
}
