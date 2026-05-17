// ============================================================
// pages/DashboardPage.jsx — Dashboard principal
// ============================================================
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import { analyticsService, tradeService } from "../services/api";
import { StatCard, Badge, LoadingSpinner, Button, EmptyState } from "../components/common/index.jsx";

// Tooltip personnalisé pour Recharts
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-xs">
      <p className="text-dark-300 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-mono font-bold">
          {p.name}: {typeof p.value === "number" ? (p.value >= 0 ? "+" : "") + p.value.toFixed(2) : p.value}
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats]           = useState(null);
  const [monthly, setMonthly]       = useState([]);
  const [recentTrades, setRecent]   = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, monthlyRes, tradesRes] = await Promise.all([
          analyticsService.getDashboard(),
          analyticsService.getMonthly({ year: new Date().getFullYear() }),
          tradeService.getAll({ limit: 5, page: 1 }),
        ]);
        setStats(statsRes.data.data);
        setMonthly(monthlyRes.data.data.equityCurve);
        setRecent(tradesRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <LoadingSpinner text="Chargement du dashboard..." />;

  const s = stats?.summary;
  const pnlColor = (s?.totalPnL || 0) >= 0 ? "#26a69a" : "#ef5350";

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">
            Bonjour, {user?.profile?.firstName || user?.username} 👋
          </h1>
          <p className="text-dark-400 text-sm mt-0.5">
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <Link to="/trades">
          <Button>+ Nouveau Trade</Button>
        </Link>
      </div>

      {/* Cartes de stats */}
      {!s || s.totalTrades === 0 ? (
        <EmptyState
          icon="📈"
          title="Pas encore de trades"
          description="Commencez à enregistrer vos trades pour voir vos statistiques ici."
          action={<Link to="/trades"><Button>Ajouter mon premier trade</Button></Link>}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Win Rate"
              value={`${s.winRate}%`}
              subtitle={`${s.wins}W / ${s.losses}L`}
              color={s.winRate >= 50 ? "green" : "red"}
              icon="🎯"
            />
            <StatCard
              title="PnL Total"
              value={`${s.totalPnL >= 0 ? "+" : ""}${s.totalPnL?.toFixed(2)}`}
              subtitle="En devise du compte"
              color={s.totalPnL >= 0 ? "green" : "red"}
              icon="💰"
            />
            <StatCard
              title="Risk/Reward moyen"
              value={`${s.avgRR?.toFixed(2)}R`}
              subtitle="Ratio moyen par trade"
              color={s.avgRR >= 1.5 ? "green" : "gold"}
              icon="⚖️"
            />
            <StatCard
              title="Trades Totaux"
              value={s.totalTrades}
              subtitle={`${s.openTrades} ouverts`}
              color="blue"
              icon="📊"
            />
          </div>

          {/* Streak */}
          {s.currentStreak?.count > 1 && (
            <div className={`rounded-xl border px-4 py-3 flex items-center gap-3 ${
              s.currentStreak.type === "winning"
                ? "bg-accent-green/5 border-accent-green/20"
                : "bg-accent-red/5 border-accent-red/20"
            }`}>
              <span className="text-2xl">
                {s.currentStreak.type === "winning" ? "🔥" : "❄️"}
              </span>
              <div>
                <p className={`font-semibold text-sm ${s.currentStreak.type === "winning" ? "text-accent-green" : "text-accent-red"}`}>
                  Série en cours : {s.currentStreak.count} {s.currentStreak.type === "winning" ? "victoires" : "pertes"} consécutives
                </p>
                <p className="text-dark-400 text-xs">
                  {s.currentStreak.type === "winning" ? "Excellent ! Restez discipliné." : "Faites une pause, analysez vos trades."}
                </p>
              </div>
            </div>
          )}

          {/* Graphiques */}
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Courbe d'équité */}
            <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
              <h3 className="text-white font-semibold text-sm mb-4">Courbe d'équité {new Date().getFullYear()}</h3>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2e39" />
                  <XAxis dataKey="month" tick={{ fill: "#4a4f5e", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#4a4f5e", fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="equity"
                    stroke={pnlColor}
                    strokeWidth={2}
                    dot={false}
                    name="Équité"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Performance par jour */}
            <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
              <h3 className="text-white font-semibold text-sm mb-4">Performance par jour de la semaine</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={stats?.dayStats || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2e39" />
                  <XAxis dataKey="day" tick={{ fill: "#4a4f5e", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#4a4f5e", fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="pnl" name="PnL" radius={[4, 4, 0, 0]}>
                    {(stats?.dayStats || []).map((entry, i) => (
                      <Cell key={i} fill={entry.pnl >= 0 ? "#26a69a" : "#ef5350"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Meilleures / pires paires */}
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
              <h3 className="text-white font-semibold text-sm mb-4">Top Paires</h3>
              <div className="space-y-3">
                {(stats?.allPairs || []).slice(0, 5).map((pair) => (
                  <div key={pair.pair} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-mono font-medium">{pair.pair}</span>
                      <span className="text-dark-400 text-xs">{pair.count} trades</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-dark-400 text-xs">{pair.winRate}% WR</span>
                      <span className={`text-sm font-mono font-bold ${pair.pnl >= 0 ? "text-accent-green" : "text-accent-red"}`}>
                        {pair.pnl >= 0 ? "+" : ""}{pair.pnl}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trades récents */}
            <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-sm">Trades récents</h3>
                <Link to="/trades" className="text-accent-green text-xs hover:underline">Voir tout →</Link>
              </div>
              <div className="space-y-2">
                {recentTrades.map((trade) => (
                  <Link
                    key={trade._id}
                    to={`/trades/${trade._id}`}
                    className="flex items-center justify-between py-2 border-b border-dark-700 hover:bg-dark-700/50 rounded px-1 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant={trade.direction}>{trade.direction.toUpperCase()}</Badge>
                      <span className="text-white text-xs font-mono">{trade.pair}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={trade.result}>{trade.result}</Badge>
                      <span className={`text-xs font-mono font-bold ${trade.profitLoss >= 0 ? "text-accent-green" : "text-accent-red"}`}>
                        {trade.profitLoss >= 0 ? "+" : ""}{trade.profitLoss?.toFixed(2)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
