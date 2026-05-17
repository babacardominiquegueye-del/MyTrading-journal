// pages/ProfilePage.jsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/api";
import { Button, Input, Select, Alert, Badge } from "../components/common/index.jsx";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    profile: {
      firstName:    user?.profile?.firstName    || "",
      lastName:     user?.profile?.lastName     || "",
      bio:          user?.profile?.bio          || "",
      country:      user?.profile?.country      || "",
      tradingStyle: user?.profile?.tradingStyle || "",
    },
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError]   = useState("");

  const handleChange = (e) => {
    setForm({ profile: { ...form.profile, [e.target.name]: e.target.value } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await userService.updateProfile(form);
      updateUser(data.data);
      setSuccess("Profil mis à jour !");
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const roleLabels = { trader: "Trader", premium_trader: "Premium Trader", strategy_seller: "Strategy Seller", admin: "Administrateur" };
  const styleOptions = [
    { value: "", label: "Sélectionner un style" },
    { value: "scalping", label: "Scalping" },
    { value: "day_trading", label: "Day Trading" },
    { value: "swing_trading", label: "Swing Trading" },
    { value: "position_trading", label: "Position Trading" },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <h1 className="text-white text-2xl font-bold">Mon Profil</h1>

      {/* Infos compte */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-accent-green/20 flex items-center justify-center">
            <span className="text-accent-green text-2xl font-bold">{user?.username?.[0]?.toUpperCase()}</span>
          </div>
          <div>
            <p className="text-white font-bold text-lg">{user?.username}</p>
            <p className="text-dark-400 text-sm">{user?.email}</p>
            <div className="mt-1"><Badge variant={user?.role}>{roleLabels[user?.role]}</Badge></div>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-dark-600">
          {[
            { label: "Win Rate", value: `${user?.stats?.winRate || 0}%` },
            { label: "PnL Total", value: `${user?.stats?.totalPnL >= 0 ? "+" : ""}${user?.stats?.totalPnL?.toFixed(2) || 0}` },
            { label: "Trades", value: user?.stats?.totalTrades || 0 },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-white font-bold">{s.value}</p>
              <p className="text-dark-400 text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Formulaire */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4">Modifier le profil</h3>
        {success && <Alert type="success" message={success} onClose={() => setSuccess("")} className="mb-4" />}
        {error   && <Alert type="error"   message={error}   onClose={() => setError("")}   className="mb-4" />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Prénom" name="firstName" value={form.profile.firstName} onChange={handleChange} />
            <Input label="Nom" name="lastName" value={form.profile.lastName} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Bio</label>
            <textarea name="bio" value={form.profile.bio} onChange={handleChange} rows={3} maxLength={500}
              placeholder="Parlez de vous, de votre expérience en trading..."
              className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-accent-green/30 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Pays" name="country" value={form.profile.country} onChange={handleChange} placeholder="France" />
            <Select label="Style de trading" name="tradingStyle" value={form.profile.tradingStyle} onChange={handleChange} options={styleOptions} />
          </div>
          <Button type="submit" loading={saving}>Sauvegarder</Button>
        </form>
      </div>

      {/* Membre depuis */}
      <p className="text-dark-500 text-xs text-center">
        Membre depuis {new Date(user?.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
      </p>
    </div>
  );
}
