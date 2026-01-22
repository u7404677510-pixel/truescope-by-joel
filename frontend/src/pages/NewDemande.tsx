import { useState } from 'react';
import DevisForm from '../components/DevisForm';
import SolutionDisplay from '../components/SolutionDisplay';
import { createDemandeWithFiles } from '../services/api';
import type { Metier, AnalyseResponse } from '../types';
import './NewDemande.css';

function NewDemande() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyseResult, setAnalyseResult] = useState<AnalyseResponse | null>(null);

  const handleSubmit = async (data: { metier: Metier; description: string; mediaFiles: File[] }) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await createDemandeWithFiles(data.metier, data.description, data.mediaFiles);
      setAnalyseResult(result);
    } catch (err) {
      console.error('Erreur analyse:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de la demande');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setAnalyseResult(null);
    setError(null);
  };

  return (
    <div className="new-demande fade-in">
      {/* Hero TrueScope */}
      <div className="truescope-hero">
        <span className="hero-welcome">bienvenue sur</span>
        <div className="hero-title-wrapper">
          <h1 className="hero-title">TrueScope</h1>
          <span className="hero-byline">by Joël</span>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">!</span>
          <div>
            <strong>Erreur</strong>
            <p>{error}</p>
          </div>
          <button className="close-btn" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {!analyseResult ? (
        <DevisForm onSubmit={handleSubmit} isLoading={isLoading} />
      ) : (
        <div className="analyse-result">
          {/* Flèche retour en haut */}
          <button className="back-arrow" onClick={handleBack}>
            ← Nouvelle analyse
          </button>
          
          <SolutionDisplay solution={analyseResult.solution} />
        </div>
      )}
    </div>
  );
}

export default NewDemande;
