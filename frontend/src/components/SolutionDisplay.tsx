import type { Solution } from '../types';
import './SolutionDisplay.css';

interface SolutionDisplayProps {
  solution: Solution;
}

function SolutionDisplay({ solution }: SolutionDisplayProps) {
  // Calcul du total
  const total = solution.lignesDevis
    ?.filter(l => l.prixTotal !== undefined)
    .reduce((sum, l) => sum + (l.prixTotal || 0), 0) || 0;

  return (
    <div className="solution-display-v2">
      
      {/* Phrase résumé sympathique */}
      <div className="solution-summary">
        <p className="summary-text">{solution.propositionJoel}</p>
      </div>

      {/* Devis Joël */}
      <div className="devis-card">
        <div className="devis-header">
          <span className="devis-title">Devis estimatif Joël</span>
          <span className="devis-badge">Prix garanti</span>
        </div>
        
        {/* Tableau des lignes de devis */}
        {solution.lignesDevis && solution.lignesDevis.length > 0 && (
          <div className="devis-container">
            <table className="devis-table">
              <thead>
                <tr>
                  <th>Désignation</th>
                  <th className="col-qty">Qté</th>
                  <th className="col-price">Prix</th>
                </tr>
              </thead>
              <tbody>
                {solution.lignesDevis.map((ligne, i) => (
                  <tr key={i} className={ligne.tarifManquant ? 'missing' : ''}>
                    <td className="designation">{ligne.designation}</td>
                    <td className="qty">{ligne.quantite}</td>
                    <td className="price">
                      {ligne.tarifManquant ? (
                        <span className="no-price">—</span>
                      ) : ligne.unite === '%' ? (
                        <span className="percent">+{ligne.prixUnitaire}%</span>
                      ) : (
                        <span>{ligne.prixTotal?.toFixed(0)}€</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="total-row">
                  <td colSpan={2}>Total estimé HT</td>
                  <td className="total-price">{total.toFixed(0)}€</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        <p className="devis-guarantee">Ce tarif est garanti par le réseau Joël</p>
      </div>

      {/* Bouton CTA vers monjoel.fr */}
      <a 
        href="https://monjoel.fr" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="cta-button"
      >
        Trouver mon Joël
      </a>
    </div>
  );
}

export default SolutionDisplay;
