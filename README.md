# 🔍 TrueScope by Joël

**Diagnostic intelligent gratuit pour la serrurerie, plomberie et électricité.**

TrueScope utilise l'IA (Google Gemini) pour analyser les problèmes des particuliers et leur fournir un diagnostic détaillé gratuitement. L'objectif : aider les utilisateurs à comprendre leur problème et les connecter avec un artisan qualifié.

> ⚠️ **Note importante** : TrueScope est un outil de diagnostic, PAS un outil de devis. Aucun prix n'est affiché aux utilisateurs.

---

## 🎯 Concept

```
┌─────────────────────────────────────────────────────────────┐
│  UTILISATEUR                                                 │
│  "Ma serrure est bloquée, je ne peux plus rentrer chez moi" │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  TRUESCOPE (IA Gemini)                                       │
│  ✓ Analyse le problème                                       │
│  ✓ Identifie le type d'intervention                         │
│  ✓ Liste le matériel nécessaire                             │
│  ✓ Propose des recommandations                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  DIAGNOSTIC GRATUIT                                          │
│  + Bouton "TROUVER UN JOËL" → Lead qualifié pour l'artisan  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🌟 Fonctionnalités

| Pour l'utilisateur | Pour Joël (artisan) |
|--------------------|---------------------|
| ✅ Diagnostic IA gratuit en 30 secondes | ✅ Leads pré-qualifiés |
| ✅ Comprend son problème | ✅ Client déjà informé |
| ✅ Sait quel matériel sera nécessaire | ✅ Intervention plus efficace |
| ✅ Recommandations professionnelles | ✅ Conversion facilitée |
| ✅ Analyse de photos | ✅ Historique des demandes |

---

## 🏗️ Architecture

```
TrueScope/
├── backend/                 # API Node.js/Express/TypeScript
│   ├── src/
│   │   ├── config/         # Configuration Firebase & Gemini
│   │   ├── services/       # Logique métier (analyse IA)
│   │   ├── routes/         # Endpoints API REST
│   │   └── types/          # Types TypeScript
│   └── package.json
│
├── frontend/               # Interface React/TypeScript/Vite
│   ├── src/
│   │   ├── components/     # Composants réutilisables
│   │   ├── pages/          # Pages de l'application
│   │   ├── services/       # Appels API
│   │   └── types/          # Types TypeScript
│   └── package.json
│
├── docs/                   # Documentation technique
└── .cursorrules            # Règles pour Cursor AI
```

---

## 🚀 Installation

### Prérequis

- Node.js 18+
- npm
- Clé API Gemini ([Google AI Studio](https://aistudio.google.com/))
- Projet Firebase avec Firestore

### 1. Cloner et installer

```bash
git clone <repo-url>
cd TrueScope
npm run install:all
```

### 2. Configuration Backend

Créer `backend/.env` :

```env
# Clé API Gemini (obligatoire)
GEMINI_API_KEY=votre_clé_gemini

# Firebase (obligatoire)
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

# Serveur
PORT=3001
NODE_ENV=development
```

Placer le fichier `firebase-service-account.json` dans `backend/`.

### 3. Lancer l'application

```bash
# Backend + Frontend simultanément
npm run dev

# Ou séparément :
cd backend && npm run dev    # http://localhost:3001
cd frontend && npm run dev   # http://localhost:5180
```

---

## 📖 Utilisation

### Créer un diagnostic

1. Accéder à `http://localhost:5180`
2. Sélectionner le métier (🔐 Serrurerie, 🔧 Plomberie, ⚡ Électricité)
3. Décrire le problème
4. (Optionnel) Ajouter des photos
5. Cliquer sur **"Analyser"**

### Résultat du diagnostic

L'utilisateur reçoit :
- 🔍 **Diagnostic** : Explication du problème identifié
- 🛠️ **Solution** : Description de l'intervention recommandée
- 📦 **Matériel** : Liste du matériel nécessaire
- 💡 **Recommandations** : Conseils professionnels

### Contacter un artisan

Bouton **"Trouver un Joël"** → Formulaire de contact ou appel direct

---

## 🔌 API REST

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/demandes` | POST | Créer et analyser un diagnostic |
| `/api/demandes` | GET | Lister les diagnostics |
| `/api/demandes/:id` | GET | Détails d'un diagnostic |
| `/api/demandes/:id/validate` | POST | Valider un diagnostic |
| `/api/demandes/:id/reanalyze` | POST | Relancer l'analyse IA |
| `/api/interventions` | GET | Interventions de référence |
| `/api/interventions/search` | GET | Recherche par similarité |
| `/api/health` | GET | Vérification de santé |

---

## 💻 Technologies

**Backend:**
- Node.js + TypeScript
- Express
- Firebase Admin SDK (Firestore)
- Google Generative AI (Gemini Pro)

**Frontend:**
- React 18 + TypeScript
- Vite
- React Router v6
- CSS Variables (design custom)

---

## 📂 Documentation

- [Architecture technique](docs/ARCHITECTURE.md)
- [Modèle économique](docs/BUSINESS_MODEL.md)
- [Guide de développement](docs/HANDOFF_PROMPT.md)

---

## 🔒 Sécurité

- Ne jamais commiter `.env` ou les clés Firebase
- Les fichiers sensibles sont dans `.gitignore`
- Aucune donnée de prix exposée côté client

---

## 📝 License

Propriétaire - Joël © 2024
