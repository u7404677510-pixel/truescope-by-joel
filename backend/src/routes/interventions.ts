import { Router, Request, Response } from 'express';
import {
  findSimilarInterventions,
  getInterventionsByMetier,
  getInterventionById,
  getInterventionsStats,
} from '../services/similarity.js';
import { JoelCore } from '../services/joel-core.js';
import type { Metier } from '../types/index.js';

const router = Router();

/**
 * GET /api/interventions
 * Récupérer les interventions de référence
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { metier } = req.query;

    if (metier) {
      const validMetiers: Metier[] = ['serrurerie', 'plomberie', 'electricite'];
      if (!validMetiers.includes(metier as Metier)) {
        return res.status(400).json({
          error: `Le métier doit être l'un des suivants: ${validMetiers.join(', ')}`,
        });
      }

      const interventions = await getInterventionsByMetier(metier as Metier);
      return res.json({
        success: true,
        data: interventions,
        count: interventions.length,
      });
    }

    // Si pas de métier spécifié, retourner toutes les interventions de tous les métiers
    const allInterventions = await Promise.all([
      getInterventionsByMetier('serrurerie'),
      getInterventionsByMetier('plomberie'),
      getInterventionsByMetier('electricite'),
    ]);

    const interventions = allInterventions.flat();

    res.json({
      success: true,
      data: interventions,
      count: interventions.length,
    });
  } catch (error) {
    console.error('Erreur récupération interventions:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des interventions',
    });
  }
});

/**
 * GET /api/interventions/stats
 * Statistiques sur les interventions
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const [interventionStats, systemStats] = await Promise.all([
      getInterventionsStats(),
      JoelCore.getSystemStats(),
    ]);

    res.json({
      success: true,
      data: {
        interventions: interventionStats,
        systeme: systemStats,
      },
    });
  } catch (error) {
    console.error('Erreur récupération stats:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des statistiques',
    });
  }
});

/**
 * GET /api/interventions/search
 * Rechercher des interventions similaires
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { metier, description, keywords } = req.query;

    if (!metier || !description) {
      return res.status(400).json({
        error: 'Les paramètres "metier" et "description" sont requis',
      });
    }

    const validMetiers: Metier[] = ['serrurerie', 'plomberie', 'electricite'];
    if (!validMetiers.includes(metier as Metier)) {
      return res.status(400).json({
        error: `Le métier doit être l'un des suivants: ${validMetiers.join(', ')}`,
      });
    }

    const keywordsList = keywords 
      ? (keywords as string).split(',').map(k => k.trim())
      : [];

    const results = await findSimilarInterventions(
      metier as Metier,
      description as string,
      keywordsList
    );

    res.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error) {
    console.error('Erreur recherche interventions:', error);
    res.status(500).json({
      error: 'Erreur lors de la recherche d\'interventions',
    });
  }
});

/**
 * GET /api/interventions/:id
 * Récupérer une intervention par son ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const intervention = await getInterventionById(id);

    if (!intervention) {
      return res.status(404).json({
        error: 'Intervention non trouvée',
      });
    }

    res.json({
      success: true,
      data: intervention,
    });
  } catch (error) {
    console.error('Erreur récupération intervention:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération de l\'intervention',
    });
  }
});

export default router;

