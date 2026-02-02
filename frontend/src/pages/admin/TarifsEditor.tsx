import { useState, useEffect } from 'react';
import './Admin.css';

type Metier = 'serrurerie' | 'plomberie' | 'electricite';
type Categorie = 'main_oeuvre' | 'materiaux';

interface Tarif {
  code: string;
  designation: string;
  prix: number;
  unite: string;
  categorie: Categorie;
  metier: Metier;
}

interface TarifsMetier {
  main_oeuvre: Tarif[];
  materiaux: Tarif[];
}

interface AllTarifs {
  serrurerie: TarifsMetier;
  plomberie: TarifsMetier;
  electricite: TarifsMetier;
}

interface NewTarifForm {
  designation: string;
  prix: string;
  unite: string;
}

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const UNITES_OPTIONS = [
  'forfait',
  'pièce',
  'ml',
  'm²',
  'heure',
  'point',
  'lot',
  'circuit',
  '%',
];

function TarifsEditor() {
  const [tarifs, setTarifs] = useState<AllTarifs | null>(null);
  const [activeMetier, setActiveMetier] = useState<Metier>('serrurerie');
  const [activeCategorie, setActiveCategorie] = useState<Categorie>('main_oeuvre');
  const [isLoading, setIsLoading] = useState(true);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [savingCode, setSavingCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // État pour le modal d'ajout
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTarif, setNewTarif] = useState<NewTarifForm>({
    designation: '',
    prix: '',
    unite: 'forfait',
  });
  const [isAdding, setIsAdding] = useState(false);

  // Charger les tarifs
  useEffect(() => {
    loadTarifs();
  }, []);

  async function loadTarifs() {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/tarifs`);
      const data = await response.json();
      
      if (data.success) {
        setTarifs(data.data);
      } else {
        setError('Erreur lors du chargement des tarifs');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de charger les tarifs');
    } finally {
      setIsLoading(false);
    }
  }

  async function initializeTarifs() {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/tarifs/initialize`, {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success) {
        setSuccessMessage(`${data.count} tarifs initialisés avec succès`);
        await loadTarifs();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError('Erreur lors de l\'initialisation');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible d\'initialiser les tarifs');
    } finally {
      setIsLoading(false);
    }
  }

  async function saveTarif(code: string, newPrix: number) {
    try {
      setSavingCode(code);
      setError(null);
      
      const response = await fetch(
        `${API_BASE}/tarifs/${activeMetier}/${activeCategorie}/${code}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prix: newPrix }),
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        // Mettre à jour localement
        setTarifs(prev => {
          if (!prev) return prev;
          const updated = { ...prev };
          const list = updated[activeMetier][activeCategorie];
          const index = list.findIndex(t => t.code === code);
          if (index !== -1) {
            list[index] = { ...list[index], prix: newPrix };
          }
          return updated;
        });
        setEditingCode(null);
        setSuccessMessage(`Tarif ${code} mis à jour`);
        setTimeout(() => setSuccessMessage(null), 2000);
      } else {
        setError(data.error || 'Erreur lors de la sauvegarde');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de sauvegarder le tarif');
    } finally {
      setSavingCode(null);
    }
  }

  async function addTarif() {
    if (!newTarif.designation.trim() || !newTarif.prix || !newTarif.unite) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    const prix = parseFloat(newTarif.prix);
    if (isNaN(prix) || prix < 0) {
      setError('Le prix doit être un nombre positif');
      return;
    }

    try {
      setIsAdding(true);
      setError(null);
      
      const response = await fetch(
        `${API_BASE}/tarifs/${activeMetier}/${activeCategorie}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            designation: newTarif.designation.trim(),
            prix,
            unite: newTarif.unite,
          }),
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        // Ajouter localement
        setTarifs(prev => {
          if (!prev) return prev;
          const updated = { ...prev };
          updated[activeMetier][activeCategorie] = [
            ...updated[activeMetier][activeCategorie],
            data.data,
          ];
          return updated;
        });
        
        setShowAddModal(false);
        setNewTarif({ designation: '', prix: '', unite: 'forfait' });
        setSuccessMessage(`Tarif ${data.data.code} créé avec succès`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(data.error || 'Erreur lors de la création');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de créer le tarif');
    } finally {
      setIsAdding(false);
    }
  }

  async function deleteTarif(code: string) {
    if (!confirm(`Supprimer le tarif ${code} ?`)) return;

    try {
      setSavingCode(code);
      setError(null);
      
      const response = await fetch(
        `${API_BASE}/tarifs/${activeMetier}/${activeCategorie}/${code}`,
        { method: 'DELETE' }
      );
      
      const data = await response.json();
      
      if (data.success) {
        // Supprimer localement
        setTarifs(prev => {
          if (!prev) return prev;
          const updated = { ...prev };
          updated[activeMetier][activeCategorie] = 
            updated[activeMetier][activeCategorie].filter(t => t.code !== code);
          return updated;
        });
        setSuccessMessage(`Tarif ${code} supprimé`);
        setTimeout(() => setSuccessMessage(null), 2000);
      } else {
        setError(data.error || 'Erreur lors de la suppression');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de supprimer le tarif');
    } finally {
      setSavingCode(null);
    }
  }

  function startEditing(tarif: Tarif) {
    setEditingCode(tarif.code);
    setEditValue(tarif.prix.toString());
  }

  function handleKeyDown(e: React.KeyboardEvent, code: string) {
    if (e.key === 'Enter') {
      const newPrix = parseFloat(editValue);
      if (!isNaN(newPrix) && newPrix >= 0) {
        saveTarif(code, newPrix);
      }
    } else if (e.key === 'Escape') {
      setEditingCode(null);
    }
  }

  const currentTarifs = tarifs?.[activeMetier]?.[activeCategorie] || [];
  const totalTarifs = tarifs ? 
    Object.values(tarifs).reduce(
      (sum, m) => sum + m.main_oeuvre.length + m.materiaux.length, 
      0
    ) : 0;

  const metierLabels: Record<Metier, { label: string; icon: string }> = {
    serrurerie: { label: 'Serrurerie', icon: '🔑' },
    plomberie: { label: 'Plomberie', icon: '🚿' },
    electricite: { label: 'Électricité', icon: '⚡' },
  };

  const categorieLabels: Record<Categorie, string> = {
    main_oeuvre: "Main d'œuvre",
    materiaux: 'Matériaux',
  };

  return (
    <div className="tarifs-editor">
      <header className="admin-header">
        <div>
          <h1>Grille Tarifaire</h1>
          <p className="admin-subtitle">
            {totalTarifs > 0 ? `${totalTarifs} tarifs configurés` : 'Aucun tarif'}
          </p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Ajouter un tarif
          </button>
          <button 
            className="btn btn-secondary"
            onClick={initializeTarifs}
            disabled={isLoading}
          >
            Réinitialiser
          </button>
        </div>
      </header>

      {error && (
        <div className="admin-alert error">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {successMessage && (
        <div className="admin-alert success">
          <span>{successMessage}</span>
        </div>
      )}

      {/* Onglets métiers */}
      <div className="metier-tabs">
        {(Object.keys(metierLabels) as Metier[]).map(metier => (
          <button
            key={metier}
            className={`metier-tab ${activeMetier === metier ? 'active' : ''}`}
            onClick={() => setActiveMetier(metier)}
          >
            <span className="metier-tab-icon">{metierLabels[metier].icon}</span>
            <span>{metierLabels[metier].label}</span>
            <span className="metier-tab-count">
              {tarifs ? tarifs[metier].main_oeuvre.length + tarifs[metier].materiaux.length : 0}
            </span>
          </button>
        ))}
      </div>

      {/* Sous-onglets catégories */}
      <div className="categorie-tabs">
        {(Object.keys(categorieLabels) as Categorie[]).map(cat => (
          <button
            key={cat}
            className={`categorie-tab ${activeCategorie === cat ? 'active' : ''}`}
            onClick={() => setActiveCategorie(cat)}
          >
            {categorieLabels[cat]}
            <span className="categorie-tab-count">
              {tarifs?.[activeMetier]?.[cat]?.length || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Liste des tarifs */}
      {isLoading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <span>Chargement...</span>
        </div>
      ) : (
        <div className="tarifs-table-container">
          <table className="tarifs-table">
            <thead>
              <tr>
                <th className="col-code">Code</th>
                <th className="col-designation">Désignation</th>
                <th className="col-prix">Prix</th>
                <th className="col-unite">Unité</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentTarifs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-row">
                    Aucun tarif. Cliquez sur "Ajouter un tarif" ou "Réinitialiser" pour commencer.
                  </td>
                </tr>
              ) : (
                currentTarifs.map(tarif => (
                  <tr key={tarif.code}>
                    <td className="col-code">
                      <code>{tarif.code}</code>
                    </td>
                    <td className="col-designation">{tarif.designation}</td>
                    <td className="col-prix">
                      {editingCode === tarif.code ? (
                        <input
                          type="number"
                          className="prix-input"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onKeyDown={e => handleKeyDown(e, tarif.code)}
                          onBlur={() => setEditingCode(null)}
                          autoFocus
                          step="0.01"
                          min="0"
                        />
                      ) : (
                        <button 
                          className="prix-display"
                          onClick={() => startEditing(tarif)}
                          disabled={savingCode === tarif.code}
                        >
                          {savingCode === tarif.code ? (
                            <span className="spinner-small"></span>
                          ) : (
                            <>
                              {tarif.unite === '%' 
                                ? `${tarif.prix}%` 
                                : `${tarif.prix.toFixed(2)} €`}
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </>
                          )}
                        </button>
                      )}
                    </td>
                    <td className="col-unite">{tarif.unite}</td>
                    <td className="col-actions">
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => deleteTarif(tarif.code)}
                        disabled={savingCode === tarif.code}
                        title="Supprimer"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal d'ajout */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Ajouter un tarif</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="modal-info">
                <span className="modal-info-label">Métier:</span>
                <span className="modal-info-value">
                  {metierLabels[activeMetier].icon} {metierLabels[activeMetier].label}
                </span>
              </div>
              <div className="modal-info">
                <span className="modal-info-label">Catégorie:</span>
                <span className="modal-info-value">{categorieLabels[activeCategorie]}</span>
              </div>

              <div className="form-group">
                <label>Désignation *</label>
                <input
                  type="text"
                  value={newTarif.designation}
                  onChange={e => setNewTarif(prev => ({ ...prev, designation: e.target.value }))}
                  placeholder="Ex: Ouverture porte claquée"
                  autoFocus
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Prix *</label>
                  <input
                    type="number"
                    value={newTarif.prix}
                    onChange={e => setNewTarif(prev => ({ ...prev, prix: e.target.value }))}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Unité *</label>
                  <select
                    value={newTarif.unite}
                    onChange={e => setNewTarif(prev => ({ ...prev, unite: e.target.value }))}
                  >
                    {UNITES_OPTIONS.map(unite => (
                      <option key={unite} value={unite}>{unite}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowAddModal(false)}
              >
                Annuler
              </button>
              <button 
                className="btn btn-primary"
                onClick={addTarif}
                disabled={isAdding}
              >
                {isAdding ? 'Création...' : 'Créer le tarif'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TarifsEditor;
