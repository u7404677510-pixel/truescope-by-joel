import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Charger les variables d'environnement
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV !== 'production',
  
  // Nombre maximum d'interventions similaires à retourner
  maxSimilarInterventions: 5,
  
  // Seuil minimum de score de similarité (0-1)
  minSimilarityScore: 0.3,
};

export * from './firebase.js';
export * from './gemini.js';

