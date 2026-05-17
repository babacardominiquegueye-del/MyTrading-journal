// ============================================================
// controllers/trade.controller.js — CRUD des Trades
// ============================================================
// Lecture 4 Concept: RESTful route naming
// Lecture 2 Concept: Modular backend architecture
//
// CONVENTIONS REST utilisées ici :
//   GET    /api/trades       → getTrades   (liste)
//   POST   /api/trades       → createTrade (créer)
//   GET    /api/trades/:id   → getTrade    (un seul)
//   PATCH  /api/trades/:id   → updateTrade (mise à jour partielle)
//   DELETE /api/trades/:id   → deleteTrade (supprimer)
//
// POURQUOI PATCH et pas PUT ?
//   PUT remplace TOUT le document.
//   PATCH applique des modifications PARTIELLES.
//   PATCH est plus pratique pour les formulaires d'édition.
// ============================================================

const Trade = require("../models/Trade");
const User  = require("../models/User");

// ============================================================
// @desc    Récupérer tous les trades de l'utilisateur connecté
// @route   GET /api/trades
// @access  Private
// ============================================================
const getTrades = async (req, res, next) => {
  try {
    // ---- Filtres dynamiques ----
    // On commence avec createdBy = utilisateur connecté
    // SÉCURITÉ : un utilisateur ne voit QUE ses propres trades
    const filter = { createdBy: req.user._id };

    // Filtre par résultat (win / loss / open)
    if (req.query.result) filter.result = req.query.result;

    // Filtre par paire (EUR/USD, BTC/USDT…)
    if (req.query.pair) filter.pair = req.query.pair.toUpperCase();

    // Filtre par direction (buy / sell)
    if (req.query.direction) filter.direction = req.query.direction;

    // Filtre par marché
    if (req.query.market) filter.market = req.query.market;

    // Filtre par date (exemple : ?from=2024-01-01&to=2024-12-31)
    if (req.query.from || req.query.to) {
      filter.entryDate = {};
      if (req.query.from) filter.entryDate.$gte = new Date(req.query.from);
      if (req.query.to)   filter.entryDate.$lte = new Date(req.query.to);
    }

    // ---- Pagination ----
    // Lecture 4 Concept: Pagination RESTful
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip  = (page - 1) * limit;

    // ---- Tri ----
    // Par défaut : trades les plus récents en premier
    const sortField = req.query.sortBy || "entryDate";
    const sortOrder = req.query.order  === "asc" ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    // ---- Exécution de la requête ----
    const [trades, total] = await Promise.all([
      Trade.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("strategy", "title type"), // Injecte le nom de la stratégie
      Trade.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count:   trades.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: trades,
    });
  } catch (error) {
    next(error); // Passe à l'error handler global
  }
};

// ============================================================
// @desc    Récupérer UN trade par ID
// @route   GET /api/trades/:id
// @access  Private
// ============================================================
const getTrade = async (req, res, next) => {
  try {
    const trade = await Trade.findById(req.params.id)
      .populate("strategy", "title type description")
      .populate("createdBy", "username profile.avatar");

    if (!trade) {
      return res.status(404).json({
        success: false,
        message: "Trade introuvable",
      });
    }

    // SÉCURITÉ : vérification de propriété (ownership)
    // Un utilisateur ne peut voir QUE ses propres trades
    if (
      req.user.role !== "admin" &&
      trade.createdBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Accès interdit — ce trade ne vous appartient pas",
      });
    }

    res.status(200).json({ success: true, data: trade });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @desc    Créer un nouveau trade
// @route   POST /api/trades
// @access  Private
// ============================================================
const createTrade = async (req, res, next) => {
  try {
    // On force createdBy = utilisateur connecté
    // L'utilisateur NE PEUT PAS créer un trade au nom de quelqu'un d'autre
    req.body.createdBy = req.user._id;

    const trade = await Trade.create(req.body);

    // Mise à jour du compteur de trades sur le profil utilisateur
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { "stats.totalTrades": 1 },
    });

    res.status(201).json({
      success: true,
      message: "Trade créé avec succès",
      data: trade,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @desc    Mettre à jour un trade (modification partielle)
// @route   PATCH /api/trades/:id
// @access  Private
// ============================================================
const updateTrade = async (req, res, next) => {
  try {
    let trade = await Trade.findById(req.params.id);

    if (!trade) {
      return res.status(404).json({
        success: false,
        message: "Trade introuvable",
      });
    }

    // SÉCURITÉ : ownership check
    if (
      req.user.role !== "admin" &&
      trade.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Accès interdit — ce trade ne vous appartient pas",
      });
    }

    // Champs protégés que l'utilisateur ne peut pas modifier
    delete req.body.createdBy;

    // { new: true }       → retourne le document APRÈS modification
    // { runValidators: true } → applique les validations du schéma
    trade = await Trade.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Si le trade est clôturé, recalcule les stats utilisateur
    if (req.body.result && req.body.result !== "open") {
      await recalculateUserStats(req.user._id);
    }

    res.status(200).json({
      success: true,
      message: "Trade mis à jour",
      data: trade,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @desc    Supprimer un trade
// @route   DELETE /api/trades/:id
// @access  Private
// ============================================================
const deleteTrade = async (req, res, next) => {
  try {
    const trade = await Trade.findById(req.params.id);

    if (!trade) {
      return res.status(404).json({
        success: false,
        message: "Trade introuvable",
      });
    }

    // SÉCURITÉ : ownership check
    if (
      req.user.role !== "admin" &&
      trade.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Accès interdit — ce trade ne vous appartient pas",
      });
    }

    await trade.deleteOne();

    // Mise à jour du compteur
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { "stats.totalTrades": -1 },
    });

    res.status(200).json({
      success: true,
      message: "Trade supprimé avec succès",
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @desc    Trades par date (pour la vue Calendrier)
// @route   GET /api/trades/calendar
// @access  Private
// ============================================================
const getTradesByCalendar = async (req, res, next) => {
  try {
    const { year, month } = req.query;

    const startDate = new Date(year, month - 1, 1);
    const endDate   = new Date(year, month, 0, 23, 59, 59);

    const trades = await Trade.find({
      createdBy: req.user._id,
      entryDate: { $gte: startDate, $lte: endDate },
    }).select("pair direction result profitLoss entryDate");

    // Groupe les trades par jour pour le calendrier
    const calendar = {};
    trades.forEach((trade) => {
      const day = new Date(trade.entryDate).getDate();
      if (!calendar[day]) calendar[day] = [];
      calendar[day].push(trade);
    });

    res.status(200).json({ success: true, data: calendar });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// FONCTION UTILITAIRE PRIVÉE
// Recalcule les stats de l'utilisateur après modification d'un trade
// Cette fonction n'est pas exportée — elle est interne au controller
// ============================================================
const recalculateUserStats = async (userId) => {
  const trades = await Trade.find({
    createdBy: userId,
    result: { $in: ["win", "loss", "breakeven"] },
  });

  if (trades.length === 0) return;

  const wins      = trades.filter((t) => t.result === "win").length;
  const winRate   = Math.round((wins / trades.length) * 100);
  const totalPnL  = trades.reduce((sum, t) => sum + (t.profitLoss || 0), 0);
  const rrTrades  = trades.filter((t) => t.riskRewardRatio > 0);
  const avgRR     = rrTrades.length
    ? rrTrades.reduce((sum, t) => sum + t.riskRewardRatio, 0) / rrTrades.length
    : 0;

  await User.findByIdAndUpdate(userId, {
    "stats.winRate":  winRate,
    "stats.totalPnL": Math.round(totalPnL * 100) / 100,
    "stats.averageRR": Math.round(avgRR * 100) / 100,
  });
};

module.exports = {
  getTrades,
  getTrade,
  createTrade,
  updateTrade,
  deleteTrade,
  getTradesByCalendar,
};
