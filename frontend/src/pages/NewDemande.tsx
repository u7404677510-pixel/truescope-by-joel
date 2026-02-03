import { useState, useCallback } from 'react';
import DevisForm from '../components/DevisForm';
import SolutionDisplay from '../components/SolutionDisplay';
import { createDemandeWithFiles } from '../services/api';
import type { Metier, AnalyseResponse } from '../types';
import './NewDemande.css';

// Jouer un son de succès (petit "ding" synthétique)
function playSuccessSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 880; // Note A5
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (e) {
    console.log('Audio non supporté');
  }
}

// Vibrer le téléphone
function vibrateDevice() {
  if ('vibrate' in navigator) {
    navigator.vibrate([100, 50, 100]); // Vibration courte, pause, vibration courte
  }
}

function NewDemande() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyseResult, setAnalyseResult] = useState<AnalyseResponse | null>(null);

  // Notification de succès (son + vibration)
  const notifySuccess = useCallback(() => {
    playSuccessSound();
    vibrateDevice();
  }, []);

  const handleSubmit = async (data: { metier: Metier; description: string; mediaFiles: File[] }) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await createDemandeWithFiles(data.metier, data.description, data.mediaFiles);
      setAnalyseResult(result);
      notifySuccess(); // Son + vibration quand l'analyse est terminée
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
