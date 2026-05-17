// pages/AnalyticsPage.jsx
import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { analyticsService } from "../services/api";
import { StatCard, LoadingSpinner, EmptyState, Badge } from "../components/common/index.jsx";

const COLORS = ["#26a69a", "#ef5350", "#2196f3", "#f5a623", "#9c27b0", "#00bcd4"];

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-xs">
      <p className="text-dark-300 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-mono">
          {p.name}: {typeof p.value === "number" ? p.value.toFixed(2) : p.value}
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const [stats,   setStats]   = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [setups,  setSetups]  = useState([]);
  const [year,    setYear]    = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [sRes, mRes, setupRes] = await Promise.all([
          analyticsService.getDashboard(),
          analyticsService.getMonthly({ year }),
          analyticsService.getSetups(),
        ]);
        setStats(sRes.data.data);
        setMonthly(mRes.data.data.monthly);
        setSetups(setupRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [year]);

  if (loading) return <LoadingSpinner text="Calcul des statistiques..." />;

  const s = stats?.summary;

  if (!s || s.totalTrades === 0) {
    return (
      <EmptyState icon="📊" title="Pas assez de données"
        description="Ajoutez des trades pour voir vos analytiques."
      />
    );
  }

  // Données pour le donut Win/Loss
  const pieData = [
    { name: "Wins",     value: s.wins },
    { name: "Losses",   value: s.losses },
    { name: "Breakeven",value: s.breakevens },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">Analytiques</h1>
        <p className="text-dark-400 text-sm">Analyse complète de vos performances</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Win Rate" value={`${s.winRate}%`} color={s.winRate >= 50 ? "green" : "red"} icon="🎯"
          subtitle={`${s.totalTrades} trades fermés`} />
        <StatCard title="PnL Total" value={`${s.totalPnL >= 0 ? "+" : ""}${s.totalPnL?.toFixed(2)}`}
          color={s.totalPnL >= 0 ? "green" : "red"} icon="💰" />
        <StatCard title="R/R Moyen" value={`${s.avgRR?.toFixed(2)}R`} color="gold" icon="⚖️"
          subtitle="Risk/Reward ratio" />
        <StatCard title="Meilleure Paire" value={stats?.bestPair?.pair || "—"}
          subtitle={stats?.bestPair ? `+${stats.bestPair.pnl}` : ""} color="blue" icon="🏆" />
      </div>

      {/* Graphiques ligne */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Performance mensuelle</h3>
          <div className="flex gap-2">
            {[new Date().getFullYear(), new Date().getFullYear() - 1].map((y) => (
              <button key={y} onClick={() => setYear(y)}
                className={`text-xs px-3 py-1 rounded-lg border transition-colors ${year === y ? "border-accent-green text-accent-green bg-accent-green/10" : "border-dark-500 text-dark-400 hover:border-dark-400"}`}>
                {y}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2e39" />
            <XAxis dataKey="month" tick={{ fill: "#4a4f5e", fontSize: 11 }} />
            <YAxis tick={{ fill: "#4a4f5e", fontSize: 11 }} />
            <Tooltip content={<Tip />} />
            <Legend />
            <Bar dataKey="pnl" name="PnL" radius={[4, 4, 0, 0]}>
              {monthly.map((entry, i) => (
                <Cell key={i} fill={entry.pnl >= 0 ? "#26a69a" : "#ef5350"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Win Rate mensuel + Donut */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Win Rate mensuel</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2e39" />
              <XAxis dataKey="month" tick={{ fill: "#4a4f5e", fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: "#4a4f5e", fontSize: 11 }} unit="%" />
              <Tooltip content={<Tip />} />
              <Line type="monotone" dataKey="winRate" stroke="#26a69a" strokeWidth={2} dot={{ r: 3 }} name="Win Rate %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Distribution Wins / Losses</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? "#26a69a" : i === 1 ? "#ef5350" : "#f5a623"} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3 flex-1">
              {pieData.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-dark-300 text-sm">{d.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white text-sm font-bold">{d.value}</span>
                    <span className="text-dark-400 text-xs ml-1">
                      ({Math.round((d.value / s.totalTrades) * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Setups */}
      {setups.length > 0 && (
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Performance par Setup</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-600">
                  {["Setup", "Trades", "Win Rate", "PnL Total", "RR Moyen"].map((h) => (
                    <th key={h} className="text-left text-dark-400 text-xs font-medium px-3 py-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {setups.map((s) => (
                  <tr key={s.setup} className="hover:bg-dark-700/40">
                    <td className="px-3 py-3"><Badge>{s.setup}</Badge></td>
                    <td className="px-3 py-3 text-white text-xs">{s.trades}</td>
                    <td className="px-3 py-3">
                      <span className={`text-xs font-bold ${s.winRate >= 50 ? "text-accent-green" : "text-accent-red"}`}>
                        {s.winRate}%
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-xs font-mono font-bold ${s.totalPnL >= 0 ? "text-accent-green" : "text-accent-red"}`}>
                        {s.totalPnL >= 0 ? "+" : ""}{s.totalPnL}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-dark-300 text-xs font-mono">{s.avgRR}R</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Paires */}
      {stats?.allPairs?.length > 0 && (
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Performance par Paire</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.allPairs.slice(0, 8)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2e39" />
              <XAxis type="number" tick={{ fill: "#4a4f5e", fontSize: 11 }} />
              <YAxis dataKey="pair" type="category" tick={{ fill: "#4a4f5e", fontSize: 11 }} width={70} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="pnl" name="PnL" radius={[0, 4, 4, 0]}>
                {stats.allPairs.slice(0, 8).map((entry, i) => (
                  <Cell key={i} fill={entry.pnl >= 0 ? "#26a69a" : "#ef5350"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
