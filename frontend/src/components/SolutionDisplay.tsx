import type { Solution } from '../types';
import './SolutionDisplay.css';

interface SolutionDisplayProps {
  solution: Solution;
}

// Widget statique (toujours ouvert)
function Widget({ 
  title, 
  children,
  variant = 'default'
}: { 
  title: string; 
  children: React.ReactNode;
  variant?: 'default' | 'primary';
}) {
  return (
    <div className={`widget open ${variant}`}>
      <div className={`widget-header ${variant}`}>
        <span className="widget-title">{title}</span>
      </div>
      <div className="widget-content">{children}</div>
    </div>
  );
}

function SolutionDisplay({ solution }: SolutionDisplayProps) {
  // Calcul du total
  const total = solution.lignesDevis
    ?.filter(l => l.prixTotal !== undefined)
    .reduce((sum, l) => sum + (l.prixTotal || 0), 0) || 0;

  return (
    <div className="solution-display-v2">
      
      {/* Widget 1: Description du problème */}
      <Widget title="Description du problème">
        <p className="problem-text">{solution.descriptionProbleme}</p>
      </Widget>

      {/* Widget 2: La solution TrueScope */}
      <Widget title="La solution TrueScope">
        <p className="solution-text">{solution.solutionTrueScope}</p>
      </Widget>

      {/* Widget 3: La proposition Joël */}
      <Widget title="La proposition Joël" variant="primary">
        {/* Phrase d'accroche */}
        <p className="proposition-accroche">{solution.propositionJoel}</p>
        
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
                    <td className="designation">
                      {ligne.designation}
                      {ligne.code && <code className="tarif-code">{ligne.code}</code>}
                    </td>
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
      </Widget>

      {/* Bouton CTA vers monjoel.fr */}
      <a 
        href="https://monjoel.fr" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="cta-button"
      >
        Trouver mon Joël
      </a>

      {/* Widget 4: Conseils de prévention */}
      {solution.conseilsPrevention && solution.conseilsPrevention.length > 0 && (
        <Widget title="Pour que ça n'arrive plus">
          <ul className="conseils-list">
            {solution.conseilsPrevention.map((conseil, i) => (
              <li key={i}>{conseil}</li>
            ))}
          </ul>
        </Widget>
      )}
    </div>
  );
}

export default SolutionDisplay;
