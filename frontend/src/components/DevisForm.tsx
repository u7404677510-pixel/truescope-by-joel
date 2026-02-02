import { useState, useCallback } from 'react';
import type { Metier } from '../types';
import MediaUpload from './MediaUpload';
import './DevisForm.css';

interface MediaFile {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'video';
}

interface DevisFormProps {
  onSubmit: (data: { metier: Metier; description: string; mediaFiles: File[] }) => void;
  isLoading?: boolean;
}

// Icônes SVG monochromes
const KeyIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);

const DropIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
  </svg>
);

const BoltIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const METIERS: { value: Metier; label: string; icon: React.ReactNode; description: string }[] = [
  { 
    value: 'serrurerie', 
    label: 'Serrurerie', 
    icon: <KeyIcon />,
    description: 'Porte claquée, serrure cassée, blindage...'
  },
  { 
    value: 'plomberie', 
    label: 'Plomberie', 
    icon: <DropIcon />,
    description: 'Fuite, bouchon, chauffe-eau, sanitaires...'
  },
  { 
    value: 'electricite', 
    label: 'Électricité', 
    icon: <BoltIcon />,
    description: 'Panne, tableau électrique, installation...'
  },
];

function DevisForm({ onSubmit, isLoading = false }: DevisFormProps) {
  const [metier, setMetier] = useState<Metier | ''>('');
  const [description, setDescription] = useState('');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [currentStep, setCurrentStep] = useState(1);

  const totalSteps = 3;

  const handleFilesChange = useCallback((files: MediaFile[]) => {
    setMediaFiles(files);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!metier || !description.trim()) return;

    onSubmit({
      metier,
      description: description.trim(),
      mediaFiles: mediaFiles.map(mf => mf.file),
    });
  };

  const canGoNext = () => {
    if (currentStep === 1) return metier !== '';
    if (currentStep === 2) return description.trim().length > 0;
    return true;
  };

  const goNext = () => {
    if (canGoNext() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goPrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <form className="devis-form" onSubmit={handleSubmit}>
      {/* Indicateur de progression */}
      <div className="step-indicator">
        <div className="step-progress">
          <div 
            className="step-progress-bar" 
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
        <span className="step-label">Étape {currentStep}/{totalSteps}</span>
      </div>

      {/* Étape 1: Choix du métier */}
      {currentStep === 1 && (
        <div className="form-section step-content">
          <h3 className="section-title">
            Quel est votre problème ?
          </h3>
          <div className="metier-grid">
            {METIERS.map(m => (
              <button
                key={m.value}
                type="button"
                className={`metier-card ${metier === m.value ? 'selected' : ''} ${m.value}`}
                onClick={() => setMetier(m.value)}
              >
                <span className="metier-icon">{m.icon}</span>
                <span className="metier-label">{m.label}</span>
                <span className="metier-desc">{m.description}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Étape 2: Description */}
      {currentStep === 2 && (
        <div className="form-section step-content">
          <h3 className="section-title">
            Décrivez votre situation
          </h3>
          <div className="form-group">
            <textarea
              className="form-textarea description-input"
              placeholder="Décrivez précisément votre problème...&#10;&#10;Exemple: Ma porte d'entrée est claquée. C'est une porte blindée, serrure 3 points. Je n'ai pas de double des clés."
              value={description}
              onChange={e => setDescription(e.target.value)}
              autoFocus
            />
            <div className="char-count">{description.length} caractères</div>
          </div>
        </div>
      )}

      {/* Étape 3: Photos */}
      {currentStep === 3 && (
        <div className="form-section step-content">
          <h3 className="section-title">
            Ajoutez des photos <span className="optional">(optionnel)</span>
          </h3>
          <MediaUpload 
            onFilesChange={handleFilesChange}
            maxFiles={5}
            maxSizeMB={10}
          />
          <div className="help-text">
            Les photos permettent à Joël de mieux analyser la situation
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="step-navigation">
        {currentStep > 1 && (
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={goPrev}
          >
            ← Précédent
          </button>
        )}
        
        <div className="nav-spacer" />

        {currentStep < totalSteps ? (
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={goNext}
            disabled={!canGoNext()}
          >
            Suivant →
          </button>
        ) : (
          <button 
            type="submit" 
            className="btn btn-primary submit-btn"
            disabled={!metier || !description.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Analyse en cours...
              </>
            ) : (
              'Analyser avec Joël'
            )}
          </button>
        )}
      </div>
    </form>
  );
}

export default DevisForm;
