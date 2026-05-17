// pages/MarketplacePage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { strategyService } from "../services/api";
import { Badge, Button, LoadingSpinner, EmptyState, Input } from "../components/common/index.jsx";
import { useAuth } from "../context/AuthContext";

const Stars = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map((s) => (
      <span key={s} className={`text-xs ${s <= Math.round(rating) ? "text-accent-gold" : "text-dark-500"}`}>★</span>
    ))}
  </div>
);

export default function MarketplacePage() {
  const { isStrategySeller } = useAuth();
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params = {};
        if (search)     params.search = search;
        if (typeFilter) params.type   = typeFilter;
        const { data } = await strategyService.getAll(params);
        setStrategies(data.data);
      } catch {}
      finally { setLoading(false); }
    };
    const timeout = setTimeout(fetch, 300);
    return () => clearTimeout(timeout);
  }, [search, typeFilter]);

  const types = ["scalping","day_trading","swing_trading","position_trading"];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Marketplace</h1>
          <p className="text-dark-400 text-sm">Découvrez et partagez des stratégies de trading</p>
        </div>
        {isStrategySeller && (
          <Link to="/marketplace/new">
            <Button>+ Publier une stratégie</Button>
          </Link>
        )}
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 bg-dark-800 border border-dark-600 rounded-xl p-4">
        <Input placeholder="Rechercher une stratégie..." value={search}
          onChange={(e) => setSearch(e.target.value)} className="flex-1 min-w-48" />
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setTypeFilter("")}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${!typeFilter ? "border-accent-green text-accent-green bg-accent-green/10" : "border-dark-500 text-dark-400 hover:border-dark-400"}`}>
            Tous
          </button>
          {types.map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${typeFilter === t ? "border-accent-green text-accent-green bg-accent-green/10" : "border-dark-500 text-dark-400 hover:border-dark-400"}`}>
              {t.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {loading ? <LoadingSpinner /> : strategies.length === 0 ? (
        <EmptyState icon="🏪" title="Aucune stratégie" description="Aucune stratégie publiée pour le moment." />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {strategies.map((s) => (
            <Link key={s._id} to={`/marketplace/${s._id}`}
              className="bg-dark-800 border border-dark-600 hover:border-accent-green/30 rounded-xl p-5 transition-all hover:bg-dark-700/50 group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-semibold text-sm group-hover:text-accent-green transition-colors">{s.title}</h3>
                  <p className="text-dark-400 text-xs mt-0.5">par {s.author?.username}</p>
                </div>
                <Badge>{s.type?.replace("_", " ")}</Badge>
              </div>
              <p className="text-dark-300 text-xs line-clamp-2 mb-3">{s.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Stars rating={s.stats?.averageRating || 0} />
                  <span className="text-dark-400 text-xs">({s.stats?.totalReviews || 0})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-dark-400 text-xs">👁 {s.stats?.views || 0}</span>
                  <span className={`text-xs font-bold ${s.isFree ? "text-accent-green" : "text-accent-gold"}`}>
                    {s.isFree ? "Gratuit" : `$${s.price}`}
                  </span>
                </div>
              </div>
              {s.markets?.length > 0 && (
                <div className="flex gap-1 mt-2 flex-wrap">
                  {s.markets.map((m) => (
                    <span key={m} className="text-xs bg-dark-600 text-dark-300 px-1.5 py-0.5 rounded">{m}</span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
