// ============================================================
// services/api.js — Client HTTP Axios
// ============================================================
// Lecture 5 Concept: Frontend/Backend connection via Axios
//
// Axios est une bibliothèque HTTP qui simplifie les appels API.
// Avantages sur fetch() natif :
//   - Intercepteurs (modifier requêtes/réponses globalement)
//   - Gestion automatique du JSON
//   - Annulation de requêtes
//   - Timeout facile à configurer
//
// INTERCEPTEURS :
// Un intercepteur est du code qui s'exécute avant CHAQUE requête
// ou après CHAQUE réponse. C'est du middleware côté frontend !
// ============================================================
import axios from "axios";

// URL de base lue depuis .env
// En local : http://localhost:5000/api
// Sur Vercel + Render : https://ton-backend.onrender.com/api
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Crée une instance Axios configurée
const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000, // 15 secondes max (utile sur Render free tier)
});

// ============================================================
// INTERCEPTEUR DE REQUÊTE
// S'exécute avant CHAQUE requête envoyée
// Ajoute automatiquement le JWT dans l'en-tête Authorization
// ============================================================
api.interceptors.request.use(
  (config) => {
    // Récupère le token stocké dans localStorage
    const token = localStorage.getItem("token");

    if (token) {
      // Format attendu par notre backend : "Bearer <token>"
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config; // Retourne la config modifiée
  },
  (error) => Promise.reject(error)
);

// ============================================================
// INTERCEPTEUR DE RÉPONSE
// S'exécute après CHAQUE réponse reçue
// Gère les erreurs globalement (ex: token expiré)
// ============================================================
api.interceptors.response.use(
  (response) => response, // Si succès → retourne la réponse normalement

  (error) => {
    // 401 = Non authentifié → token expiré ou invalide
    if (error.response?.status === 401) {
      // Supprime le token invalide et redirige vers login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Évite une boucle si on est déjà sur /login
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    // Rejette avec le message d'erreur du backend si disponible
    const message =
      error.response?.data?.message ||
      error.message ||
      "Une erreur est survenue";

    return Promise.reject({ ...error, message });
  }
);

// ============================================================
// SERVICES PAR RESSOURCE
// Chaque objet regroupe les appels API d'une ressource.
// Ça centralise les URLs → si le backend change, on modifie UNE seule fois.
// ============================================================

export const authService = {
  register: (data)    => api.post("/auth/register", data),
  login:    (data)    => api.post("/auth/login",    data),
  logout:   ()        => api.post("/auth/logout"),
  getMe:    ()        => api.get( "/auth/me"),
  updatePassword: (d) => api.put( "/auth/password", d),
};

export const tradeService = {
  getAll:       (params) => api.get("/trades",         { params }),
  getOne:       (id)     => api.get(`/trades/${id}`),
  create:       (data)   => api.post("/trades",         data),
  update:       (id, d)  => api.patch(`/trades/${id}`,  d),
  delete:       (id)     => api.delete(`/trades/${id}`),
  getCalendar:  (params) => api.get("/trades/calendar", { params }),
};

export const analyticsService = {
  getDashboard: ()       => api.get("/analytics/dashboard"),
  getMonthly:   (params) => api.get("/analytics/monthly",  { params }),
  getEmotions:  ()       => api.get("/analytics/emotions"),
  getSetups:    ()       => api.get("/analytics/setups"),
};

export const strategyService = {
  getAll:      (params) => api.get("/strategies",              { params }),
  getMine:     ()       => api.get("/strategies/mine"),
  getOne:      (id)     => api.get(`/strategies/${id}`),
  create:      (data)   => api.post("/strategies",              data),
  update:      (id, d)  => api.patch(`/strategies/${id}`,       d),
  delete:      (id)     => api.delete(`/strategies/${id}`),
  addReview:   (id, d)  => api.post(`/strategies/${id}/reviews`,d),
};

export const userService = {
  getProfile:       (username) => api.get(`/users/profile/${username}`),
  updateProfile:    (data)     => api.patch("/users/profile", data),
  getAll:           ()         => api.get("/users"),
  updateRole:       (id, role) => api.patch(`/users/${id}/role`, { role }),
  toggleStatus:     (id)       => api.patch(`/users/${id}/toggle-status`),
};

export const leaderboardService = {
  get: (params) => api.get("/leaderboard", { params }),
};

export const journalService = {
  getAll:   ()       => api.get("/journal"),
  getOne:   (id)     => api.get(`/journal/${id}`),
  create:   (data)   => api.post("/journal",      data),
  update:   (id, d)  => api.patch(`/journal/${id}`,d),
  delete:   (id)     => api.delete(`/journal/${id}`),
};

export const notificationService = {
  getAll:   ()   => api.get("/notifications"),
  markRead: ()   => api.patch("/notifications/read-all"),
  delete:   (id) => api.delete(`/notifications/${id}`),
};

export default api;
