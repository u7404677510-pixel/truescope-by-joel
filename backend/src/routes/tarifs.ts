import { Router, Request, Response } from 'express';
import {
  getAllTarifs,
  getTarifsByMetier,
  updateTarif,
  initializeTarifs,
  getTarifByCode,
  createTarif,
  deleteTarif,
} from '../services/tarifs.js';
import type { Metier, TarifCategorie } from '../types/index.js';

const router = Router();

/**
 * GET /api/tarifs
 * Récupère tous les tarifs (tous métiers)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const tarifs = await getAllTarifs();
    res.json({
      success: true,
      data: tarifs,
    });
  } catch (error) {
    console.error('Erreur GET /tarifs:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des tarifs',
    });
  }
});

/**
 * GET /api/tarifs/:metier
 * Récupère les tarifs d'un métier spécifique
 */
router.get('/:metier', async (req: Request, res: Response) => {
  try {
    const { metier } = req.params;
    
    // Validation du métier
    const metiersValides: Metier[] = ['serrurerie', 'plomberie', 'electricite'];
    if (!metiersValides.includes(metier as Metier)) {
      return res.status(400).json({
        success: false,
        error: `Métier invalide. Valeurs acceptées: ${metiersValides.join(', ')}`,
      });
    }

    const tarifs = await getTarifsByMetier(metier as Metier);
    res.json({
      success: true,
      data: tarifs,
    });
  } catch (error) {
    console.error(`Erreur GET /tarifs/${req.params.metier}:`, error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des tarifs',
    });
  }
});

/**
 * GET /api/tarifs/code/:code
 * Récupère un tarif par son code
 */
router.get('/code/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const tarif = await getTarifByCode(code);
    
    if (!tarif) {
      return res.status(404).json({
        success: false,
        error: `Tarif ${code} non trouvé`,
      });
    }

    res.json({
      success: true,
      data: tarif,
    });
  } catch (error) {
    console.error(`Erreur GET /tarifs/code/${req.params.code}:`, error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du tarif',
    });
  }
});

/**
 * PUT /api/tarifs/:metier/:categorie/:code
 * Met à jour le prix d'un tarif
 */
router.put('/:metier/:categorie/:code', async (req: Request, res: Response) => {
  try {
    const { metier, categorie, code } = req.params;
    const { prix } = req.body;

    // Validations
    const metiersValides: Metier[] = ['serrurerie', 'plomberie', 'electricite'];
    if (!metiersValides.includes(metier as Metier)) {
      return res.status(400).json({
        success: false,
        error: `Métier invalide. Valeurs acceptées: ${metiersValides.join(', ')}`,
      });
    }

    const categoriesValides: TarifCategorie[] = ['main_oeuvre', 'materiaux'];
    if (!categoriesValides.includes(categorie as TarifCategorie)) {
      return res.status(400).json({
        success: false,
        error: `Catégorie invalide. Valeurs acceptées: ${categoriesValides.join(', ')}`,
      });
    }

    if (typeof prix !== 'number' || prix < 0) {
      return res.status(400).json({
        success: false,
        error: 'Le prix doit être un nombre positif',
      });
    }

    const updated = await updateTarif(
      metier as Metier,
      categorie as TarifCategorie,
      code,
      prix
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: `Tarif ${code} non trouvé`,
      });
    }

    res.json({
      success: true,
      data: updated,
      message: `Tarif ${code} mis à jour avec succès`,
    });
  } catch (error) {
    console.error(`Erreur PUT /tarifs:`, error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour du tarif',
    });
  }
});

/**
 * POST /api/tarifs/initialize
 * Initialise les tarifs avec les valeurs par défaut
 */
router.post('/initialize', async (req: Request, res: Response) => {
  try {
    const result = await initializeTarifs();
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de l\'initialisation des tarifs',
      });
    }

    res.json({
      success: true,
      message: `${result.count} tarifs initialisés avec succès`,
      count: result.count,
    });
  } catch (error) {
    console.error('Erreur POST /tarifs/initialize:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'initialisation des tarifs',
    });
  }
});

/**
 * POST /api/tarifs/:metier/:categorie
 * Crée un nouveau tarif
 */
router.post('/:metier/:categorie', async (req: Request, res: Response) => {
  try {
    const { metier, categorie } = req.params;
    const { designation, prix, unite } = req.body;

    // Validations
    const metiersValides: Metier[] = ['serrurerie', 'plomberie', 'electricite'];
    if (!metiersValides.includes(metier as Metier)) {
      return res.status(400).json({
        success: false,
        error: `Métier invalide. Valeurs acceptées: ${metiersValides.join(', ')}`,
      });
    }

    const categoriesValides: TarifCategorie[] = ['main_oeuvre', 'materiaux'];
    if (!categoriesValides.includes(categorie as TarifCategorie)) {
      return res.status(400).json({
        success: false,
        error: `Catégorie invalide. Valeurs acceptées: ${categoriesValides.join(', ')}`,
      });
    }

    if (!designation || typeof designation !== 'string' || designation.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'La désignation est requise',
      });
    }

    if (typeof prix !== 'number' || prix < 0) {
      return res.status(400).json({
        success: false,
        error: 'Le prix doit être un nombre positif',
      });
    }

    if (!unite || typeof unite !== 'string' || unite.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'L\'unité est requise',
      });
    }

    const newTarif = await createTarif(
      metier as Metier,
      categorie as TarifCategorie,
      designation.trim(),
      prix,
      unite.trim()
    );

    if (!newTarif) {
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la création du tarif',
      });
    }

    res.status(201).json({
      success: true,
      data: newTarif,
      message: `Tarif ${newTarif.code} créé avec succès`,
    });
  } catch (error) {
    console.error('Erreur POST /tarifs:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création du tarif',
    });
  }
});

/**
 * DELETE /api/tarifs/:metier/:categorie/:code
 * Supprime un tarif
 */
router.delete('/:metier/:categorie/:code', async (req: Request, res: Response) => {
  try {
    const { metier, categorie, code } = req.params;

    // Validations
    const metiersValides: Metier[] = ['serrurerie', 'plomberie', 'electricite'];
    if (!metiersValides.includes(metier as Metier)) {
      return res.status(400).json({
        success: false,
        error: `Métier invalide. Valeurs acceptées: ${metiersValides.join(', ')}`,
      });
    }

    const categoriesValides: TarifCategorie[] = ['main_oeuvre', 'materiaux'];
    if (!categoriesValides.includes(categorie as TarifCategorie)) {
      return res.status(400).json({
        success: false,
        error: `Catégorie invalide. Valeurs acceptées: ${categoriesValides.join(', ')}`,
      });
    }

    const deleted = await deleteTarif(
      metier as Metier,
      categorie as TarifCategorie,
      code
    );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: `Tarif ${code} non trouvé`,
      });
    }

    res.json({
      success: true,
      message: `Tarif ${code} supprimé avec succès`,
    });
  } catch (error) {
    console.error('Erreur DELETE /tarifs:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression du tarif',
    });
  }
});

export default router;

