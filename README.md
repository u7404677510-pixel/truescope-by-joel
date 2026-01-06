# 🔧 Joël Wrapper

Système intelligent de devis pour la serrurerie, plomberie et électricité.

Joël est un wrapper qui sert de cerveau intermédiaire entre le client, l'IA (Gemini Pro) et les règles métier. Il analyse les demandes de devis, compare avec les interventions passées et propose des solutions structurées.

## 🌟 Fonctionnalités

- **Analyse intelligente** : Gemini Pro analyse le problème et propose une solution technique
- **Base de référence évolutive** : Les interventions validées enrichissent la base de données
- **Recherche de similarité** : Comparaison avec les interventions passées pour des solutions plus précises
- **Multi-métiers** : Serrurerie, plomberie et électricité
- **Interface moderne** : Dashboard complet pour la gestion des demandes

## 🏗️ Architecture

```
joel-wrapper/
├── backend/                 # API Node.js/Express/TypeScript
│   ├── src/
│   │   ├── config/         # Configuration Firebase & Gemini
│   │   ├── services/       # Logique métier
│   │   ├── routes/         # Endpoints API
│   │   └── types/          # Types TypeScript
│   └── package.json
├── frontend/               # Interface React/TypeScript/Vite
│   ├── src/
│   │   ├── components/     # Composants réutilisables
│   │   ├── pages/          # Pages de l'application
│   │   ├── services/       # Appels API
│   │   └── types/          # Types TypeScript
│   └── package.json
└── package.json            # Scripts racine
```

## 🚀 Installation

### Prérequis

- Node.js 18+
- npm ou yarn
- Clé API Gemini (Google AI Studio)
- Projet Firebase (optionnel pour la persistance)

### 1. Cloner et installer les dépendances

```bash
cd GeminiwrapperV2
npm run install:all
```

### 2. Configuration

Créez un fichier `.env` dans le dossier `backend/` :

```env
# Clé API Gemini (obligatoire)
GEMINI_API_KEY=votre_clé_api_gemini

# Firebase (optionnel - le système fonctionne en mode mock sans)
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

# Serveur
PORT=3001
NODE_ENV=development
```

### 3. Lancer l'application

```bash
# Lancer le backend et le frontend simultanément
npm run dev

# Ou séparément :
npm run dev:backend   # Backend sur http://localhost:3001
npm run dev:frontend  # Frontend sur http://localhost:5173
```

## 📖 Utilisation

### Créer une demande de devis

1. Accédez à l'interface web : `http://localhost:5173`
2. Cliquez sur "Nouvelle demande"
3. Sélectionnez le métier (serrurerie, plomberie, électricité)
4. Décrivez le problème du client
5. Ajoutez des URLs de photos/vidéos (optionnel)
6. Cliquez sur "Analyser avec Joël"

### Valider une solution

Après analyse, vous pouvez :
- **Valider** : Enregistre l'intervention comme référence
- **Réanalyser** : Demande une nouvelle analyse
- **Modifier** : Ajustez la solution avant validation

### API REST

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/demandes` | POST | Créer et analyser une demande |
| `/api/demandes` | GET | Lister les demandes |
| `/api/demandes/:id` | GET | Détails d'une demande |
| `/api/demandes/:id/validate` | POST | Valider une demande |
| `/api/interventions` | GET | Lister les interventions de référence |
| `/api/interventions/search` | GET | Rechercher des interventions similaires |
| `/api/interventions/stats` | GET | Statistiques du système |

## 💡 Comment ça fonctionne

```
1. Client soumet une demande
          ↓
2. Joël recherche des interventions similaires (Firebase)
          ↓
3. Gemini Pro analyse le problème avec le contexte
          ↓
4. Proposition de solution (sans prix)
          ↓
5. Validation → Nouvelle intervention de référence
```

### Points clés

- **L'IA ne génère pas de prix** : Seules les lignes de devis sont proposées
- **Apprentissage continu** : Plus vous validez, plus Joël est précis
- **Mode mock** : Fonctionne sans Firebase (données en mémoire)

## 🔧 Configuration Firebase

Pour la persistance des données, configurez Firebase :

1. Créez un projet Firebase
2. Activez Firestore Database
3. Générez une clé de service account
4. Placez le fichier JSON dans `backend/`
5. Configurez le chemin dans `.env`

## 📊 Structure des données

### Collection `interventions`

```typescript
{
  id: string,
  metier: "serrurerie" | "plomberie" | "electricite",
  description: string,
  keywords: string[],
  problemType: string,
  mediaUrls: string[],
  solution: {
    description: string,
    diagnostic: string,
    lignesDevis: Array<{
      designation: string,
      unite: string,
      quantite: number
    }>,
    variantes?: Array<...>
  },
  validated: boolean,
  createdAt: Timestamp,
  validatedAt: Timestamp
}
```

## 🛠️ Développement

### Scripts disponibles

```bash
npm run dev           # Lancer tout
npm run dev:backend   # Backend seul
npm run dev:frontend  # Frontend seul
npm run build         # Build production
```

### Technologies utilisées

**Backend:**
- Node.js + TypeScript
- Express
- Firebase Admin SDK
- Google Generative AI (Gemini)

**Frontend:**
- React 18 + TypeScript
- Vite
- React Router
- CSS Variables + Custom Design

## 📝 License

MIT

