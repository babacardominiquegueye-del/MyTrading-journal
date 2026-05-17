// pages/StrategyDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { strategyService } from "../services/api";
import { Badge, Button, LoadingSpinner } from "../components/common/index.jsx";
import { useAuth } from "../context/AuthContext";

const Stars = ({ rating, interactive = false, onRate }) => (
  <div className="flex gap-1">
    {[1,2,3,4,5].map((s) => (
      <button key={s} onClick={() => interactive && onRate && onRate(s)}
        className={`text-lg ${interactive ? "hover:scale-110 transition-transform cursor-pointer" : "cursor-default"} ${s <= Math.round(rating) ? "text-accent-gold" : "text-dark-500"}`}>
        ★
      </button>
    ))}
  </div>
);

export default function StrategyDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [strategy, setStrategy] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [review, setReview]     = useState({ rating: 0, title: "", comment: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try { const { data } = await strategyService.getOne(id); setStrategy(data.data); }
      catch {} finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!review.rating) return;
    setSubmitting(true);
    try {
      await strategyService.addReview(id, review);
      const { data } = await strategyService.getOne(id);
      setStrategy(data.data);
      setReview({ rating: 0, title: "", comment: "" });
    } catch (err) { alert(err.message); }
    finally { setSubmitting(false); }
  };

  if (loading) return <LoadingSpinner />;
  if (!strategy) return <p className="text-dark-400 text-center py-20">Stratégie introuvable</p>;

  const s = strategy;
  const isAuthor = s.author?._id === user?._id;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <Link to="/marketplace" className="text-dark-400 hover:text-white text-sm">← Retour au Marketplace</Link>

      <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-white text-xl font-bold mb-1">{s.title}</h1>
            <p className="text-dark-400 text-sm">par {s.author?.username}</p>
          </div>
          <div className="text-right">
            <Badge>{s.type?.replace("_", " ")}</Badge>
            <p className={`text-lg font-bold mt-2 ${s.isFree ? "text-accent-green" : "text-accent-gold"}`}>
              {s.isFree ? "Gratuit" : `$${s.price}`}
            </p>
          </div>
        </div>
        <p className="text-dark-300 text-sm leading-relaxed mb-4">{s.description}</p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          {s.markets?.length > 0 && (
            <div><p className="text-dark-400 text-xs mb-1">Marchés</p>
              <div className="flex gap-1 flex-wrap">{s.markets.map((m) => <Badge key={m}>{m}</Badge>)}</div></div>
          )}
          {s.timeframes?.length > 0 && (
            <div><p className="text-dark-400 text-xs mb-1">Timeframes</p>
              <div className="flex gap-1 flex-wrap">{s.timeframes.map((t) => <Badge key={t}>{t}</Badge>)}</div></div>
          )}
        </div>
      </div>

      {s.entryRules?.length > 0 && (
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
          <h3 className="text-accent-green font-semibold mb-3">✅ Règles d'entrée</h3>
          <ul className="space-y-2">{s.entryRules.map((r, i) => <li key={i} className="text-dark-300 text-sm flex gap-2"><span className="text-accent-green">•</span>{r}</li>)}</ul>
        </div>
      )}
      {s.exitRules?.length > 0 && (
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
          <h3 className="text-accent-red font-semibold mb-3">🚪 Règles de sortie</h3>
          <ul className="space-y-2">{s.exitRules.map((r, i) => <li key={i} className="text-dark-300 text-sm flex gap-2"><span className="text-accent-red">•</span>{r}</li>)}</ul>
        </div>
      )}

      {s.backtesting?.totalTrades && (
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-3">📊 Résultats Backtest</h3>
          <div className="grid grid-cols-4 gap-4 text-center">
            {[["Win Rate", `${s.backtesting.winRate}%`],["RR Moyen", `${s.backtesting.avgRR}R`],["Trades", s.backtesting.totalTrades],["Période", s.backtesting.period]].map(([l, v]) => (
              <div key={l} className="bg-dark-700 rounded-lg p-3"><p className="text-dark-400 text-xs">{l}</p><p className="text-white font-bold text-sm mt-1">{v}</p></div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4">
          Avis ({s.reviews?.length || 0}) · Moy: {s.stats?.averageRating?.toFixed(1) || 0}/5 ★
        </h3>
        {s.reviews?.map((r) => (
          <div key={r._id} className="border-b border-dark-700 pb-3 mb-3 last:border-0 last:mb-0 last:pb-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-white text-sm font-medium">{r.author?.username}</span>
              <Stars rating={r.rating} />
            </div>
            <p className="text-white text-sm font-medium">{r.title}</p>
            <p className="text-dark-300 text-xs mt-1">{r.comment}</p>
          </div>
        ))}

        {!isAuthor && (
          <form onSubmit={submitReview} className="mt-4 pt-4 border-t border-dark-700 space-y-3">
            <h4 className="text-white text-sm font-medium">Laisser un avis</h4>
            <Stars rating={review.rating} interactive onRate={(r) => setReview((p) => ({ ...p, rating: r }))} />
            <input value={review.title} onChange={(e) => setReview((p) => ({ ...p, title: e.target.value }))} placeholder="Titre de votre avis"
              className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-green/30" />
            <textarea value={review.comment} onChange={(e) => setReview((p) => ({ ...p, comment: e.target.value }))} rows={3} placeholder="Votre commentaire..."
              className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-accent-green/30 resize-none" />
            <Button type="submit" loading={submitting} size="sm">Publier l'avis</Button>
          </form>
        )}
      </div>
    </div>
  );
}
