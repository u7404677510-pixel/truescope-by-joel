import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Charger .env immédiatement
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Initialisation de Firebase Admin SDK
function initializeFirebase() {
  // Vérifier si Firebase est déjà initialisé
  if (admin.apps.length > 0) {
    return admin.app();
  }

  // Option 1: Utiliser un fichier de service account
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  
  if (serviceAccountPath) {
    try {
      // Résoudre le chemin relatif depuis le dossier backend
      const absolutePath = resolve(process.cwd(), serviceAccountPath);
      const serviceAccount = JSON.parse(readFileSync(absolutePath, 'utf-8'));
      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } catch (error) {
      console.warn('Impossible de charger le fichier service account:', error);
      console.warn('Tentative avec les variables d\'environnement...');
    }
  }

  // Option 2: Utiliser les variables d'environnement
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (projectId && privateKey && clientEmail) {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        privateKey,
        clientEmail
      })
    });
  }

  // Option 3: Mode émulateur/développement local sans credentials
  console.warn('⚠️ Firebase initialisé en mode mock (pas de credentials trouvés)');
  console.warn('Pour la production, configurez FIREBASE_SERVICE_ACCOUNT_PATH ou les variables FIREBASE_*');
  
  // Retourner null pour indiquer qu'on utilise le mode mock
  return null;
}

// Initialiser Firebase
const app = initializeFirebase();

// Export du client Firestore
export const db = app ? getFirestore(app) : null;

// Collections Firestore
export const COLLECTIONS = {
  INTERVENTIONS: 'interventions',
  DEMANDES: 'demandes'
} as const;

export default admin;

