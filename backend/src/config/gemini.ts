import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Charger .env immédiatement
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { GoogleGenerativeAI } from '@google/generative-ai';

// Configuration du client Gemini
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('⚠️ GEMINI_API_KEY non configurée. Le service Gemini ne fonctionnera pas.');
}

// Initialisation du client Google Generative AI
export const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Modèle Gemini pour le raisonnement
export const getGeminiModel = () => {
  if (!genAI) {
    throw new Error('GEMINI_API_KEY non configurée');
  }
  // Utiliser Gemini 2.0 Flash - rapide et efficace
  return genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
};

// Configuration des paramètres de génération - optimisée pour la vitesse
export const generationConfig = {
  temperature: 0.5,
  topP: 0.9,
  topK: 30,
  maxOutputTokens: 1024, // Réduit car on a besoin de peu de texte
};

export default genAI;

