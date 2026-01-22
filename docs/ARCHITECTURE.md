# 🏗️ Architecture Technique - TrueScope

## Vue d'ensemble

TrueScope est une application full-stack composée de :
- **Frontend** : Application React SPA
- **Backend** : API REST Node.js/Express
- **Database** : Firebase Firestore
- **AI** : Google Gemini Pro

```
┌─────────────────────────────────────────────────────────────────────┐
│                           UTILISATEUR                                │
│                    (Navigateur Web / Mobile)                         │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Vercel)                            │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                    React + Vite + TypeScript                     ││
│  │                                                                  ││
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          ││
│  │  │  NewDemande  │  │DemandeDetail │  │  Historique  │          ││
│  │  │   (Form)     │  │  (Results)   │  │   (List)     │          ││
│  │  └──────────────┘  └──────────────┘  └──────────────┘          ││
│  │                                                                  ││
│  │  ┌──────────────────────────────────────────────────────────┐  ││
│  │  │                    services/api.ts                        │  ││
│  │  │              (Centralized API calls)                      │  ││
│  │  └──────────────────────────────────────────────────────────┘  ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
                                  │
                          HTTP REST API
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        BACKEND (Railway)                             │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                 Node.js + Express + TypeScript                   ││
│  │                                                                  ││
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐                ││
│  │  │  /demandes │  │/interventions│ │  /tarifs   │                ││
│  │  │   routes   │  │   routes    │  │  routes    │                ││
│  │  └────────────┘  └────────────┘  └────────────┘                ││
│  │         │               │              │                        ││
│  │         ▼               ▼              ▼                        ││
│  │  ┌──────────────────────────────────────────────────────────┐  ││
│  │  │                     SERVICES                              │  ││
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐               │  ││
│  │  │  │ gemini.ts│  │joel-core │  │similarity│               │  ││
│  │  │  │(AI calls)│  │ (logic)  │  │ (search) │               │  ││
│  │  │  └──────────┘  └──────────┘  └──────────┘               │  ││
│  │  └──────────────────────────────────────────────────────────┘  ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
                    │                           │
                    ▼                           ▼
┌───────────────────────────────┐  ┌───────────────────────────────┐
│      FIREBASE FIRESTORE       │  │       GOOGLE GEMINI API       │
│                               │  │                               │
│  Collections:                 │  │  - Analyse de texte           │
│  - demandes                   │  │  - Analyse d'images           │
│  - interventions              │  │  - Génération de diagnostic   │
│  - tarifs (internal)          │  │                               │
│  - leads (à créer)            │  │                               │
└───────────────────────────────┘  └───────────────────────────────┘
```

---

## 📁 Structure des Fichiers

### Backend (`/backend`)

```
backend/
├── src/
│   ├── config/
│   │   ├── firebase.ts      # Initialisation Firebase Admin
│   │   ├── gemini.ts        # Configuration Gemini API
│   │   └── index.ts         # Export configuration centralisée
│   │
│   ├── routes/
│   │   ├── index.ts         # Router principal
│   │   ├── demandes.ts      # CRUD demandes + analyse
│   │   ├── interventions.ts # Interventions de référence
│   │   └── tarifs.ts        # Gestion des tarifs (admin)
│   │
│   ├── services/
│   │   ├── gemini.ts        # Appels à l'API Gemini
│   │   ├── joel-core.ts     # Logique métier principale
│   │   ├── similarity.ts    # Recherche de cas similaires
│   │   └── tarifs.ts        # Gestion des tarifs
│   │
│   ├── types/
│   │   └── index.ts         # Interfaces TypeScript
│   │
│   └── server.ts            # Point d'entrée Express
│
├── .env                     # Variables d'environnement
├── firebase-service-account.json  # Clé Firebase (NE PAS COMMITER)
├── package.json
└── tsconfig.json
```

### Frontend (`/frontend`)

```
frontend/
├── src/
│   ├── components/
│   │   ├── Header.tsx/.css       # En-tête avec logo
│   │   ├── DevisForm.tsx/.css    # Formulaire de demande
│   │   ├── MediaUpload.tsx/.css  # Upload de photos
│   │   └── SolutionDisplay.tsx/.css  # Affichage diagnostic
│   │
│   ├── pages/
│   │   ├── NewDemande.tsx/.css   # Page création demande
│   │   ├── DemandeDetail.tsx/.css # Page résultat diagnostic
│   │   ├── Historique.tsx/.css   # Liste des demandes
│   │   └── admin/
│   │       └── TarifsEditor.tsx  # Éditeur de tarifs (admin)
│   │
│   ├── layouts/
│   │   └── AdminLayout.tsx/.css  # Layout admin séparé
│   │
│   ├── services/
│   │   └── api.ts               # Appels API centralisés
│   │
│   ├── types/
│   │   └── index.ts             # Interfaces TypeScript
│   │
│   ├── App.tsx                  # Routes principales
│   ├── main.tsx                 # Point d'entrée React
│   └── index.css                # Styles globaux + variables CSS
│
├── public/
│   └── JOEL_logo-horizontal-couleur copie.png
│
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 🔄 Flux de Données

### Création d'un Diagnostic

```
1. UTILISATEUR
   │
   │ Remplit le formulaire (métier, description, photos)
   ▼
2. FRONTEND (NewDemande.tsx)
   │
   │ POST /api/demandes
   │ Body: { metier, description, mediaFiles[] }
   ▼
3. BACKEND (routes/demandes.ts)
   │
   │ Appelle joelCore.createDemande()
   ▼
4. SERVICE joel-core.ts
   │
   ├─► Recherche interventions similaires (similarity.ts)
   │   └─► Query Firestore /interventions
   │
   └─► Analyse avec Gemini (gemini.ts)
       │
       │ Prompt = contexte métier + description + photos + cas similaires
       ▼
5. GEMINI API
   │
   │ Retourne JSON structuré:
   │ { diagnostic, description, materiel[], lignesDevis[], recommandations[] }
   ▼
6. BACKEND
   │
   │ Sauvegarde dans Firestore /demandes/{id}
   │ Retourne la demande complète
   ▼
7. FRONTEND (DemandeDetail.tsx)
   │
   │ Affiche le diagnostic
   │ Propose le CTA "Trouver un Joël"
   ▼
8. UTILISATEUR
   │
   │ Clique sur "Contacter" → Lead généré
   ▼
9. BACKEND (à implémenter)
   │
   │ POST /api/leads
   │ Sauvegarde dans Firestore /leads/{id}
```

---

## 🗄️ Structure Firebase

### Collection `demandes`

```typescript
{
  id: string,                    // UUID généré
  metier: 'serrurerie' | 'plomberie' | 'electricite',
  description: string,           // Description du problème
  mediaUrls: string[],           // URLs des photos (si stockées)
  status: 'pending' | 'analyzed' | 'validated',
  solutionProposee: {
    diagnostic: string,          // Analyse du problème
    description: string,         // Solution recommandée
    materiel: [{                 // Matériel nécessaire
      nom: string,
      quantite: number,
      marque?: string,
      specifications?: string
    }],
    lignesDevis: [{              // Détail intervention (SANS PRIX côté client)
      code?: string,
      designation: string,
      unite: string,
      quantite: number
    }],
    variantes?: [...],           // Alternatives
    recommandations?: string[]   // Conseils
  },
  interventionsSimilaires: string[],  // IDs des cas similaires
  raisonnementIA?: string,       // Explication de l'IA
  createdAt: Timestamp,
  updatedAt?: Timestamp
}
```

### Collection `interventions` (Référence)

```typescript
{
  id: string,
  metier: Metier,
  description: string,
  keywords: string[],            // Mots-clés pour recherche
  problemType: string,           // Type de problème classifié
  mediaUrls: string[],
  solution: Solution,
  validated: boolean,
  createdAt: Timestamp,
  validatedAt?: Timestamp
}
```

### Collection `tarifs` (Backend uniquement)

```
/tarifs
  └── /serrurerie
      ├── /main_oeuvre
      │   ├── SER-MO-001 { code, designation, prix, unite }
      │   └── ...
      └── /materiaux
          ├── SER-MA-001 { code, designation, prix, unite }
          └── ...
  └── /plomberie
      └── ...
  └── /electricite
      └── ...
```

### Collection `leads` (À créer)

```typescript
{
  id: string,
  diagnosticId: string,          // Lien vers la demande
  metier: Metier,
  contact: {
    nom: string,
    telephone: string,
    email?: string,
    adresse?: string
  },
  urgence: 'urgent' | 'aujourd_hui' | 'cette_semaine' | 'flexible',
  message?: string,
  status: 'new' | 'contacted' | 'converted' | 'lost',
  source: 'truescope',
  createdAt: Timestamp
}
```

---

## 🔌 Intégration Gemini

### Configuration (`config/gemini.ts`)

```typescript
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getGeminiModel = () => {
  return genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash'  // ou gemini-pro-vision pour images
  });
};

export const generationConfig = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 2048,
};
```

### Prompt Structure (`services/gemini.ts`)

Le prompt envoyé à Gemini inclut :
1. **Contexte métier** : Expertise serrurerie/plomberie/électricité
2. **Grille tarifaire** : Codes et désignations disponibles
3. **Cas similaires** : Interventions passées pertinentes
4. **Description utilisateur** : Le problème décrit
5. **Photos** : Images encodées en base64

---

## 🌐 Déploiement

### Frontend → Vercel

```
1. Push sur GitHub
2. Connecter le repo à Vercel
3. Root Directory: frontend
4. Build Command: npm run build
5. Output Directory: dist
6. Variables d'environnement: VITE_API_URL
```

### Backend → Railway

```
1. Push sur GitHub
2. Connecter le repo à Railway
3. Root Directory: backend
4. Start Command: npm start
5. Variables d'environnement:
   - GEMINI_API_KEY
   - FIREBASE_SERVICE_ACCOUNT_JSON (contenu JSON en string)
   - PORT
   - NODE_ENV=production
```

---

## 🔐 Sécurité

| Élément | Protection |
|---------|------------|
| Clés API | Variables d'environnement, jamais dans le code |
| Firebase | Service account en JSON, .gitignore |
| CORS | Configuré pour domaines autorisés uniquement |
| Prix | Jamais exposés au frontend |
| Validation | Input sanitization côté backend |
