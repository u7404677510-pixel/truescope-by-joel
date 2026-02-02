import { getGeminiModel, generationConfig } from '../config/gemini.js';
import type { Metier, Intervention, Solution, MediaFile } from '../types/index.js';

// Noms sympas pour chaque métier
const METIER_NAMES: Record<Metier, string> = {
  serrurerie: 'serrurerie',
  plomberie: 'plomberie',
  electricite: 'électricité'
};

// Prompt principal pour l'analyse TrueScope (diagnostic GRATUIT, sans prix)
function buildAnalysisPrompt(
  metier: Metier,
  description: string,
  uploadedMediaCount: number = 0
): string {
  const metierName = METIER_NAMES[metier];
  
  let mediaContext = '';
  if (uploadedMediaCount > 0) {
    mediaContext = `\n\nLe client a fourni ${uploadedMediaCount} photo(s) du problème. ANALYSE CES IMAGES pour mieux comprendre la situation.`;
  }

  return `Tu es TrueScope, un assistant sympa qui aide les gens à comprendre leurs problèmes de ${metierName}.

## Ton style
- Parle comme un ami qui s'y connaît
- Sois rassurant mais honnête  
- Un peu d'humour, sans en faire trop
- Pas de jargon technique (ou explique simplement)
- Tutoie l'utilisateur
- Sois concis et va droit au but

## Problème décrit par l'utilisateur
"${description}"${mediaContext}

## Ta mission
Réponds en JSON avec ces 4 sections :

1. **descriptionProbleme** : Reformule ce que tu as compris du problème en 2-3 phrases max. Commence par "OK, je vois..." ou "Ah, classique ça..." ou "Hmm, intéressant...".

2. **solutionTrueScope** : Explique simplement ce qu'il faut faire pour résoudre ça. 2-4 phrases max. Donne une idée du temps que ça prend.

3. **propositionJoel** : UNE SEULE phrase accrocheuse qui donne envie de contacter un pro. Genre "Un artisan peut régler ça en 30 min chrono !"

4. **conseilsPrevention** : 2-3 conseils COURTS pour éviter que ça se reproduise.

## Format de réponse (JSON strict)
{
  "descriptionProbleme": "Ta reformulation sympa",
  "solutionTrueScope": "L'explication simple de la solution",
  "propositionJoel": "Ta phrase d'accroche pour contacter Joël",
  "conseilsPrevention": ["Conseil 1", "Conseil 2", "Conseil 3"]
}
`;
}

// Interface pour la réponse parsée de Gemini
interface GeminiAnalysisResponse {
  descriptionProbleme: string;
  solutionTrueScope: string;
  propositionJoel: string;
  conseilsPrevention: string[];
}

// Service d'analyse Gemini - Version TrueScope (diagnostic GRATUIT)
export async function analyzeWithGemini(
  metier: Metier,
  description: string,
  mediaUrls: string[],
  interventionsSimilaires: Intervention[],
  mediaFiles: MediaFile[] = []
): Promise<{ solution: Solution }> {
  const model = getGeminiModel();
  
  const prompt = buildAnalysisPrompt(metier, description, mediaFiles.length);

  // Préparer le contenu avec les images si disponibles
  const contentParts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [{ text: prompt }];

  // Ajouter les images uploadées pour analyse visuelle
  for (const mediaFile of mediaFiles) {
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

    // Construire la solution (sans prix, c'est un diagnostic GRATUIT)
    const solution: Solution = {
      descriptionProbleme: parsed.descriptionProbleme,
      solutionTrueScope: parsed.solutionTrueScope,
      propositionJoel: parsed.propositionJoel,
      conseilsPrevention: parsed.conseilsPrevention || [],
    };

    return { solution };
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
