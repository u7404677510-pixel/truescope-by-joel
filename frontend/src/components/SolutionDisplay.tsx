import type { Solution, Intervention } from '../types';
import './SolutionDisplay.css';

interface SolutionDisplayProps {
  solution: Solution;
  confiance?: 'haute' | 'moyenne' | 'basse';
  raisonnement?: string;
  interventionsSimilaires?: Intervention[];
  showVariantes?: boolean;
}

function SolutionDisplay({ 
  solution, 
  confiance, 
  raisonnement, 
  interventionsSimilaires = [],
  showVariantes = true 
}: SolutionDisplayProps) {
  return (
    <div className="solution-display fade-in">
      {/* En-tête avec confiance */}
      <div className="solution-header">
        <div className="solution-header-content">
          <h3 className="solution-title">💡 Solution proposée par Joël</h3>
          {confiance && (
            <span className={`confidence ${confiance}`}>
              {confiance === 'haute' && '✓ Confiance élevée'}
              {confiance === 'moyenne' && '○ Confiance moyenne'}
              {confiance === 'basse' && '⚠ Confiance basse'}
            </span>
          )}
        </div>
        <p className="solution-diagnostic">{solution.diagnostic}</p>
      </div>

      {/* Corps de la solution */}
      <div className="solution-body">
        {/* Description */}
        <div className="solution-section">
          <h4 className="subsection-title">Description de l'intervention</h4>
          <p className="solution-description">{solution.description}</p>
        </div>

        {/* Matériel nécessaire */}
        {solution.materiel && solution.materiel.length > 0 && (
          <div className="solution-section materiel-section">
            <h4 className="subsection-title">🧰 Matériel nécessaire</h4>
            <div className="materiel-grid">
              {solution.materiel.map((item, index) => (
                <div key={index} className="materiel-item">
                  <div className="materiel-header">
                    <span className="materiel-nom">{item.nom}</span>
                    {item.quantite && item.quantite > 1 && (
                      <span className="materiel-quantite">×{item.quantite}</span>
                    )}
                  </div>
                  {(item.marque || item.specifications) && (
                    <div className="materiel-details">
                      {item.marque && (
                        <span className="materiel-marque">{item.marque}</span>
                      )}
                      {item.specifications && (
                        <span className="materiel-specs">{item.specifications}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lignes de devis */}
        <div className="solution-section">
          <h4 className="subsection-title">Lignes de devis proposées</h4>
          <table className="devis-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Désignation</th>
                <th>Qté</th>
                <th>P.U.</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {solution.lignesDevis.map((ligne, index) => (
                <tr key={index}>
                  <td className="code-cell">
                    {ligne.code ? <code>{ligne.code}</code> : '-'}
                  </td>
                  <td>{ligne.designation}</td>
                  <td className="mono center">{ligne.quantite} {ligne.unite}</td>
                  <td className="mono price-cell">
                    {ligne.prixUnitaire !== undefined 
                      ? `${ligne.prixUnitaire.toFixed(2)} €` 
                      : '-'}
                  </td>
                  <td className="mono price-cell total">
                    {ligne.prixTotal !== undefined 
                      ? `${ligne.prixTotal.toFixed(2)} €` 
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
            {solution.lignesDevis.some(l => l.prixTotal !== undefined) && (
              <tfoot>
                <tr className="total-row">
                  <td colSpan={4} className="total-label">Total HT</td>
                  <td className="mono price-cell total">
                    {solution.lignesDevis
                      .reduce((sum, l) => sum + (l.prixTotal || 0), 0)
                      .toFixed(2)} €
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Recommandations */}
        {solution.recommandations && solution.recommandations.length > 0 && (
          <div className="solution-section">
            <h4 className="subsection-title">📋 Recommandations</h4>
            <ul className="recommendations-list">
              {solution.recommandations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Variantes */}
        {showVariantes && solution.variantes && solution.variantes.length > 0 && (
          <div className="solution-section variantes-section">
            <h4 className="subsection-title">🔄 Variantes possibles</h4>
            <div className="variantes-grid">
              {solution.variantes.map((variante, index) => (
                <div key={index} className="variante-card">
                  <h5 className="variante-title">{variante.nom}</h5>
                  <p className="variante-description">{variante.description}</p>
                  
                  {variante.avantages && variante.avantages.length > 0 && (
                    <div className="variante-pros">
                      <span className="pros-label">✓ Avantages:</span>
                      <ul>
                        {variante.avantages.map((a, i) => <li key={i}>{a}</li>)}
                      </ul>
                    </div>
                  )}
                  
                  {variante.inconvenients && variante.inconvenients.length > 0 && (
                    <div className="variante-cons">
                      <span className="cons-label">✗ Inconvénients:</span>
                      <ul>
                        {variante.inconvenients.map((c, i) => <li key={i}>{c}</li>)}
                      </ul>
                    </div>
                  )}

                  <details className="variante-devis">
                    <summary>Voir les lignes de devis</summary>
                    <table className="devis-table small">
                      <thead>
                        <tr>
                          <th>Désignation</th>
                          <th>Qté</th>
                        </tr>
                      </thead>
                      <tbody>
                        {variante.lignesDevis.map((ligne, i) => (
                          <tr key={i}>
                            <td>{ligne.designation}</td>
                            <td className="mono">{ligne.quantite} {ligne.unite}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </details>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Raisonnement IA */}
        {raisonnement && (
          <div className="solution-section raisonnement-section">
            <details className="raisonnement-details">
              <summary>
                <span className="raisonnement-icon">🤖</span>
                Voir le raisonnement de Joël
              </summary>
              <div className="raisonnement-content">
                {raisonnement}
              </div>
            </details>
          </div>
        )}

        {/* Interventions similaires */}
        {interventionsSimilaires.length > 0 && (
          <div className="solution-section similaires-section">
            <details className="similaires-details">
              <summary>
                <span className="similaires-icon">📚</span>
                {interventionsSimilaires.length} intervention(s) similaire(s) trouvée(s)
              </summary>
              <div className="similaires-list">
                {interventionsSimilaires.map((int, index) => (
                  <div key={int.id || index} className="similaire-item">
                    <span className={`badge badge-${int.metier}`}>{int.metier}</span>
                    <span className="similaire-type">{int.problemType}</span>
                    <p className="similaire-desc">{int.description.substring(0, 100)}...</p>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

export default SolutionDisplay;

