// Les variables d'environnement sont chargées dans server.ts
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

