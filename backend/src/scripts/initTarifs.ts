/**
 * Script pour initialiser les tarifs dans Firebase
 * Exécution: npx tsx src/scripts/initTarifs.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Charger les variables d'environnement
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { initializeTarifs, getAllTarifs } from '../services/tarifs.js';

async function main() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║   Initialisation des tarifs dans Firebase      ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  try {
    // Vérifier si des tarifs existent déjà
    console.log('📋 Vérification des tarifs existants...\n');
    const existingTarifs = await getAllTarifs();
    
    const totalExisting = 
      existingTarifs.serrurerie.main_oeuvre.length +
      existingTarifs.serrurerie.materiaux.length +
      existingTarifs.plomberie.main_oeuvre.length +
      existingTarifs.plomberie.materiaux.length +
      existingTarifs.electricite.main_oeuvre.length +
      existingTarifs.electricite.materiaux.length;

    console.log(`📊 Tarifs actuellement en base: ${totalExisting}\n`);

    // Initialiser les tarifs
    console.log('🚀 Initialisation des tarifs...\n');
    const result = await initializeTarifs();

    if (result.success) {
      console.log('\n╔════════════════════════════════════════════════╗');
      console.log(`║   ✅ ${result.count} tarifs initialisés avec succès!     ║`);
      console.log('╚════════════════════════════════════════════════╝\n');

      // Afficher le résumé
      const newTarifs = await getAllTarifs();
      console.log('📋 Résumé par métier:\n');
      console.log('  🔑 Serrurerie:');
      console.log(`     - Main d'œuvre: ${newTarifs.serrurerie.main_oeuvre.length} tarifs`);
      console.log(`     - Matériaux: ${newTarifs.serrurerie.materiaux.length} tarifs`);
      console.log('  🚿 Plomberie:');
      console.log(`     - Main d'œuvre: ${newTarifs.plomberie.main_oeuvre.length} tarifs`);
      console.log(`     - Matériaux: ${newTarifs.plomberie.materiaux.length} tarifs`);
      console.log('  ⚡ Électricité:');
      console.log(`     - Main d'œuvre: ${newTarifs.electricite.main_oeuvre.length} tarifs`);
      console.log(`     - Matériaux: ${newTarifs.electricite.materiaux.length} tarifs`);
      console.log('\n');
    } else {
      console.error('❌ Erreur lors de l\'initialisation des tarifs');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }

  process.exit(0);
}

main();

