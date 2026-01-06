import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getDemandeById, validateDemande, getProblemType, reanalyzeDemande } from '../services/api';
import type { Demande, AnalyseResponse } from '../types';
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

// Composant carte expansive
interface ExpandableCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: React.ReactNode;
}

function ExpandableCard({ title, icon, children, defaultOpen = false, badge }: ExpandableCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`expandable-card ${isOpen ? 'open' : ''}`}>
      <button className="card-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="card-header-left">
          {icon && <span className="card-icon">{icon}</span>}
          <span className="card-title">{title}</span>
          {badge}
        </div>
        <span className="card-chevron">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>
      <div className="card-content">
        <div className="card-content-inner">
          {children}
        </div>
      </div>
    </div>
  );
}

// Icônes SVG
const DiagnosticIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ToolsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

const ListIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const LightbulbIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const BrainIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2a4 4 0 0 1 4 4c0 1.1-.45 2.1-1.18 2.82L12 12l-2.82-3.18A4 4 0 0 1 12 2z" />
    <path d="M12 22v-8" />
    <path d="M8 14a4 4 0 0 0-4 4 4 4 0 0 0 4 4" />
    <path d="M16 14a4 4 0 0 1 4 4 4 4 0 0 1-4 4" />
  </svg>
);

const VariantIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
  </svg>
);

const EuroIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 10h12M4 14h12M6 6a6 6 0 0 1 0 12" />
  </svg>
);

function DemandeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [demande, setDemande] = useState<Demande | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
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
        setError('Impossible de charger la demande');
      } finally {
        setIsLoading(false);
      }
    }
    loadDemande();
  }, [id]);

  const handleValidate = async () => {
    if (!demande || !demande.solutionProposee) return;
    try {
      setIsValidating(true);
      setError(null);
      const problemType = await getProblemType(demande.id);
      await validateDemande(demande.id, demande.solutionProposee, problemType);
      navigate('/historique', { state: { message: 'Demande validée avec succès !' } });
    } catch (err) {
      console.error('Erreur validation:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la validation');
    } finally {
      setIsValidating(false);
    }
  };

  const handleReanalyze = async () => {
    if (!demande) return;
    try {
      setIsReanalyzing(true);
      setError(null);
      const result: AnalyseResponse = await reanalyzeDemande(demande.id);
      setDemande(result.demande);
    } catch (err) {
      console.error('Erreur réanalyse:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la réanalyse');
    } finally {
      setIsReanalyzing(false);
    }
  };

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
          <p>Demande non trouvée</p>
          <Link to="/historique" className="btn btn-primary">Retour à l'historique</Link>
        </div>
      </div>
    );
  }

  const solution = demande.solutionProposee;

  return (
    <div className="demande-detail fade-in">
      {/* Header compact */}
      <header className="detail-header">
        <Link to="/historique" className="back-link">← Retour</Link>
        <div className="header-info">
          <h1>Demande #{demande.id.slice(0, 8)}</h1>
          <div className="header-badges">
            <span className={`metier-badge ${demande.metier}`}>{demande.metier}</span>
            <span className={`status-badge ${demande.status}`}>
              {demande.status === 'pending' && 'En attente'}
              {demande.status === 'analyzed' && 'Analysée'}
              {demande.status === 'validated' && 'Validée'}
            </span>
          </div>
        </div>
        <span className="header-date">{formatDate(demande.createdAt)}</span>
      </header>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Cartes expansives */}
      <div className="cards-container">
        {/* Description du problème */}
        <ExpandableCard 
          title="Description du problème" 
          icon={<ListIcon />}
          defaultOpen={true}
        >
          <p className="description-text">{demande.description}</p>
        </ExpandableCard>

        {/* Solution proposée */}
        {solution && (
          <ExpandableCard 
            title="Solution proposée par Joël" 
            icon={<DiagnosticIcon />}
            defaultOpen={true}
          >
            <div className="solution-content">
              <div className="diagnostic-box">
                <strong>Diagnostic</strong>
                <p>{solution.diagnostic}</p>
              </div>
              <div className="intervention-box">
                <strong>Intervention recommandée</strong>
                <p>{solution.description}</p>
              </div>
            </div>
          </ExpandableCard>
        )}

        {/* Matériel nécessaire */}
        {solution?.materiel && solution.materiel.length > 0 && (
          <ExpandableCard 
            title="Matériel nécessaire" 
            icon={<ToolsIcon />}
            badge={<span className="count-badge">{solution.materiel.length}</span>}
          >
            <div className="materiel-list">
              {solution.materiel.map((item, i) => (
                <div key={i} className="materiel-item">
                  <span className="materiel-name">{item.nom}</span>
                  {item.quantite && item.quantite > 1 && (
                    <span className="materiel-qty">×{item.quantite}</span>
                  )}
                  {item.marque && <span className="materiel-brand">{item.marque}</span>}
                  {item.specifications && <span className="materiel-spec">{item.specifications}</span>}
                </div>
              ))}
            </div>
          </ExpandableCard>
        )}

        {/* Estimation tarifaire */}
        {solution && solution.lignesDevis.some(l => l.prixTotal !== undefined) && (
          <ExpandableCard 
            title="Estimation tarifaire" 
            icon={<EuroIcon />}
            defaultOpen={true}
            badge={
              <span className="price-badge">
                {solution.lignesDevis
                  .filter(l => l.prixTotal !== undefined)
                  .reduce((sum, l) => sum + (l.prixTotal || 0), 0)
                  .toFixed(2)} € HT
              </span>
            }
          >
            <div className="estimation-container">
              {/* Alerte si des tarifs sont manquants */}
              {solution.lignesDevis.some(l => l.tarifManquant) && (
                <div className="tarif-warning">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <span>
                    Certains éléments n'ont pas de tarif dans la base de données. 
                    <strong> Ajoutez-les dans l'espace Admin</strong> pour un calcul complet.
                  </span>
                </div>
              )}

              <div className="estimation-table">
                <div className="estimation-header">
                  <span className="col-code">Code</span>
                  <span className="col-designation">Désignation</span>
                  <span className="col-qty">Qté</span>
                  <span className="col-unit-price">P.U.</span>
                  <span className="col-total">Total</span>
                </div>
                {solution.lignesDevis.map((ligne, i) => (
                  <div key={i} className={`estimation-row ${ligne.tarifManquant ? 'missing-tarif' : ''}`}>
                    <span className="col-code">
                      {ligne.code || '-'}
                      {ligne.tarifManquant && <span className="missing-badge">Non trouvé</span>}
                    </span>
                    <span className="col-designation">{ligne.designation}</span>
                    <span className="col-qty">{ligne.quantite} {ligne.unite}</span>
                    <span className="col-unit-price">
                      {ligne.tarifManquant 
                        ? <span className="no-price">À définir</span>
                        : ligne.prixUnitaire !== undefined 
                          ? `${ligne.prixUnitaire.toFixed(2)} €`
                          : '-'}
                    </span>
                    <span className="col-total">
                      {ligne.tarifManquant 
                        ? <span className="no-price">—</span>
                        : ligne.prixTotal !== undefined 
                          ? `${ligne.prixTotal.toFixed(2)} €`
                          : ligne.unite === '%' ? `${ligne.prixUnitaire}%` : '-'}
                    </span>
                  </div>
                ))}
              </div>
              <div className="estimation-footer">
                {(() => {
                  const lignesAvecPrix = solution.lignesDevis.filter(l => l.prixTotal !== undefined && !l.tarifManquant);
                  const lignesSansPrix = solution.lignesDevis.filter(l => l.tarifManquant);
                  const subtotal = lignesAvecPrix.reduce((sum, l) => sum + (l.prixTotal || 0), 0);
                  const majorations = solution.lignesDevis
                    .filter(l => l.unite === '%' && !l.tarifManquant)
                    .reduce((sum, l) => sum + (l.prixUnitaire || 0), 0);
                  const total = subtotal * (1 + majorations / 100);
                  const isPartial = lignesSansPrix.length > 0;

                  return (
                    <>
                      <div className="estimation-subtotal">
                        <span>Sous-total HT ({lignesAvecPrix.length} ligne{lignesAvecPrix.length > 1 ? 's' : ''} tarifée{lignesAvecPrix.length > 1 ? 's' : ''})</span>
                        <span className="subtotal-value">{subtotal.toFixed(2)} €</span>
                      </div>
                      
                      {lignesSansPrix.length > 0 && (
                        <div className="estimation-missing">
                          <span>⚠️ {lignesSansPrix.length} élément{lignesSansPrix.length > 1 ? 's' : ''} sans tarif</span>
                          <span className="missing-value">Prix à définir</span>
                        </div>
                      )}
                      
                      {solution.lignesDevis.some(l => l.unite === '%' && !l.tarifManquant) && (
                        <div className="estimation-majoration">
                          <span>Majorations applicables</span>
                          <span className="majoration-list">
                            {solution.lignesDevis
                              .filter(l => l.unite === '%' && !l.tarifManquant)
                              .map(l => `${l.designation}: +${l.prixUnitaire}%`)
                              .join(', ')}
                          </span>
                        </div>
                      )}
                      
                      <div className={`estimation-total ${isPartial ? 'partial' : ''}`}>
                        <span>{isPartial ? 'TOTAL PARTIEL HT' : 'TOTAL ESTIMÉ HT'}</span>
                        <span className="total-value">
                          {total.toFixed(2)} €
                          {isPartial && <span className="partial-note">*</span>}
                        </span>
                      </div>
                      
                      {isPartial && (
                        <p className="partial-disclaimer">
                          * Total incomplet. Ajoutez les tarifs manquants dans l'Admin pour un calcul précis.
                        </p>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </ExpandableCard>
        )}

        {/* Lignes de devis (si pas de prix) */}
        {solution && !solution.lignesDevis.some(l => l.prixTotal !== undefined) && (
          <ExpandableCard 
            title="Lignes de devis" 
            icon={<ListIcon />}
            badge={<span className="count-badge">{solution.lignesDevis.length}</span>}
          >
            <div className="devis-list">
              {solution.lignesDevis.map((ligne, i) => (
                <div key={i} className="devis-line">
                  <span className="devis-designation">{ligne.designation}</span>
                  <span className="devis-qty">{ligne.quantite} {ligne.unite}</span>
                </div>
              ))}
            </div>
            <p className="devis-note">Les prix seront calculés selon votre grille tarifaire</p>
          </ExpandableCard>
        )}

        {/* Recommandations */}
        {solution?.recommandations && solution.recommandations.length > 0 && (
          <ExpandableCard 
            title="Recommandations" 
            icon={<LightbulbIcon />}
          >
            <ul className="reco-list">
              {solution.recommandations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </ExpandableCard>
        )}

        {/* Variantes */}
        {solution?.variantes && solution.variantes.length > 0 && (
          <ExpandableCard 
            title="Variantes possibles" 
            icon={<VariantIcon />}
            badge={<span className="count-badge">{solution.variantes.length}</span>}
          >
            <div className="variantes-list">
              {solution.variantes.map((variante, i) => (
                <div key={i} className="variante-item">
                  <h4>{variante.nom}</h4>
                  <p>{variante.description}</p>
                  {variante.avantages && variante.avantages.length > 0 && (
                    <div className="variante-pros">
                      {variante.avantages.map((a, j) => (
                        <span key={j} className="pro-tag">+ {a}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ExpandableCard>
        )}

        {/* Raisonnement IA */}
        {demande.raisonnementIA && (
          <ExpandableCard 
            title="Raisonnement de Joël" 
            icon={<BrainIcon />}
          >
            <p className="raisonnement-text">{demande.raisonnementIA}</p>
          </ExpandableCard>
        )}
      </div>

      {/* Actions */}
      {demande.status !== 'validated' && solution && (
        <div className="actions-bar">
          <button 
            className="btn btn-secondary"
            onClick={handleReanalyze}
            disabled={isReanalyzing || isValidating}
          >
            {isReanalyzing ? 'Réanalyse...' : 'Réanalyser'}
          </button>
          <button 
            className="btn btn-success"
            onClick={handleValidate}
            disabled={isValidating || isReanalyzing}
          >
            {isValidating ? 'Validation...' : 'Valider'}
          </button>
        </div>
      )}

      {demande.status === 'validated' && (
        <div className="validated-bar">
          Demande validée et enregistrée comme référence
        </div>
      )}
    </div>
  );
}

export default DemandeDetail;
