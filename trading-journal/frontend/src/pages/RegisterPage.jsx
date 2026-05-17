// pages/RegisterPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Alert, Button, Input, Select } from "../components/common/index.jsx";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm] = useState({
    username: "", email: "", password: "", confirmPassword: "", role: "trader",
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setApiError("");
  };

  const validate = () => {
    const newErrors = {};
    if (!form.username || form.username.length < 3) newErrors.username = "Minimum 3 caractères";
    if (!form.email)     newErrors.email    = "Email requis";
    if (!form.password || form.password.length < 6) newErrors.password = "Minimum 6 caractères";
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      await register({ username: form.username, email: form.email, password: form.password, role: form.role });
      navigate("/dashboard");
    } catch (err) {
      setApiError(err.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: "trader",           label: "Trader — Suivi personnel" },
    { value: "premium_trader",   label: "Premium Trader — Analytiques avancées" },
    { value: "strategy_seller",  label: "Strategy Seller — Vendre des stratégies" },
  ];

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-accent-green rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-dark-900 font-bold">TJ</span>
          </div>
          <h1 className="text-white font-bold text-2xl mb-1">Créer un compte</h1>
          <p className="text-dark-400 text-sm">
            Déjà inscrit ?{" "}
            <Link to="/login" className="text-accent-green hover:underline">Se connecter</Link>
          </p>
        </div>

        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
          {apiError && <Alert type="error" message={apiError} onClose={() => setApiError("")} className="mb-4" />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Nom d'utilisateur" name="username" value={form.username}
              onChange={handleChange} placeholder="TraderAlex" error={errors.username} required />
            <Input label="Email" name="email" type="email" value={form.email}
              onChange={handleChange} placeholder="alex@exemple.com" error={errors.email} required />
            <Select label="Type de compte" name="role" value={form.role}
              onChange={handleChange} options={roleOptions} />
            <Input label="Mot de passe" name="password" type="password" value={form.password}
              onChange={handleChange} placeholder="Minimum 6 caractères" error={errors.password} required />
            <Input label="Confirmer le mot de passe" name="confirmPassword" type="password"
              value={form.confirmPassword} onChange={handleChange} placeholder="••••••••"
              error={errors.confirmPassword} required />

            <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
              Créer mon compte
            </Button>
          </form>

          <p className="text-dark-500 text-xs text-center mt-4">
            En vous inscrivant, vous acceptez nos conditions d'utilisation
          </p>
        </div>
      </div>
    </div>
  );
}
