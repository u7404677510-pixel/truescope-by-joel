# 🚀 HANDOFF PROMPT - TrueScope by Joël

> **Ce document est un prompt complet pour le nouvel agent Cursor.**
> Copie-colle ce contenu en entier dans une nouvelle conversation Cursor.

---

## PROMPT À COPIER-COLLER

```
Je travaille sur TrueScope, un outil de diagnostic IA gratuit pour les problèmes de serrurerie, plomberie et électricité. L'objectif est de générer des leads pour un artisan appelé "Joël".

## CONTEXTE DU PROJET

TrueScope est une application full-stack qui :
1. Permet aux utilisateurs de décrire leur problème (texte + photos)
2. Utilise l'IA Google Gemini pour analyser et diagnostiquer le problème
3. Affiche un diagnostic détaillé GRATUIT (sans prix)
4. Propose un CTA "Trouver un Joël" pour convertir l'utilisateur en lead

## ÉTAT ACTUEL

### Ce qui fonctionne ✅
- Formulaire de création de demande (choix métier, description, upload photos)
- Analyse IA avec Gemini (diagnostic, solution, matériel nécessaire, recommandations)
- Affichage du résultat avec cartes expansibles
- Historique des demandes
- Page admin pour gérer les tarifs (backend only)
- Base de données Firebase fonctionnelle

### Ce qui doit être modifié ⚠️

1. **SUPPRIMER L'AFFICHAGE DES PRIX** - Actuellement la page DemandeDetail.tsx affiche une carte "Estimation tarifaire" avec des prix. Il faut la supprimer complètement.

2. **AJOUTER LE CTA "TROUVER UN JOËL"** - Après le diagnostic, il faut un gros bouton d'appel à l'action pour contacter l'artisan.

3. **CRÉER UN FORMULAIRE DE LEAD** - Quand l'utilisateur clique sur le CTA, il doit pouvoir laisser ses coordonnées.

## STACK TECHNIQUE

- Frontend: React 18 + TypeScript + Vite (port 5180)
- Backend: Node.js + Express + TypeScript (port 3001)
- Database: Firebase Firestore
- AI: Google Gemini Pro
- Styling: CSS Variables (pas de framework)

## FICHIERS CLÉS À MODIFIER

### 1. frontend/src/pages/DemandeDetail.tsx
SUPPRIMER :
- La carte "Estimation tarifaire" (tout le bloc avec les prix)
- Les références à prixUnitaire, prixTotal, tarifManquant
- Le calcul du sous-total et total

AJOUTER :
- Un composant CTA "Trouver un Joël" en bas du diagnostic
- Bouton d'appel direct (tel:+33...)
- Bouton "Être rappelé" qui ouvre un formulaire

### 2. frontend/src/pages/DemandeDetail.css
SUPPRIMER :
- Les styles liés aux prix (.price-table, .price-cell, etc.)

AJOUTER :
- Styles pour la section CTA (.cta-section, .cta-card, etc.)

### 3. CRÉER frontend/src/components/ContactForm.tsx
Nouveau composant avec :
- Champ nom (obligatoire)
- Champ téléphone (obligatoire)
- Champ email (optionnel)
- Champ adresse (optionnel)
- Sélecteur d'urgence (urgent / aujourd'hui / cette semaine / flexible)
- Bouton envoyer

### 4. CRÉER frontend/src/components/CTASection.tsx
Composant réutilisable avec :
- Titre accrocheur ("Besoin d'un expert ?")
- Deux boutons (Appeler / Être rappelé)
- Badges de confiance (Réponse rapide, Artisan certifié, etc.)

### 5. backend/src/routes/leads.ts (NOUVEAU)
Créer un nouveau router pour gérer les leads :
- POST /api/leads - Créer un nouveau lead
- GET /api/leads - Lister les leads (admin)

### 6. backend/src/types/index.ts
Ajouter le type Lead :
```typescript
interface Lead {
  id: string;
  diagnosticId: string;
  metier: Metier;
  contact: {
    nom: string;
    telephone: string;
    email?: string;
    adresse?: string;
  };
  urgence: 'urgent' | 'aujourd_hui' | 'cette_semaine' | 'flexible';
  message?: string;
  status: 'new' | 'contacted' | 'converted' | 'lost';
  createdAt: Date;
}
```

## RÈGLES IMPORTANTES

1. **JAMAIS DE PRIX** - Ne jamais afficher de prix, tarif, coût ou estimation financière à l'utilisateur
2. **FRANÇAIS** - Toute l'interface est en français
3. **CTA VISIBLE** - Le bouton de contact doit être très visible et attractif
4. **MOBILE FIRST** - Le CTA doit être bien visible sur mobile

## DESIGN DU CTA (suggestion)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│         🔧 BESOIN D'UN EXPERT ?                            │
│                                                             │
│    Un artisan qualifié peut résoudre votre problème        │
│                   rapidement.                               │
│                                                             │
│  ┌─────────────────────┐  ┌─────────────────────┐         │
│  │  📞 APPELER JOËL    │  │  💬 ÊTRE RAPPELÉ    │         │
│  │                     │  │                     │         │
│  └─────────────────────┘  └─────────────────────┘         │
│                                                             │
│  ⚡ Réponse sous 30 min  •  🛡️ Artisan certifié           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## INFORMATIONS JOËL (À CONFIGURER)

Téléphone : +33 6 XX XX XX XX (à remplacer)
Email : contact@joel.fr (à remplacer)

## PRIORITÉS

1. 🔴 Supprimer les prix de DemandeDetail.tsx
2. 🔴 Ajouter le CTA "Trouver un Joël"
3. 🟡 Créer le formulaire de contact/lead
4. 🟡 Backend pour sauvegarder les leads
5. 🟢 Notifications (email/SMS) quand nouveau lead

## COMMANDES UTILES

# Lancer le projet en dev
cd backend && npm run dev    # Terminal 1
cd frontend && npm run dev   # Terminal 2

# Accéder à l'app
Frontend: http://localhost:5180
Backend: http://localhost:3001

## STRUCTURE FIREBASE ACTUELLE

/demandes/{id} - Les diagnostics créés
/interventions/{id} - Les cas de référence
/tarifs/{metier}/{categorie}/{code} - Les prix (backend only)

## CE QUE JE VEUX

Transforme TrueScope en un outil de génération de leads efficace :
1. L'utilisateur obtient son diagnostic gratuit (ça marche déjà)
2. Il voit un CTA attractif "Trouver un Joël"
3. Il peut appeler directement OU laisser ses coordonnées
4. Le lead est sauvegardé dans Firebase pour que Joël le recontacte

Commence par me montrer les fichiers que tu vas modifier et le plan d'action.
```

---

## CHECKLIST POUR LE NOUVEL AGENT

### Avant de commencer
- [ ] Lire le fichier `.cursorrules` à la racine
- [ ] Lire `docs/ARCHITECTURE.md` pour comprendre la structure
- [ ] Lancer le projet en local pour voir l'état actuel

### Modifications à faire
- [ ] Supprimer la carte "Estimation tarifaire" de `DemandeDetail.tsx`
- [ ] Supprimer les styles de prix de `DemandeDetail.css`
- [ ] Créer le composant `CTASection.tsx`
- [ ] Créer le composant `ContactForm.tsx`
- [ ] Intégrer le CTA dans `DemandeDetail.tsx`
- [ ] Créer le type `Lead` dans les types
- [ ] Créer la route `/api/leads` dans le backend
- [ ] Connecter le formulaire à l'API

### Tests à faire
- [ ] Créer un diagnostic et vérifier qu'aucun prix n'apparaît
- [ ] Vérifier que le CTA est visible et bien designé
- [ ] Tester le bouton d'appel (sur mobile)
- [ ] Tester l'envoi du formulaire de contact
- [ ] Vérifier que le lead est sauvegardé dans Firebase

---

## FICHIERS DE RÉFÉRENCE

### Structure actuelle de DemandeDetail.tsx (à modifier)

Le fichier contient actuellement :
1. Affichage du diagnostic (GARDER)
2. Affichage de la solution (GARDER)
3. Affichage du matériel nécessaire (GARDER)
4. Affichage des recommandations (GARDER)
5. **Estimation tarifaire avec prix (SUPPRIMER)**
6. Variantes si disponibles (GARDER)
7. Boutons Réanalyser/Valider (GARDER ou adapter)

### Exemple de CTA à ajouter

```tsx
// Composant à créer : CTASection.tsx
import { useState } from 'react';
import ContactForm from './ContactForm';
import './CTASection.css';

interface CTASectionProps {
  diagnosticId: string;
  metier: string;
  phoneNumber?: string;
}

export default function CTASection({ diagnosticId, metier, phoneNumber = '+33612345678' }: CTASectionProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="cta-section">
      <div className="cta-card">
        <div className="cta-icon">🔧</div>
        <h2>Besoin d'un expert ?</h2>
        <p>Un artisan qualifié peut résoudre votre problème rapidement.</p>
        
        <div className="cta-buttons">
          <a href={`tel:${phoneNumber}`} className="btn-cta btn-primary">
            <span className="btn-icon">📞</span>
            Appeler Joël
          </a>
          
          <button onClick={() => setShowForm(true)} className="btn-cta btn-secondary">
            <span className="btn-icon">💬</span>
            Être rappelé
          </button>
        </div>
        
        <div className="cta-badges">
          <span className="badge">⚡ Réponse sous 30 min</span>
          <span className="badge">🛡️ Artisan certifié</span>
        </div>
      </div>
      
      {showForm && (
        <ContactForm 
          diagnosticId={diagnosticId}
          metier={metier}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
```

### Exemple de formulaire de contact

```tsx
// Composant à créer : ContactForm.tsx
import { useState } from 'react';
import { api } from '../services/api';
import './ContactForm.css';

interface ContactFormProps {
  diagnosticId: string;
  metier: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ContactForm({ diagnosticId, metier, onClose, onSuccess }: ContactFormProps) {
  const [formData, setFormData] = useState({
    nom: '',
    telephone: '',
    email: '',
    adresse: '',
    urgence: 'cette_semaine' as const,
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/leads', {
        diagnosticId,
        metier,
        contact: {
          nom: formData.nom,
          telephone: formData.telephone,
          email: formData.email || undefined,
          adresse: formData.adresse || undefined,
        },
        urgence: formData.urgence,
        message: formData.message || undefined,
      });
      
      onSuccess?.();
      onClose();
      alert('Merci ! Joël vous recontactera très bientôt.');
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-form-overlay" onClick={onClose}>
      <div className="contact-form-modal" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <h2>Être rappelé</h2>
        <p>Laissez vos coordonnées, Joël vous recontacte rapidement.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nom *</label>
            <input
              type="text"
              value={formData.nom}
              onChange={e => setFormData({...formData, nom: e.target.value})}
              required
              placeholder="Votre nom"
            />
          </div>
          
          <div className="form-group">
            <label>Téléphone *</label>
            <input
              type="tel"
              value={formData.telephone}
              onChange={e => setFormData({...formData, telephone: e.target.value})}
              required
              placeholder="06 XX XX XX XX"
            />
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              placeholder="votre@email.fr"
            />
          </div>
          
          <div className="form-group">
            <label>Adresse</label>
            <input
              type="text"
              value={formData.adresse}
              onChange={e => setFormData({...formData, adresse: e.target.value})}
              placeholder="Votre adresse"
            />
          </div>
          
          <div className="form-group">
            <label>Urgence</label>
            <select
              value={formData.urgence}
              onChange={e => setFormData({...formData, urgence: e.target.value as any})}
            >
              <option value="urgent">🚨 Urgent (dans l'heure)</option>
              <option value="aujourd_hui">📅 Aujourd'hui</option>
              <option value="cette_semaine">📆 Cette semaine</option>
              <option value="flexible">🕐 Flexible</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Message (optionnel)</label>
            <textarea
              value={formData.message}
              onChange={e => setFormData({...formData, message: e.target.value})}
              placeholder="Précisions supplémentaires..."
              rows={3}
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Envoi en cours...' : 'Envoyer ma demande'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

---

## NOTES FINALES

Ce projet est une transformation de l'application existante. L'objectif est de passer d'un **outil de devis interne** à un **outil de génération de leads public**.

La valeur pour l'utilisateur = diagnostic gratuit
La valeur pour Joël = leads qualifiés

Le design doit être professionnel, moderne et inspirer confiance. Le CTA doit être impossible à manquer sur mobile comme sur desktop.

Bonne chance ! 🚀
