import { Router, Request, Response } from 'express';
import { JoelCore } from '../services/joel-core.js';
import type { CreateDemandeRequest, ValidateDemandeRequest, Metier } from '../types/index.js';

const router = Router();

/**
 * POST /api/demandes
 * Créer et analyser une nouvelle demande de devis
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { metier, description, mediaUrls, mediaFiles } = req.body as CreateDemandeRequest;

    // Validation des données
    if (!metier || !description) {
      return res.status(400).json({
        error: 'Les champs "metier" et "description" sont requis',
      });
    }

    const validMetiers: Metier[] = ['serrurerie', 'plomberie', 'electricite'];
    if (!validMetiers.includes(metier)) {
      return res.status(400).json({
        error: `Le métier doit être l'un des suivants: ${validMetiers.join(', ')}`,
      });
    }

    // Créer et analyser la demande
    const result = await JoelCore.createAndAnalyzeDemande({
      metier,
      description,
      mediaUrls: mediaUrls || [],
      mediaFiles: mediaFiles || [],
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Erreur création demande:', error);
    res.status(500).json({
      error: 'Erreur lors de la création de la demande',
      details: error instanceof Error ? error.message : 'Erreur inconnue',
    });
  }
});

/**
 * GET /api/demandes
 * Récupérer toutes les demandes
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, metier, limit } = req.query;

    const demandes = await JoelCore.getAllDemandes({
      status: status as any,
      metier: metier as Metier,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });

    res.json({
      success: true,
      data: demandes,
      count: demandes.length,
    });
  } catch (error) {
    console.error('Erreur récupération demandes:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des demandes',
    });
  }
});

/**
 * GET /api/demandes/:id
 * Récupérer une demande par son ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const demande = await JoelCore.getDemandeById(id);

    if (!demande) {
      return res.status(404).json({
        error: 'Demande non trouvée',
      });
    }

    res.json({
      success: true,
      data: demande,
    });
  } catch (error) {
    console.error('Erreur récupération demande:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération de la demande',
    });
  }
});

/**
 * POST /api/demandes/:id/validate
 * Valider une demande et l'enregistrer comme intervention de référence
 */
router.post('/:id/validate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { solutionFinale, problemType, keywords } = req.body as ValidateDemandeRequest;

    // Validation
    if (!solutionFinale || !problemType) {
      return res.status(400).json({
        error: 'Les champs "solutionFinale" et "problemType" sont requis',
      });
    }

    const intervention = await JoelCore.validateDemande(id, {
      solutionFinale,
      problemType,
      keywords,
    });

    res.json({
      success: true,
      message: 'Demande validée et enregistrée comme intervention de référence',
      data: intervention,
    });
  } catch (error) {
    console.error('Erreur validation demande:', error);
    res.status(500).json({
      error: 'Erreur lors de la validation de la demande',
      details: error instanceof Error ? error.message : 'Erreur inconnue',
    });
  }
});

/**
 * POST /api/demandes/:id/reanalyze
 * Ré-analyser une demande existante
 */
router.post('/:id/reanalyze', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await JoelCore.reanalyzeDemande(id);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Erreur réanalyse demande:', error);
    res.status(500).json({
      error: 'Erreur lors de la réanalyse de la demande',
      details: error instanceof Error ? error.message : 'Erreur inconnue',
    });
  }
});

/**
 * GET /api/demandes/:id/problem-type
 * Déterminer automatiquement le type de problème
 */
router.get('/:id/problem-type', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const demande = await JoelCore.getDemandeById(id);

    if (!demande) {
      return res.status(404).json({
        error: 'Demande non trouvée',
      });
    }

    const problemType = await JoelCore.determineProblemType(demande.metier, demande.description);

    res.json({
      success: true,
      data: { problemType },
    });
  } catch (error) {
    console.error('Erreur détermination type problème:', error);
    res.status(500).json({
      error: 'Erreur lors de la détermination du type de problème',
    });
  }
});

export default router;

