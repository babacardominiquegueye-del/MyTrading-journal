// ============================================================
// pages/LeaderboardPage.jsx
// ============================================================
import React, { useState, useEffect } from "react";
import { leaderboardService } from "../services/api";
import { LoadingSpinner, Badge } from "../components/common/index.jsx";
import { useAuth } from "../context/AuthContext";

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [period,  setPeriod]  = useState("alltime");
  const [metric,  setMetric]  = useState("pnl");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await leaderboardService.get({ period, metric });
        setData(res.data.data);
      } catch {}
      finally { setLoading(false); }
    };
    fetch();
  }, [period, metric]);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-white text-2xl font-bold">Classement</h1>
        <p className="text-dark-400 text-sm">Top traders de la plateforme</p>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 bg-dark-800 border border-dark-600 rounded-xl p-4">
        <div className="flex gap-2">
          {[["alltime","Tout temps"],["monthly","Ce mois"],["weekly","Cette semaine"]].map(([v, l]) => (
            <button key={v} onClick={() => setPeriod(v)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${period === v ? "border-accent-green text-accent-green bg-accent-green/10" : "border-dark-500 text-dark-400 hover:border-dark-400"}`}>
              {l}
            </button>
          ))}
        </div>
        <div className="flex gap-2 ml-auto">
          {[["pnl","PnL"],["winrate","Win Rate"],["trades","Trades"]].map(([v, l]) => (
            <button key={v} onClick={() => setMetric(v)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${metric === v ? "border-accent-blue text-accent-blue bg-accent-blue/10" : "border-dark-500 text-dark-400 hover:border-dark-400"}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-600">
                {["#", "Trader", "Rôle", "Trades", "Win Rate", "RR Moyen", "PnL"].map((h) => (
                  <th key={h} className="text-left text-dark-400 text-xs font-medium px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {data.map((entry, i) => {
                const isMe = entry._id?.toString() === user?._id?.toString();
                return (
                  <tr key={i} className={`hover:bg-dark-700/40 transition-colors ${isMe ? "bg-accent-green/5 border-l-2 border-accent-green" : ""}`}>
                    <td className="px-4 py-3 text-center">
                      <span className="text-base">{medals[i] || <span className="text-dark-400 text-xs font-mono">{entry.rank}</span>}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-accent-green/20 flex items-center justify-center">
                          <span className="text-accent-green text-xs font-bold">{entry.username?.[0]?.toUpperCase()}</span>
                        </div>
                        <span className={`text-sm font-medium ${isMe ? "text-accent-green" : "text-white"}`}>
                          {entry.username} {isMe && "(Vous)"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge variant={entry.role}>{entry.role?.replace("_", " ")}</Badge></td>
                    <td className="px-4 py-3 text-dark-300 text-xs">{entry.totalTrades}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold ${entry.winRate >= 50 ? "text-accent-green" : "text-accent-red"}`}>{entry.winRate}%</span>
                    </td>
                    <td className="px-4 py-3 text-dark-300 text-xs font-mono">{entry.avgRR?.toFixed(2)}R</td>
                    <td className="px-4 py-3">
                      <span className={`font-mono text-sm font-bold ${entry.totalPnL >= 0 ? "text-accent-green" : "text-accent-red"}`}>
                        {entry.totalPnL >= 0 ? "+" : ""}{entry.totalPnL?.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {data.length === 0 && <p className="text-dark-400 text-center py-10 text-sm">Aucune donnée pour cette période</p>}
        </div>
      )}
    </div>
  );
}
