// ============================================================
// pages/LoginPage.jsx
// ============================================================
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Alert, Button, Input } from "../components/common/index.jsx";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]       = useState({ email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  // Connexion rapide avec les comptes de démo
  const loginDemo = async (email) => {
    setLoading(true);
    try {
      await login({ email, password: "demo1234" });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Panneau gauche — décoratif */}
      <div className="hidden lg:flex flex-1 bg-dark-800 border-r border-dark-600 flex-col justify-center items-center p-12">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-accent-green rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-dark-900 font-bold text-2xl">TJ</span>
          </div>
          <h1 className="text-white text-3xl font-bold mb-4">TradingJournal</h1>
          <p className="text-dark-400 text-lg mb-8">
            Suivez vos trades, analysez vos performances, améliorez votre trading.
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: "Traders actifs", value: "1,200+" },
              { label: "Trades analysés", value: "50k+" },
              { label: "Win rate moyen", value: "54%" },
            ].map((stat) => (
              <div key={stat.label} className="bg-dark-700 rounded-xl p-4 border border-dark-600">
                <p className="text-accent-green font-bold text-xl">{stat.value}</p>
                <p className="text-dark-400 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panneau droit — formulaire */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <div className="w-12 h-12 bg-accent-green rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-dark-900 font-bold">TJ</span>
            </div>
            <h1 className="text-white font-bold text-xl">TradingJournal</h1>
          </div>

          <h2 className="text-white text-2xl font-bold mb-1">Connexion</h2>
          <p className="text-dark-400 text-sm mb-6">
            Pas encore de compte ?{" "}
            <Link to="/register" className="text-accent-green hover:underline">S'inscrire</Link>
          </p>

          {error && <Alert type="error" message={error} onClose={() => setError("")} className="mb-4" />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="trader@exemple.com"
              required
            />
            <Input
              label="Mot de passe"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Se connecter
            </Button>
          </form>

          {/* Comptes démo */}
          <div className="mt-6">
            <p className="text-dark-400 text-xs text-center mb-3">— Comptes de démonstration —</p>
            <div className="space-y-2">
              {[
                { label: "👤 Trader",         email: "trader@demo.com",  role: "Trader" },
                { label: "⭐ Premium Trader", email: "premium@demo.com", role: "Premium" },
                { label: "🔧 Admin",           email: "admin@demo.com",   role: "Admin" },
              ].map((demo) => (
                <button
                  key={demo.email}
                  onClick={() => loginDemo(demo.email)}
                  disabled={loading}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-dark-700 border border-dark-600 hover:border-accent-green/40 hover:bg-dark-600 rounded-lg text-sm text-white transition-colors disabled:opacity-50"
                >
                  <span>{demo.label}</span>
                  <span className="text-dark-400 text-xs">{demo.role}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
