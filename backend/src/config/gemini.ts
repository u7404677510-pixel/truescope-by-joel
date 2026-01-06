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
  // Utiliser Gemini 3 Pro Preview
  return genAI.getGenerativeModel({ model: 'gemini-3-pro-preview' });
};

// Configuration des paramètres de génération
export const generationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
};

export default genAI;

