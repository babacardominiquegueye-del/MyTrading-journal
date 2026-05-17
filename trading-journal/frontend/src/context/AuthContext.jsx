// ============================================================
// context/AuthContext.jsx — État d'authentification global
// ============================================================
// Lecture 5 Concept: React Context API
//
// POURQUOI CONTEXT ?
// Sans Context, on devrait passer user, token, login, logout
// en props à travers TOUS les composants (prop drilling).
// Context rend ces valeurs disponibles PARTOUT dans l'app
// sans passer par les props intermédiaires.
//
// STRUCTURE :
//   AuthProvider  → fournit les données (parent)
//   useAuth hook  → consomme les données (enfants)
// ============================================================
import React, { createContext, useContext, useReducer, useEffect } from "react";
import { authService } from "../services/api";

// 1. Créer le contexte (boîte vide)
const AuthContext = createContext(null);

// ============================================================
// REDUCER — gère les transitions d'état
// Un reducer est une fonction pure : (état actuel, action) → nouvel état
// Clair, prévisible, et facile à déboguer
// ============================================================
const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return {
        ...state,
        isAuthenticated: true,
        user:            action.payload.user,
        token:           action.payload.token,
        loading:         false,
      };
    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        user:            null,
        token:           null,
        loading:         false,
      };
    case "UPDATE_USER":
      return { ...state, user: { ...state.user, ...action.payload } };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user:    null,
  token:   localStorage.getItem("token") || null,
  loading: true, // true au démarrage → on vérifie si l'utilisateur est connecté
};

// ============================================================
// PROVIDER — fournit les données à toute l'app
// ============================================================
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Au démarrage, si un token existe en localStorage,
  // on vérifie qu'il est encore valide en appelant /api/auth/me
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        dispatch({ type: "SET_LOADING", payload: false });
        return;
      }

      try {
        const { data } = await authService.getMe();
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: { user: data.user, token },
        });
      } catch {
        // Token invalide ou expiré → nettoyer et déconnecter
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        dispatch({ type: "LOGOUT" });
      }
    };

    initAuth();
  }, []);

  // ---- Actions ----
  const login = async (credentials) => {
    const { data } = await authService.login(credentials);
    // Stocke le token dans localStorage (persiste entre les sessions)
    localStorage.setItem("token", data.token);
    dispatch({ type: "LOGIN_SUCCESS", payload: data });
    return data;
  };

  const register = async (userData) => {
    const { data } = await authService.register(userData);
    localStorage.setItem("token", data.token);
    dispatch({ type: "LOGIN_SUCCESS", payload: data });
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch({ type: "LOGOUT" });
  };

  const updateUser = (userData) => {
    dispatch({ type: "UPDATE_USER", payload: userData });
  };

  // Vérificateurs de rôle pratiques
  const isAdmin        = state.user?.role === "admin";
  const isPremium      = ["premium_trader", "admin"].includes(state.user?.role);
  const isStrategySeller = ["strategy_seller", "admin"].includes(state.user?.role);

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    isAdmin,
    isPremium,
    isStrategySeller,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ============================================================
// HOOK PERSONNALISÉ — useAuth
// Simplifie la consommation du contexte dans les composants
// Usage : const { user, login, logout } = useAuth();
// ============================================================
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur de AuthProvider");
  }
  return context;
};

export default AuthContext;
