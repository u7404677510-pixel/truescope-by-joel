import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDemandes, getInterventions } from '../services/api';
import type { Demande, Intervention, Metier } from '../types';
import './Historique.css';

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
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return '';
  }
}

type TabType = 'demandes' | 'interventions';
type MetierFilter = Metier | 'all';

const METIER_LABELS: Record<string, string> = {
  serrurerie: 'Serrurerie',
  plomberie: 'Plomberie',
  electricite: 'Électricité'
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  analyzed: 'Analysée',
  validated: 'Validée'
};

function Historique() {
  const [activeTab, setActiveTab] = useState<TabType>('demandes');
  const [metierFilter, setMetierFilter] = useState<MetierFilter>('all');
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [demandesData, interventionsData] = await Promise.all([
          getDemandes({ limit: 100 }),
          getInterventions(),
        ]);
        setDemandes(demandesData);
        setInterventions(interventionsData);
      } catch (err) {
        console.error('Erreur chargement données:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredDemandes = metierFilter === 'all' 
    ? demandes 
    : demandes.filter(d => d.metier === metierFilter);

  const filteredInterventions = metierFilter === 'all'
    ? interventions
    : interventions.filter(i => i.metier === metierFilter);

  return (
    <div className="historique fade-in">
      {/* Header */}
      <header className="historique-header">
        <h1>Historique</h1>
        <p>Consultez vos demandes et interventions</p>
      </header>

      {/* Navigation */}
      <nav className="historique-nav">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'demandes' ? 'active' : ''}`}
            onClick={() => setActiveTab('demandes')}
          >
            Demandes
            <span className="count">{filteredDemandes.length}</span>
          </button>
          <button 
            className={`tab ${activeTab === 'interventions' ? 'active' : ''}`}
            onClick={() => setActiveTab('interventions')}
          >
            Références
            <span className="count">{filteredInterventions.length}</span>
          </button>
        </div>

        <div className="filters">
          {(['all', 'serrurerie', 'plomberie', 'electricite'] as const).map(m => (
            <button 
              key={m}
              className={`filter ${metierFilter === m ? 'active' : ''} ${m !== 'all' ? m : ''}`}
              onClick={() => setMetierFilter(m)}
            >
              {m === 'all' ? 'Tous' : METIER_LABELS[m]}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      {isLoading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <span>Chargement...</span>
        </div>
      ) : (
        <div className="historique-content">
          {/* Demandes */}
          {activeTab === 'demandes' && (
            <>
              {filteredDemandes.length === 0 ? (
                <div className="empty-state">
                  <p>Aucune demande</p>
                  <Link to="/nouvelle-demande" className="btn btn-primary">
                    Créer une demande
                  </Link>
                </div>
              ) : (
                <div className="cards-grid">
                  {filteredDemandes.map(demande => (
                    <Link 
                      key={demande.id} 
                      to={`/demande/${demande.id}`}
                      className="card"
                    >
                      <div className="card-top">
                        <span className={`metier-dot ${demande.metier}`}></span>
                        <span className="metier-label">{METIER_LABELS[demande.metier]}</span>
                        <span className={`status ${demande.status}`}>
                          {STATUS_LABELS[demande.status]}
                        </span>
                      </div>
                      
                      <p className="card-description">{demande.description}</p>
                      
                      <div className="card-bottom">
                        <span className="date">{formatDate(demande.createdAt)}</span>
                        <span className="id">#{demande.id.slice(0, 6)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Interventions */}
          {activeTab === 'interventions' && (
            <>
              {filteredInterventions.length === 0 ? (
                <div className="empty-state">
                  <p>Aucune intervention de référence</p>
                  <span className="empty-hint">
                    Validez des demandes pour enrichir la base
                  </span>
                </div>
              ) : (
                <div className="cards-grid">
                  {filteredInterventions.map(intervention => (
                    <div key={intervention.id} className="card intervention">
                      <div className="card-top">
                        <span className={`metier-dot ${intervention.metier}`}></span>
                        <span className="metier-label">{METIER_LABELS[intervention.metier]}</span>
                        <span className="problem-type">{intervention.problemType.replace(/_/g, ' ')}</span>
                      </div>
                      
                      <p className="card-description">{intervention.description}</p>
                      
                      <div className="solution-preview">
                        <span className="solution-label">Solution</span>
                        <p>{intervention.solution.description}</p>
                      </div>

                      {intervention.keywords.length > 0 && (
                        <div className="keywords">
                          {intervention.keywords.slice(0, 4).map((kw, i) => (
                            <span key={i} className="keyword">{kw}</span>
                          ))}
                        </div>
                      )}
                      
                      <div className="card-bottom">
                        <span className="date">{formatDate(intervention.validatedAt)}</span>
                        <span className="lines-count">
                          {intervention.solution.lignesDevis.length} lignes
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Historique;
