import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDemandes } from '../services/api';
import type { Demande } from '../types';
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

const METIER_LABELS: Record<string, string> = {
  serrurerie: 'Serrurerie',
  plomberie: 'Plomberie',
  electricite: 'Électricité'
};

function Historique() {
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const demandesData = await getDemandes({ limit: 100 });
        setDemandes(demandesData);
      } catch (err) {
        console.error('Erreur chargement données:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="historique fade-in">
      {/* Titre style TrueScope */}
      <h1 className="historique-title">Mes diagnostics</h1>

      {/* Content */}
      {isLoading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <span>Chargement...</span>
        </div>
      ) : (
        <div className="historique-content">
          {demandes.length === 0 ? (
            <div className="empty-state">
              <p>Aucun diagnostic pour le moment</p>
              <Link to="/nouvelle-demande" className="btn btn-primary">
                Faire un diagnostic
              </Link>
            </div>
          ) : (
            <div className="cards-grid">
                {demandes.map(demande => (
                <Link 
                  key={demande.id} 
                  to={`/demande/${demande.id}`}
                  className="card"
                >
                  <div className="card-top">
                    <span className={`metier-dot ${demande.metier}`}></span>
                    <span className="metier-label">{METIER_LABELS[demande.metier]}</span>
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
        </div>
      )}
    </div>
  );
}

export default Historique;
