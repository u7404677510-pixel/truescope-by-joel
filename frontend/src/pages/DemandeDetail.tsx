import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDemandeById } from '../services/api';
import type { Demande } from '../types';
import './DemandeDetail.css';

// Helper pour formater les dates
function formatDate(dateValue: string | { _seconds: number } | Date | undefined): string {
  if (!dateValue) return '';
  try {
    let date: Date;
    if (typeof dateValue === 'object' && '_seconds' in dateValue) {
      date = new Date(dateValue._seconds * 1000);
    } else if (typeof dateValue === 'string') {
      date = new Date(dateValue);
    } else {
      date = dateValue;
    }
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '';
  }
}

function DemandeDetail() {
  const { id } = useParams<{ id: string }>();
  const [demande, setDemande] = useState<Demande | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDemande() {
      if (!id) return;
      try {
        setIsLoading(true);
        const data = await getDemandeById(id);
        setDemande(data);
      } catch (err) {
        console.error('Erreur chargement demande:', err);
        setError('Impossible de charger le diagnostic');
      } finally {
        setIsLoading(false);
      }
    }
    loadDemande();
  }, [id]);

  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <span>Chargement...</span>
      </div>
    );
  }

  if (!demande) {
    return (
      <div className="demande-detail">
        <div className="empty-state">
          <p>Diagnostic non trouvé</p>
          <Link to="/historique" className="btn btn-primary">Retour à l'historique</Link>
        </div>
      </div>
    );
  }

  const solution = demande.solutionProposee;

  // Calcul du total
  const calculateTotal = () => {
    if (!solution?.lignesDevis) return 0;
    const subtotal = solution.lignesDevis
      .filter(l => l.prixTotal !== undefined && !l.tarifManquant)
      .reduce((sum, l) => sum + (l.prixTotal || 0), 0);
    
    // Appliquer les majorations (%)
    const majorations = solution.lignesDevis
      .filter(l => l.unite === '%' && !l.tarifManquant)
      .reduce((sum, l) => sum + (l.prixUnitaire || 0), 0);
    
    return subtotal * (1 + majorations / 100);
  };

  const total = calculateTotal();
  const hasMissingPrices = solution?.lignesDevis?.some(l => l.tarifManquant);

  return (
    <div className="demande-detail fade-in">
      {/* Header simplifié */}
      <header className="detail-header">
        <Link to="/historique" className="back-link">← Mes diagnostics</Link>
        <div className="header-info">
          <span className={`metier-badge ${demande.metier}`}>{demande.metier}</span>
          <span className="header-date">{formatDate(demande.createdAt)}</span>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* 4 Cartes TrueScope */}
      {solution && (
        <div className="truescope-cards">
          
          {/* Carte 1: On a compris ton problème */}
          <div className="truescope-card card-problem">
            <div className="card-header">
              <h2>Description du problème</h2>
            </div>
            <div className="card-content">
              <p>{solution.descriptionProbleme}</p>
            </div>
          </div>

          {/* Carte 2: La solution TrueScope */}
          <div className="truescope-card card-solution">
            <div className="card-header">
              <h2>La solution TrueScope</h2>
            </div>
            <div className="card-content">
              <p>{solution.solutionTrueScope}</p>
            </div>
          </div>

          {/* Carte 3: La proposition Joël (CTA + Devis) */}
          <div className="truescope-card card-cta">
            <div className="card-header">
              <h2>La proposition Joël</h2>
              {total > 0 && (
                <span className="total-badge">{total.toFixed(0)}€ HT</span>
              )}
            </div>
            <div className="card-content">
              <p className="proposition-text">{solution.propositionJoel}</p>
              
              {/* Tableau des lignes de devis */}
              {solution.lignesDevis && solution.lignesDevis.length > 0 && (
                <div className="devis-section">
                  <h3>Détail de l'intervention</h3>
                  <div className="devis-table">
                    {solution.lignesDevis.map((ligne, i) => (
                      <div key={i} className={`devis-row ${ligne.tarifManquant ? 'missing' : ''}`}>
                        <div className="devis-designation">
                          {ligne.designation}
                          {ligne.quantite > 1 && <span className="devis-qty">×{ligne.quantite}</span>}
                        </div>
                        <div className="devis-price">
                          {ligne.tarifManquant ? (
                            <span className="price-missing">—</span>
                          ) : ligne.unite === '%' ? (
                            <span className="price-percent">+{ligne.prixUnitaire}%</span>
                          ) : (
                            <span>{ligne.prixTotal?.toFixed(0)}€</span>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="devis-total">
                      <span>TOTAL ESTIMÉ HT</span>
                      <span className="total-value">
                        {hasMissingPrices ? '~' : ''}{total.toFixed(0)}€
                      </span>
                    </div>
                  </div>
                  {hasMissingPrices && (
                    <p className="devis-note">* Certains tarifs sont manquants dans la base</p>
                  )}
                </div>
              )}

              <div className="cta-buttons">
                <a 
                  href="https://monjoel.fr" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-cta btn-call"
                >
                  Trouver mon Joël
                </a>
              </div>
            </div>
          </div>

          {/* Carte 4: Nos conseils */}
          <div className="truescope-card card-tips">
            <div className="card-header">
              <h2>Pour que ça n'arrive plus</h2>
            </div>
            <div className="card-content">
              <ul className="tips-list">
                {solution.conseilsPrevention.map((conseil, i) => (
                  <li key={i}>{conseil}</li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default DemandeDetail;
