// pages/AdminPage.jsx
import React, { useState, useEffect } from "react";
import { userService } from "../services/api";
import { Badge, Button, LoadingSpinner, Alert, Select } from "../components/common/index.jsx";

export default function AdminPage() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");
  const [tab,     setTab]     = useState("users");

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await userService.getAll();
        setUsers(data.data);
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleRoleChange = async (userId, role) => {
    try {
      const { data } = await userService.updateRole(userId, role);
      setUsers((p) => p.map((u) => (u._id === userId ? data.data : u)));
      setSuccess("Rôle mis à jour");
    } catch (err) { setError(err.message); }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const { data } = await userService.toggleStatus(userId);
      setUsers((p) => p.map((u) => (u._id === userId ? data.data : u)));
      setSuccess(data.message);
    } catch (err) { setError(err.message); }
  };

  const roleOptions = [
    { value: "trader",           label: "Trader" },
    { value: "premium_trader",   label: "Premium Trader" },
    { value: "strategy_seller",  label: "Strategy Seller" },
    { value: "admin",            label: "Admin" },
  ];

  // Stats rapides pour le dashboard admin
  const totalUsers    = users.length;
  const activeUsers   = users.filter((u) => u.isActive).length;
  const premiumUsers  = users.filter((u) => u.role === "premium_trader").length;
  const adminUsers    = users.filter((u) => u.role === "admin").length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-white text-2xl font-bold">Administration</h1>
        <p className="text-dark-400 text-sm">Gestion de la plateforme</p>
      </div>

      {error   && <Alert type="error"   message={error}   onClose={() => setError("")} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess("")} />}

      {/* Stats Admin */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Utilisateurs total", value: totalUsers,   color: "bg-accent-blue/10   border-accent-blue/20   text-accent-blue" },
          { label: "Comptes actifs",      value: activeUsers,  color: "bg-accent-green/10  border-accent-green/20  text-accent-green" },
          { label: "Premium Traders",     value: premiumUsers, color: "bg-accent-gold/10   border-accent-gold/20   text-accent-gold" },
          { label: "Admins",              value: adminUsers,   color: "bg-purple-500/10    border-purple-500/20    text-purple-400" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
            <p className="text-sm font-bold text-2xl">{s.value}</p>
            <p className="text-xs mt-1 opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Onglets */}
      <div className="flex gap-2 border-b border-dark-600 pb-2">
        {[["users", "👥 Utilisateurs"], ["stats", "📊 Statistiques"]].map(([v, l]) => (
          <button key={v} onClick={() => setTab(v)}
            className={`px-4 py-2 text-sm rounded-t-lg transition-colors ${tab === v ? "text-white border-b-2 border-accent-green -mb-2" : "text-dark-400 hover:text-white"}`}>
            {l}
          </button>
        ))}
      </div>

      {tab === "users" && (
        loading ? <LoadingSpinner /> : (
          <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-600">
                    {["Utilisateur", "Email", "Rôle", "Statut", "Trades", "Inscrit le", "Actions"].map((h) => (
                      <th key={h} className="text-left text-dark-400 text-xs font-medium px-4 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-dark-700/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-accent-green/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-accent-green text-xs font-bold">{u.username?.[0]?.toUpperCase()}</span>
                          </div>
                          <span className="text-white text-sm font-medium">{u.username}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-dark-300 text-xs">{u.email}</td>
                      <td className="px-4 py-3">
                        {/* Changement de rôle inline */}
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="bg-dark-700 border border-dark-500 rounded px-2 py-1 text-white text-xs focus:outline-none focus:ring-1 focus:ring-accent-green/30"
                        >
                          {roleOptions.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${u.isActive ? "bg-accent-green/10 text-accent-green" : "bg-accent-red/10 text-accent-red"}`}>
                          {u.isActive ? "Actif" : "Désactivé"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-dark-300 text-xs">{u.stats?.totalTrades || 0}</td>
                      <td className="px-4 py-3 text-dark-400 text-xs whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          variant={u.isActive ? "danger" : "secondary"}
                          onClick={() => handleToggleStatus(u._id)}
                        >
                          {u.isActive ? "Désactiver" : "Activer"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {tab === "stats" && (
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Répartition des rôles */}
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">Répartition des rôles</h3>
            <div className="space-y-3">
              {roleOptions.map((role) => {
                const count = users.filter((u) => u.role === role.value).length;
                const pct   = totalUsers ? Math.round((count / totalUsers) * 100) : 0;
                return (
                  <div key={role.value}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-dark-300">{role.label}</span>
                      <span className="text-dark-400">{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-dark-600 rounded-full">
                      <div
                        className="h-full bg-accent-green rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Derniers inscrits */}
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">Derniers inscrits</h3>
            <div className="space-y-3">
              {[...users]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5)
                .map((u) => (
                  <div key={u._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-dark-600 flex items-center justify-center">
                        <span className="text-dark-300 text-xs">{u.username?.[0]?.toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-white text-xs font-medium">{u.username}</p>
                        <p className="text-dark-400 text-xs">{new Date(u.createdAt).toLocaleDateString("fr-FR")}</p>
                      </div>
                    </div>
                    <Badge variant={u.role}>{u.role?.replace("_", " ")}</Badge>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
