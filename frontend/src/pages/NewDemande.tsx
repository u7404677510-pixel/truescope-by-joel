import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DevisForm from '../components/DevisForm';
import SolutionDisplay from '../components/SolutionDisplay';
import { createDemandeWithFiles, validateDemande, getProblemType } from '../services/api';
import type { Metier, AnalyseResponse } from '../types';
import './NewDemande.css';

function NewDemande() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
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
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'analyse');
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!analyseResult) return;

    try {
      setIsValidating(true);
      setError(null);

      // Récupérer le type de problème automatiquement
      const problemType = await getProblemType(analyseResult.demande.id);

      // Valider la demande avec la solution proposée
      await validateDemande(
        analyseResult.demande.id,
        analyseResult.solution,
        problemType
      );

      // Rediriger vers le dashboard avec un message de succès
      navigate('/', { state: { message: 'Demande validée et enregistrée avec succès !' } });
    } catch (err) {
      console.error('Erreur validation:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la validation');
    } finally {
      setIsValidating(false);
    }
  };

  const handleReset = () => {
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
          <span className="error-icon">⚠️</span>
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
          <SolutionDisplay 
            solution={analyseResult.solution}
            confiance={analyseResult.confiance}
            raisonnement={analyseResult.raisonnement}
            interventionsSimilaires={analyseResult.interventionsSimilaires}
          />

          <div className="result-actions">
            <button 
              className="btn btn-secondary" 
              onClick={handleReset}
              disabled={isValidating}
            >
              ← Nouvelle analyse
            </button>
            <button 
              className="btn btn-success"
              onClick={handleValidate}
              disabled={isValidating}
            >
              {isValidating ? (
                <>
                  <span className="spinner"></span>
                  Validation...
                </>
              ) : (
                <>
                  ✓ Valider et enregistrer
                </>
              )}
            </button>
          </div>

          <div className="validation-note">
            <span className="note-icon">💡</span>
            <p>
              En validant cette solution, elle sera enregistrée comme intervention de référence.
              Cela permettra à Joël de proposer des solutions plus précises pour les futures demandes similaires.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default NewDemande;
