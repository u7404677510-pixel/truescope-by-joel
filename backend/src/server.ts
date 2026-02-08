// Charger les variables d'environnement EN PREMIER
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

// En production, les variables sont dans l'environnement (Render), pas dans un fichier .env
if (existsSync(envPath)) {
  console.log('📁 Chargement .env depuis:', envPath);
  const result = dotenv.config({ path: envPath });
  if (result.parsed) {
    console.log('✅ Variables chargées depuis .env:', Object.keys(result.parsed));
  }
} else {
  console.log('☁️ Mode production: variables d\'environnement chargées depuis le serveur');
}

import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import apiRoutes from './routes/index.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Augmenté pour permettre l'upload d'images en base64
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Routes API
app.use('/api', apiRoutes);

// Route racine
app.get('/', (req, res) => {
  res.json({
    name: 'Joël Wrapper',
    description: 'Système intelligent de devis pour serrurerie, plomberie et électricité',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      demandes: '/api/demandes',
      interventions: '/api/interventions',
      stats: '/api/interventions/stats',
      search: '/api/interventions/search',
    },
  });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.path,
  });
});

// Gestion globale des erreurs
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erreur non gérée:', err);
  res.status(500).json({
    error: 'Erreur interne du serveur',
    details: config.isDev ? err.message : undefined,
  });
});

// Démarrer le serveur
const PORT = config.port;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🔧  JOËL WRAPPER - Système de Devis Intelligent  🔧    ║
║                                                           ║
║   Serveur démarré sur le port ${PORT}                        ║
║   Mode: ${config.isDev ? 'Développement' : 'Production'}                               ║
║                                                           ║
║   Endpoints:                                              ║
║   • API:    http://localhost:${PORT}/api                     ║
║   • Santé:  http://localhost:${PORT}/api/health              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;

