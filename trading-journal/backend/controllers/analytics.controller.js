// ============================================================
// controllers/analytics.controller.js — Statistiques & Analytics
// ============================================================
// Lecture 7 Concept: MongoDB Aggregation Pipeline
//
// L'Aggregation Pipeline est une des fonctionnalités les plus
// puissantes de MongoDB. Elle permet de :
//   - Filtrer des documents ($match)
//   - Grouper et calculer ($group)
//   - Trier ($sort)
//   - Transformer ($project)
//
// C'est comme SQL GROUP BY mais pour MongoDB, et bien plus flexible.
// ============================================================

const Trade = require("../models/Trade");
const User  = require("../models/User");

// ============================================================
// @desc    Dashboard principal — statistiques globales
// @route   GET /api/analytics/dashboard
// @access  Private
// ============================================================
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Récupère tous les trades clôturés de l'utilisateur
    const closedTrades = await Trade.find({
      createdBy: userId,
      result: { $in: ["win", "loss", "breakeven"] },
    });

    const openTrades = await Trade.find({
      createdBy: userId,
      result: "open",
    });

    if (closedTrades.length === 0) {
      return res.status(200).json({
        success: true,
        data: getEmptyStats(),
      });
    }

    // ---- Calculs de base ----
    const totalTrades = closedTrades.length;
    const wins        = closedTrades.filter((t) => t.result === "win").length;
    const losses      = closedTrades.filter((t) => t.result === "loss").length;
    const breakevens  = closedTrades.filter((t) => t.result === "breakeven").length;
    const winRate     = Math.round((wins / totalTrades) * 100);

    // ---- PnL Total ----
    const totalPnL = closedTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0);

    // ---- Risk/Reward moyen ----
    const rrTrades = closedTrades.filter((t) => t.riskRewardRatio > 0);
    const avgRR = rrTrades.length
      ? rrTrades.reduce((sum, t) => sum + t.riskRewardRatio, 0) / rrTrades.length
      : 0;

    // ---- Meilleure et pire paire ----
    const pairStats = {};
    closedTrades.forEach((trade) => {
      if (!pairStats[trade.pair]) {
        pairStats[trade.pair] = { pnl: 0, count: 0, wins: 0 };
      }
      pairStats[trade.pair].pnl   += trade.profitLoss || 0;
      pairStats[trade.pair].count += 1;
      if (trade.result === "win") pairStats[trade.pair].wins += 1;
    });

    const pairArray = Object.entries(pairStats).map(([pair, stats]) => ({
      pair,
      pnl:     Math.round(stats.pnl * 100) / 100,
      count:   stats.count,
      winRate: Math.round((stats.wins / stats.count) * 100),
    }));

    pairArray.sort((a, b) => b.pnl - a.pnl);
    const bestPair  = pairArray[0] || null;
    const worstPair = pairArray[pairArray.length - 1] || null;

    // ---- Streak actuel ----
    const sortedTrades = [...closedTrades].sort(
      (a, b) => new Date(b.entryDate) - new Date(a.entryDate)
    );
    let currentStreak = 0;
    const firstResult = sortedTrades[0]?.result;
    for (const trade of sortedTrades) {
      if (trade.result === firstResult) currentStreak++;
      else break;
    }

    // ---- Performance par jour de la semaine ----
    const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const dayStats = Array(7).fill(null).map((_, i) => ({
      day: dayNames[i],
      pnl: 0,
      count: 0,
    }));
    closedTrades.forEach((trade) => {
      const day = new Date(trade.entryDate).getDay();
      dayStats[day].pnl   += trade.profitLoss || 0;
      dayStats[day].count += 1;
    });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalTrades,
          openTrades:  openTrades.length,
          wins,
          losses,
          breakevens,
          winRate,
          totalPnL:    Math.round(totalPnL * 100) / 100,
          avgRR:       Math.round(avgRR * 100) / 100,
          currentStreak: {
            count:  currentStreak,
            type:   firstResult === "win" ? "winning" : "losing",
          },
        },
        bestPair,
        worstPair,
        allPairs:   pairArray,
        dayStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @desc    Performance mensuelle (graphique courbe)
// @route   GET /api/analytics/monthly
// @access  Private
// ============================================================
const getMonthlyPerformance = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();

    // Aggregation Pipeline MongoDB
    // Étape 1 ($match) : filtre les trades de l'utilisateur pour l'année
    // Étape 2 ($group) : groupe par mois et calcule les totaux
    // Étape 3 ($sort)  : trie par mois
    const monthly = await Trade.aggregate([
      {
        $match: {
          createdBy: req.user._id,
          result:    { $in: ["win", "loss", "breakeven"] },
          entryDate: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id:        { $month: "$entryDate" },
          totalPnL:   { $sum: "$profitLoss" },
          totalTrades:{ $sum: 1 },
          wins:       { $sum: { $cond: [{ $eq: ["$result", "win"] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Remplit les 12 mois (même si certains sont vides)
    const monthNames = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sep","Oct","Nov","Déc"];
    const fullYear = monthNames.map((name, i) => {
      const found = monthly.find((m) => m._id === i + 1);
      return {
        month:       name,
        pnl:         found ? Math.round(found.totalPnL * 100) / 100 : 0,
        trades:      found ? found.totalTrades : 0,
        winRate:     found ? Math.round((found.wins / found.totalTrades) * 100) : 0,
      };
    });

    // Courbe de capital cumulatif
    let cumulative = 0;
    const equityCurve = fullYear.map((m) => {
      cumulative += m.pnl;
      return { month: m.month, equity: Math.round(cumulative * 100) / 100 };
    });

    res.status(200).json({
      success: true,
      data: { monthly: fullYear, equityCurve, year },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @desc    Analyse des émotions (impact psychologique)
// @route   GET /api/analytics/emotions
// @access  Premium
// ============================================================
const getEmotionAnalysis = async (req, res, next) => {
  try {
    const emotionStats = await Trade.aggregate([
      {
        $match: {
          createdBy: req.user._id,
          result:    { $in: ["win", "loss"] },
          "emotions.beforeTrade": { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id:    "$emotions.beforeTrade",
          wins:   { $sum: { $cond: [{ $eq: ["$result", "win"] }, 1, 0] } },
          total:  { $sum: 1 },
          avgPnL: { $avg: "$profitLoss" },
        },
      },
    ]);

    const result = emotionStats.map((e) => ({
      emotion: e._id,
      winRate: Math.round((e.wins / e.total) * 100),
      trades:  e.total,
      avgPnL:  Math.round(e.avgPnL * 100) / 100,
    }));

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @desc    Stats par setup (breakout, pullback…)
// @route   GET /api/analytics/setups
// @access  Private
// ============================================================
const getSetupAnalysis = async (req, res, next) => {
  try {
    const setups = await Trade.aggregate([
      {
        $match: {
          createdBy: req.user._id,
          result:    { $in: ["win", "loss", "breakeven"] },
          setup:     { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id:     "$setup",
          wins:    { $sum: { $cond: [{ $eq: ["$result", "win"] }, 1, 0] } },
          total:   { $sum: 1 },
          totalPnL:{ $sum: "$profitLoss" },
          avgRR:   { $avg: "$riskRewardRatio" },
        },
      },
      { $sort: { totalPnL: -1 } },
    ]);

    const result = setups.map((s) => ({
      setup:   s._id,
      winRate: Math.round((s.wins / s.total) * 100),
      trades:  s.total,
      totalPnL:Math.round(s.totalPnL * 100) / 100,
      avgRR:   Math.round(s.avgRR * 100) / 100,
    }));

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// Valeurs vides quand l'utilisateur n'a pas encore de trades
const getEmptyStats = () => ({
  summary: {
    totalTrades: 0,
    openTrades:  0,
    wins: 0, losses: 0, breakevens: 0,
    winRate: 0, totalPnL: 0, avgRR: 0,
    currentStreak: { count: 0, type: "none" },
  },
  bestPair: null,
  worstPair: null,
  allPairs: [],
  dayStats: [],
});

module.exports = {
  getDashboardStats,
  getMonthlyPerformance,
  getEmotionAnalysis,
  getSetupAnalysis,
};
