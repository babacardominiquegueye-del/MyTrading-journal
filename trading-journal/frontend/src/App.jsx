// ============================================================
// App.jsx — Routeur principal de l'application
// ============================================================
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Pages
import LandingPage    from "./pages/LandingPage";
import LoginPage      from "./pages/LoginPage";
import RegisterPage   from "./pages/RegisterPage";
import DashboardPage  from "./pages/DashboardPage";
import TradesPage     from "./pages/TradesPage";
import TradeDetailPage from "./pages/TradeDetailPage";
import AnalyticsPage  from "./pages/AnalyticsPage";
import JournalPage    from "./pages/JournalPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import MarketplacePage from "./pages/MarketplacePage";
import StrategyDetailPage from "./pages/StrategyDetailPage";
import ProfilePage    from "./pages/ProfilePage";
import AdminPage      from "./pages/AdminPage";

// Layout
import AppLayout from "./layouts/AppLayout";

// ============================================================
// ROUTE PROTÉGÉE — redirige vers /login si non connecté
// ============================================================
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Pendant la vérification du token, affiche un loader
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-green"></div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Vérification du rôle si requis
  if (requiredRole) {
    const roleHierarchy = {
      admin:           4,
      premium_trader:  3,
      strategy_seller: 2,
      trader:          1,
    };
    const userLevel     = roleHierarchy[user?.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    if (userLevel < requiredLevel) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

// Route publique — redirige vers /dashboard si déjà connecté
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Routes protégées — utilisent le layout avec sidebar */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard"  element={<DashboardPage />} />
        <Route path="/trades"     element={<TradesPage />} />
        <Route path="/trades/:id" element={<TradeDetailPage />} />
        <Route path="/analytics"  element={<AnalyticsPage />} />
        <Route path="/journal"    element={<JournalPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/marketplace/:id" element={<StrategyDetailPage />} />
        <Route path="/profile"    element={<ProfilePage />} />

        {/* Route Premium */}
        <Route path="/leaderboard" element={
          <ProtectedRoute requiredRole="premium_trader">
            <LeaderboardPage />
          </ProtectedRoute>
        } />

        {/* Route Admin */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminPage />
          </ProtectedRoute>
        } />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
