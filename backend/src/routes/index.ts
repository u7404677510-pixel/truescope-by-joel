import { Router } from 'express';
import demandesRouter from './demandes.js';
import interventionsRouter from './interventions.js';
import tarifsRouter from './tarifs.js';

const router = Router();

// Routes principales
router.use('/demandes', demandesRouter);
router.use('/interventions', interventionsRouter);
router.use('/tarifs', tarifsRouter);

// Route de santé
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'joel-wrapper',
    timestamp: new Date().toISOString(),
  });
});

export default router;

