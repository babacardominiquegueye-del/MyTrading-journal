// ============================================================
// pages/TradesPage.jsx — Liste et gestion des trades
// ============================================================
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { tradeService } from "../services/api";
import { Badge, Button, LoadingSpinner, EmptyState, Input, Select, Modal, Alert } from "../components/common/index.jsx";

const INITIAL_FORM = {
  pair: "", market: "forex", direction: "buy",
  entryPrice: "", exitPrice: "", stopLoss: "", takeProfit: "",
  positionSize: "", result: "open", profitLoss: "",
  setup: "", timeframe: "", notes: "",
  emotions: { beforeTrade: "", afterTrade: "", followedPlan: true },
  tags: "",
};

export default function TradesPage() {
  const [trades, setTrades]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editTrade, setEditTrade] = useState(null);
  const [form, setForm]           = useState(INITIAL_FORM);
  const [saving, setSaving]       = useState(false);

  // Filtres
  const [filters, setFilters] = useState({ result: "", direction: "", pair: "" });
  const [page, setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTrades = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15, ...filters };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const { data } = await tradeService.getAll(params);
      setTrades(data.data);
      setTotalPages(data.pages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrades(); }, [page, filters]); // eslint-disable-line

  const openCreate = () => { setEditTrade(null); setForm(INITIAL_FORM); setShowModal(true); };
  const openEdit   = (trade) => {
    setEditTrade(trade);
    setForm({
      ...INITIAL_FORM, ...trade,
      tags: (trade.tags || []).join(", "),
      emotions: trade.emotions || INITIAL_FORM.emotions,
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("emotions.")) {
      const key = name.split(".")[1];
      setForm((p) => ({ ...p, emotions: { ...p.emotions, [key]: type === "checkbox" ? checked : value } }));
    } else {
      setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],
        entryPrice:   parseFloat(form.entryPrice)  || undefined,
        exitPrice:    parseFloat(form.exitPrice)   || undefined,
        stopLoss:     parseFloat(form.stopLoss)    || undefined,
        takeProfit:   parseFloat(form.takeProfit)  || undefined,
        profitLoss:   parseFloat(form.profitLoss)  || 0,
        positionSize: parseFloat(form.positionSize)|| undefined,
      };

      if (editTrade) {
        const { data } = await tradeService.update(editTrade._id, payload);
        setTrades((p) => p.map((t) => (t._id === editTrade._id ? data.data : t)));
        setSuccess("Trade mis à jour !");
      } else {
        const { data } = await tradeService.create(payload);
        setTrades((p) => [data.data, ...p]);
        setSuccess("Trade créé !");
      }
      setShowModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce trade ?")) return;
    try {
      await tradeService.delete(id);
      setTrades((p) => p.filter((t) => t._id !== id));
      setSuccess("Trade supprimé");
    } catch (err) {
      setError(err.message);
    }
  };

  const filterOptions = {
    result:    [{ value: "", label: "Tous résultats" }, { value: "win", label: "Win" }, { value: "loss", label: "Loss" }, { value: "open", label: "Ouvert" }, { value: "breakeven", label: "Breakeven" }],
    direction: [{ value: "", label: "Toutes directions" }, { value: "buy", label: "Buy" }, { value: "sell", label: "Sell" }],
    market:    [{ value: "forex", label: "Forex" }, { value: "crypto", label: "Crypto" }, { value: "stocks", label: "Actions" }, { value: "commodities", label: "Matières premières" }, { value: "other", label: "Autre" }],
    setup:     [{ value: "", label: "Setup" }, { value: "breakout", label: "Breakout" }, { value: "pullback", label: "Pullback" }, { value: "reversal", label: "Reversal" }, { value: "trend_following", label: "Trend Following" }],
    timeframe: [{ value: "", label: "TF" }, { value: "M5", label: "M5" }, { value: "M15", label: "M15" }, { value: "H1", label: "H1" }, { value: "H4", label: "H4" }, { value: "D1", label: "D1" }],
    result_form: [{ value: "open", label: "Ouvert" }, { value: "win", label: "Win" }, { value: "loss", label: "Loss" }, { value: "breakeven", label: "Breakeven" }],
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Mes Trades</h1>
          <p className="text-dark-400 text-sm">{trades.length} trades affichés</p>
        </div>
        <Button onClick={openCreate}>+ Nouveau Trade</Button>
      </div>

      {error   && <Alert type="error"   message={error}   onClose={() => setError("")} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess("")} />}

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 bg-dark-800 border border-dark-600 rounded-xl p-4">
        <Select name="result" value={filters.result}
          onChange={(e) => setFilters({ ...filters, result: e.target.value })}
          options={filterOptions.result} className="w-40" />
        <Select name="direction" value={filters.direction}
          onChange={(e) => setFilters({ ...filters, direction: e.target.value })}
          options={filterOptions.direction} className="w-44" />
        <Input name="pair" value={filters.pair} placeholder="Filtrer par paire…"
          onChange={(e) => setFilters({ ...filters, pair: e.target.value })} className="w-44" />
        <Button variant="ghost" size="sm" onClick={() => setFilters({ result: "", direction: "", pair: "" })}>
          Réinitialiser
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner />
      ) : trades.length === 0 ? (
        <EmptyState icon="📋" title="Aucun trade trouvé"
          description="Créez votre premier trade ou modifiez les filtres."
          action={<Button onClick={openCreate}>+ Nouveau Trade</Button>} />
      ) : (
        <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-600">
                  {["Date", "Paire", "Dir.", "Entrée", "Sortie", "SL / TP", "RR", "PnL", "Résultat", ""].map((h) => (
                    <th key={h} className="text-left text-dark-400 text-xs font-medium px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {trades.map((trade) => (
                  <tr key={trade._id} className="hover:bg-dark-700/40 transition-colors">
                    <td className="px-4 py-3 text-dark-400 text-xs whitespace-nowrap">
                      {new Date(trade.entryDate).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-white font-mono font-medium">{trade.pair}</span>
                    </td>
                    <td className="px-4 py-3"><Badge variant={trade.direction}>{trade.direction.toUpperCase()}</Badge></td>
                    <td className="px-4 py-3 text-white font-mono text-xs">{trade.entryPrice}</td>
                    <td className="px-4 py-3 text-white font-mono text-xs">{trade.exitPrice || "—"}</td>
                    <td className="px-4 py-3 text-xs font-mono">
                      <span className="text-accent-red">{trade.stopLoss || "—"}</span>
                      <span className="text-dark-500"> / </span>
                      <span className="text-accent-green">{trade.takeProfit || "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-dark-300 text-xs font-mono">{trade.riskRewardRatio ? `${trade.riskRewardRatio}R` : "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`font-mono text-xs font-bold ${trade.profitLoss >= 0 ? "text-accent-green" : "text-accent-red"}`}>
                        {trade.profitLoss >= 0 ? "+" : ""}{trade.profitLoss?.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3"><Badge variant={trade.result}>{trade.result}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link to={`/trades/${trade._id}`} className="text-dark-400 hover:text-accent-blue p-1 rounded transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </Link>
                        <button onClick={() => openEdit(trade)} className="text-dark-400 hover:text-accent-gold p-1 rounded transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => handleDelete(trade._id)} className="text-dark-400 hover:text-accent-red p-1 rounded transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 p-4 border-t border-dark-600">
              <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>← Préc.</Button>
              <span className="text-dark-400 text-sm">Page {page} / {totalPages}</span>
              <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Suiv. →</Button>
            </div>
          )}
        </div>
      )}

      {/* Modal Créer / Éditer */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}
        title={editTrade ? "Modifier le trade" : "Nouveau trade"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Paire *" name="pair" value={form.pair} onChange={handleChange} placeholder="EUR/USD" required />
            <Select label="Marché" name="market" value={form.market} onChange={handleChange} options={filterOptions.market} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Direction *" name="direction" value={form.direction} onChange={handleChange}
              options={[{ value: "buy", label: "Buy / Long" }, { value: "sell", label: "Sell / Short" }]} />
            <Select label="Résultat" name="result" value={form.result} onChange={handleChange} options={filterOptions.result_form} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Prix d'entrée *" name="entryPrice" type="number" step="any" value={form.entryPrice} onChange={handleChange} required />
            <Input label="Prix de sortie" name="exitPrice" type="number" step="any" value={form.exitPrice} onChange={handleChange} />
            <Input label="PnL" name="profitLoss" type="number" step="any" value={form.profitLoss} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Stop Loss" name="stopLoss" type="number" step="any" value={form.stopLoss} onChange={handleChange} />
            <Input label="Take Profit" name="takeProfit" type="number" step="any" value={form.takeProfit} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Setup" name="setup" value={form.setup} onChange={handleChange} options={filterOptions.setup} />
            <Select label="Timeframe" name="timeframe" value={form.timeframe} onChange={handleChange} options={filterOptions.timeframe} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Émotion avant" name="emotions.beforeTrade" value={form.emotions.beforeTrade} onChange={handleChange}
              options={[{ value: "", label: "Sélectionner" }, ...["calm","excited","fearful","confident","anxious","neutral"].map((e) => ({ value: e, label: e }))]} />
            <Select label="Émotion après" name="emotions.afterTrade" value={form.emotions.afterTrade} onChange={handleChange}
              options={[{ value: "", label: "Sélectionner" }, ...["satisfied","disappointed","angry","relieved","neutral"].map((e) => ({ value: e, label: e }))]} />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Analyse du trade, raisons d'entrée..."
              className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-accent-green/30 resize-none" />
          </div>
          <Input label="Tags (séparés par des virgules)" name="tags" value={form.tags} onChange={handleChange} placeholder="ema, breakout, london" />

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saving} className="flex-1">
              {editTrade ? "Mettre à jour" : "Créer le trade"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Annuler
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
