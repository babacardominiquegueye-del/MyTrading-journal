# 📊 TradingJournal — Projet MERN Full-Stack

> Projet éducatif complet pour apprendre le développement backend et frontend avec la stack MERN (MongoDB, Express, React, Node.js).

---

## 🎯 Objectif du Projet

Ce projet est conçu comme **un projet d'apprentissage** qui enseigne :

- ✅ **Express.js** — Serveur, routes, middleware
- ✅ **REST APIs** — Conventions RESTful, status codes
- ✅ **MongoDB & Mongoose** — Modélisation de données, relations
- ✅ **JWT Authentication** — Tokens, sessions sans état
- ✅ **RBAC** — Contrôle d'accès basé sur les rôles
- ✅ **Middleware** — Pipeline de traitement des requêtes
- ✅ **React & Context API** — État global, composants réutilisables
- ✅ **Axios** — Communication frontend/backend
- ✅ **Recharts** — Visualisation de données
- ✅ **Déploiement** — Render (backend) + Vercel (frontend)

---

## 🏗️ Architecture du Projet

```
trading-journal/
├── backend/                    # Serveur Node.js + Express
│   ├── config/
│   │   └── db.js              # Connexion MongoDB
│   ├── controllers/            # Logique métier (CRUD)
│   │   ├── auth.controller.js
│   │   ├── trade.controller.js
│   │   ├── analytics.controller.js
│   │   ├── strategy.controller.js
│   │   ├── user.controller.js
│   │   ├── leaderboard.controller.js
│   │   ├── journal.controller.js
│   │   └── notification.controller.js
│   ├── middleware/             # Fonctions intermédiaires
│   │   ├── auth.middleware.js  # JWT + RBAC
│   │   ├── error.middleware.js # Gestion d'erreurs globale
│   │   └── validation.middleware.js
│   ├── models/                 # Schémas Mongoose
│   │   ├── User.js
│   │   ├── Trade.js
│   │   ├── Strategy.js
│   │   ├── Review.js
│   │   ├── JournalEntry.js
│   │   └── Notification.js
│   ├── routes/                 # Définition des routes REST
│   │   ├── auth.routes.js
│   │   ├── trade.routes.js
│   │   ├── analytics.routes.js
│   │   ├── strategy.routes.js
│   │   ├── user.routes.js
│   │   ├── leaderboard.routes.js
│   │   ├── journal.routes.js
│   │   └── notification.routes.js
│   ├── utils/
│   │   └── seeder.js          # Données de démonstration
│   ├── server.js              # Point d'entrée du serveur
│   ├── package.json
│   └── .env.example
│
└── frontend/                   # Application React
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   └── common/        # Composants réutilisables
    │   │       ├── index.jsx  # StatCard, Badge, Button, Input, Modal…
    │   │       └── NotificationBell.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx # État d'authentification global
    │   ├── hooks/
    │   │   └── useTrades.js   # Hooks personnalisés
    │   ├── layouts/
    │   │   └── AppLayout.jsx  # Layout avec sidebar
    │   ├── pages/             # Pages de l'application
    │   │   ├── LandingPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── TradesPage.jsx
    │   │   ├── TradeDetailPage.jsx
    │   │   ├── AnalyticsPage.jsx
    │   │   ├── JournalPage.jsx
    │   │   ├── LeaderboardPage.jsx
    │   │   ├── MarketplacePage.jsx
    │   │   ├── StrategyDetailPage.jsx
    │   │   ├── ProfilePage.jsx
    │   │   └── AdminPage.jsx
    │   ├── services/
    │   │   └── api.js         # Client Axios + services
    │   ├── App.jsx            # Routeur principal
    │   ├── index.js
    │   └── index.css
    ├── tailwind.config.js
    ├── vercel.json
    └── package.json
```

---

## 🚀 Installation Locale

### Prérequis
- Node.js 18+
- MongoDB installé localement ou compte [MongoDB Atlas](https://www.mongodb.com/atlas)

### 1. Cloner et installer

```bash
git clone https://github.com/ton-username/trading-journal.git
cd trading-journal

# Backend
cd backend
npm install
cp .env.example .env
# → Remplis les variables dans .env

# Frontend (autre terminal)
cd ../frontend
npm install
cp .env.example .env
# → Remplis REACT_APP_API_URL
```

### 2. Variables d'environnement

**backend/.env**
```env
MONGO_URI=mongodb://localhost:27017/trading-journal
JWT_SECRET=une_cle_tres_longue_et_aleatoire
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**frontend/.env**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Lancer le projet

```bash
# Terminal 1 — Backend
cd backend
npm run dev      # Lance avec nodemon (hot reload)

# Terminal 2 — Frontend
cd frontend
npm start        # Lance React sur http://localhost:3000
```

### 4. Alimenter la base de données (optionnel)

```bash
cd backend
npm run seed     # Crée 3 comptes démo + 145 trades réalistes

# Pour supprimer les données de démo :
npm run seed -- --destroy
```

**Comptes de démonstration :**
| Email | Mot de passe | Rôle |
|-------|-------------|------|
| trader@demo.com | demo1234 | Trader |
| premium@demo.com | demo1234 | Premium Trader |
| admin@demo.com | demo1234 | Admin |

---

## ☁️ Déploiement

### Backend sur Render

1. Crée un compte sur [render.com](https://render.com)
2. **New → Web Service → Connect GitHub repo**
3. Configuration :
   - **Root Directory** : `backend`
   - **Build Command** : `npm install`
   - **Start Command** : `node server.js`
4. **Environment Variables** — Ajoute toutes les variables de `.env` :
   ```
   MONGO_URI         = mongodb+srv://...
   JWT_SECRET        = ta_cle_secrete
   JWT_EXPIRE        = 7d
   NODE_ENV          = production
   FRONTEND_URL      = https://ton-projet.vercel.app
   ```
5. **Deploy** → Copie l'URL générée (ex: `https://trading-journal-api.onrender.com`)

> ⚠️ Sur Render (plan gratuit), le serveur "dort" après 15 min d'inactivité.
> Premier appel peut prendre 30-60 secondes (cold start).

### Frontend sur Vercel

1. Crée un compte sur [vercel.com](https://vercel.com)
2. **New Project → Import GitHub repo**
3. Configuration :
   - **Root Directory** : `frontend`
   - **Framework Preset** : Create React App
4. **Environment Variables** :
   ```
   REACT_APP_API_URL = https://trading-journal-api.onrender.com/api
   ```
5. **Deploy** ✅

---

## 📡 Documentation API

### Auth
```
POST /api/auth/register   → Inscription
POST /api/auth/login      → Connexion (retourne JWT)
GET  /api/auth/me         → Profil connecté  [Protected]
POST /api/auth/logout     → Déconnexion      [Protected]
PUT  /api/auth/password   → Changer mdp      [Protected]
```

### Trades
```
GET    /api/trades              → Liste des trades        [Private]
POST   /api/trades              → Créer un trade          [Private]
GET    /api/trades/:id          → Détail d'un trade       [Private]
PATCH  /api/trades/:id          → Modifier un trade       [Private]
DELETE /api/trades/:id          → Supprimer un trade      [Private]
GET    /api/trades/calendar     → Trades par mois         [Private]
```

**Paramètres de filtre (GET /api/trades) :**
```
?result=win|loss|open|breakeven
?direction=buy|sell
?pair=EUR/USD
?from=2024-01-01&to=2024-12-31
?page=1&limit=20
?sortBy=entryDate&order=desc
```

### Analytics
```
GET /api/analytics/dashboard    → Stats globales     [Private]
GET /api/analytics/monthly      → Stats mensuelles   [Private]
GET /api/analytics/emotions     → Analyse émotions   [Premium]
GET /api/analytics/setups       → Analyse setups     [Private]
```

### Strategies
```
GET    /api/strategies          → Marketplace public
GET    /api/strategies/mine     → Mes stratégies    [Private]
GET    /api/strategies/:id      → Détail stratégie
POST   /api/strategies          → Créer             [StrategySeller]
PATCH  /api/strategies/:id      → Modifier          [Private]
DELETE /api/strategies/:id      → Supprimer         [Private]
POST   /api/strategies/:id/reviews → Ajouter avis   [Private]
```

### Leaderboard
```
GET /api/leaderboard            → Classement        [Premium]
?period=alltime|monthly|weekly
?metric=pnl|winrate|trades
```

### Format des réponses API
```json
// Succès
{
  "success": true,
  "data": { ... },
  "count": 10,
  "total": 150
}

// Erreur
{
  "success": false,
  "message": "Trade introuvable"
}

// Erreur de validation
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "pair", "message": "La paire est requise" }
  ]
}
```

---

## 🎓 Notes d'Apprentissage

### Pourquoi cette architecture ?

**Modular Monolith** = une seule application bien organisée.
- Plus simple qu'une architecture microservices
- Plus facile à déployer (un seul serveur)
- Structure claire : chaque dossier a un rôle précis

### Flux d'une requête HTTP

```
Client (React)
    ↓ axios.get('/api/trades', { headers: { Authorization: 'Bearer TOKEN' } })
Express Server
    ↓ morgan (log la requête)
    ↓ cors (vérifie l'origine)
    ↓ express.json() (parse le body)
    ↓ router.get('/trades', ...)
    ↓ protect middleware (vérifie JWT)
    ↓ getTrades controller (logique métier)
    ↓ Trade.find({ createdBy: req.user._id })
MongoDB
    ↓ retourne les documents
Controller
    ↓ res.json({ success: true, data: trades })
Client
    ↓ data.data → affiche dans React
```

### Pourquoi JWT ?

JWT est **sans état** (stateless). Le serveur ne stocke pas de sessions.
Chaque requête porte son propre token qui contient l'identité de l'utilisateur.

**Avantages :**
- Scalable (pas de base de données de sessions)
- Fonctionne avec plusieurs serveurs
- Parfait pour les APIs REST

**Inconvénients :**
- Impossible d'invalider un token (sauf token blacklist)
- Payload visible (base64 encodé, pas chiffré)

### Pourquoi bcrypt est lent ?

**Intentionnellement !** bcrypt est conçu pour être coûteux en calcul.
Avec 10 salt rounds = 2^10 = 1024 itérations de hachage.
Un attaquant qui vole la base de données met des siècles à craquer les mots de passe.

---

## 🔐 Sécurité

- ✅ Mots de passe hachés avec bcrypt (10 rounds)
- ✅ JWT avec expiration (7 jours par défaut)
- ✅ Variables sensibles dans `.env`
- ✅ Validation des entrées avec express-validator
- ✅ Ownership validation (chaque utilisateur accède uniquement à ses données)
- ✅ RBAC (4 rôles avec permissions distinctes)
- ✅ CORS configuré pour n'autoriser que le frontend
- ✅ Limit body size (10kb max)
- ✅ Pas d'exposition du stack trace en production

---

## 📚 Technologies utilisées

| Technologie | Version | Usage |
|-------------|---------|-------|
| Node.js     | 18+     | Runtime JavaScript backend |
| Express.js  | 4.18    | Framework HTTP |
| MongoDB     | 7+      | Base de données NoSQL |
| Mongoose    | 8.0     | ODM (Object Document Mapper) |
| bcryptjs    | 2.4     | Hachage de mots de passe |
| jsonwebtoken| 9.0     | Authentification JWT |
| React       | 18.2    | Framework frontend |
| React Router| 6.21    | Routage client-side |
| Axios       | 1.6     | Client HTTP |
| Recharts    | 2.10    | Graphiques |
| Tailwind CSS| 3.x     | Styles utilitaires |

---

*Projet éducatif — MERN Stack Learning Project*
