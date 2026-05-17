// ============================================================
// pages/TradeDetailPage.jsx
// ============================================================
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { tradeService } from "../services/api";
import { Badge, Button, LoadingSpinner } from "../components/common/index.jsx";

export default function TradeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trade, setTrade]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await tradeService.getOne(id);
        setTrade(data.data);
      } catch { navigate("/trades"); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]); // eslint-disable-line

  if (loading) return <LoadingSpinner />;
  if (!trade)  return null;

  const Field = ({ label, value, mono = false }) => (
    <div>
      <p className="text-dark-400 text-xs mb-0.5">{label}</p>
      <p className={`text-white text-sm ${mono ? "font-mono" : "font-medium"}`}>{value || "—"}</p>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/trades" className="text-dark-400 hover:text-white">← Retour</Link>
        <h1 className="text-white text-xl font-bold ml-2">Détail du Trade</h1>
      </div>

      {/* Header */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-white text-2xl font-bold font-mono">{trade.pair}</span>
            <Badge variant={trade.direction}>{trade.direction.toUpperCase()}</Badge>
            <Badge variant={trade.result}>{trade.result}</Badge>
          </div>
          <span className={`text-2xl font-bold font-mono ${trade.profitLoss >= 0 ? "text-accent-green" : "text-accent-red"}`}>
            {trade.profitLoss >= 0 ? "+" : ""}{trade.profitLoss?.toFixed(2)}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Field label="Entrée"       value={trade.entryPrice}  mono />
          <Field label="Sortie"       value={trade.exitPrice}   mono />
          <Field label="Stop Loss"    value={trade.stopLoss}    mono />
          <Field label="Take Profit"  value={trade.takeProfit}  mono />
          <Field label="Risk/Reward"  value={trade.riskRewardRatio ? `${trade.riskRewardRatio}R` : "—"} mono />
          <Field label="Marché"       value={trade.market} />
          <Field label="Setup"        value={trade.setup} />
          <Field label="Timeframe"    value={trade.timeframe} />
        </div>
      </div>

      {/* Dates */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-3">Timing</h3>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Date d'entrée" value={new Date(trade.entryDate).toLocaleString("fr-FR")} />
          <Field label="Date de sortie" value={trade.exitDate ? new Date(trade.exitDate).toLocaleString("fr-FR") : "—"} />
          <Field label="Durée" value={trade.durationMinutes ? `${trade.durationMinutes} min` : "—"} />
        </div>
      </div>

      {/* Psychologie */}
      {trade.emotions?.beforeTrade && (
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-3">Psychologie</h3>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Avant le trade"  value={trade.emotions.beforeTrade} />
            <Field label="Après le trade"  value={trade.emotions.afterTrade} />
            <Field label="Suivi du plan ?" value={trade.emotions.followedPlan ? "✅ Oui" : "❌ Non"} />
          </div>
        </div>
      )}

      {/* Notes */}
      {trade.notes && (
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-2">Notes</h3>
          <p className="text-dark-300 text-sm leading-relaxed">{trade.notes}</p>
        </div>
      )}

      {/* Tags */}
      {trade.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {trade.tags.map((tag) => (
            <span key={tag} className="bg-dark-700 text-dark-300 text-xs px-2 py-1 rounded-full border border-dark-500">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
