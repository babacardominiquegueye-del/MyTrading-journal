// ============================================================
// hooks/useTrades.js — Hook personnalisé pour les trades
// ============================================================
// Un hook personnalisé regroupe la logique réutilisable.
// Au lieu de répéter fetch + loading + error dans chaque composant,
// on écrit le hook UNE FOIS et on l'utilise partout.
// ============================================================
import { useState, useEffect, useCallback } from "react";
import { tradeService } from "../services/api";

export const useTrades = (filters = {}) => {
  const [trades, setTrades]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const fetchTrades = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await tradeService.getAll({ ...filters, ...params });
      setTrades(data.data);
      setPagination({ page: data.page, pages: data.pages, total: data.total });
    } catch (err) {
      setError(err.message || "Erreur lors du chargement des trades");
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line

  useEffect(() => { fetchTrades(); }, [fetchTrades]);

  const createTrade = async (tradeData) => {
    const { data } = await tradeService.create(tradeData);
    setTrades((prev) => [data.data, ...prev]);
    return data.data;
  };

  const updateTrade = async (id, tradeData) => {
    const { data } = await tradeService.update(id, tradeData);
    setTrades((prev) => prev.map((t) => (t._id === id ? data.data : t)));
    return data.data;
  };

  const deleteTrade = async (id) => {
    await tradeService.delete(id);
    setTrades((prev) => prev.filter((t) => t._id !== id));
  };

  return { trades, loading, error, pagination, fetchTrades, createTrade, updateTrade, deleteTrade };
};

// ============================================================
// hooks/useAnalytics.js
// ============================================================
import { analyticsService } from "../services/api";

export const useAnalytics = () => {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await analyticsService.getDashboard();
        setStats(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { stats, loading, error };
};
