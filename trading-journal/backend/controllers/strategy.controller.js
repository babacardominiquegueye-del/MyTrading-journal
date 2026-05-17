// ============================================================
// controllers/strategy.controller.js — Marketplace de Stratégies
// ============================================================
const Strategy = require("../models/Strategy");
const Review   = require("../models/Review");

// @desc  Toutes les stratégies publiées (Marketplace public)
// @route GET /api/strategies
const getStrategies = async (req, res, next) => {
  try {
    const filter = { isPublished: true };
    if (req.query.type)   filter.type = req.query.type;
    if (req.query.market) filter.markets = req.query.market;
    if (req.query.free === "true") filter.isFree = true;

    // Recherche textuelle
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip  = (page - 1) * limit;

    const sortOptions = {
      popular: { "stats.views": -1 },
      rating:  { "stats.averageRating": -1 },
      newest:  { createdAt: -1 },
    };
    const sort = sortOptions[req.query.sort] || sortOptions.newest;

    const [strategies, total] = await Promise.all([
      Strategy.find(filter)
        .populate("author", "username profile.avatar")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Strategy.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: strategies.length,
      total,
      pages: Math.ceil(total / limit),
      data: strategies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Récupérer une stratégie par ID
// @route GET /api/strategies/:id
const getStrategy = async (req, res, next) => {
  try {
    const strategy = await Strategy.findById(req.params.id)
      .populate("author", "username profile.avatar profile.bio");

    if (!strategy) {
      return res.status(404).json({ success: false, message: "Stratégie introuvable" });
    }

    // Incrémenter le compteur de vues
    await Strategy.findByIdAndUpdate(req.params.id, {
      $inc: { "stats.views": 1 },
    });

    // Récupérer les reviews
    const reviews = await Review.find({ strategy: strategy._id })
      .populate("author", "username profile.avatar")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: { ...strategy.toJSON(), reviews },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Créer une stratégie
// @route POST /api/strategies
const createStrategy = async (req, res, next) => {
  try {
    req.body.author = req.user._id;
    const strategy = await Strategy.create(req.body);
    res.status(201).json({
      success: true,
      message: "Stratégie créée",
      data: strategy,
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Mettre à jour une stratégie
// @route PATCH /api/strategies/:id
const updateStrategy = async (req, res, next) => {
  try {
    let strategy = await Strategy.findById(req.params.id);
    if (!strategy) return res.status(404).json({ success: false, message: "Introuvable" });

    if (req.user.role !== "admin" && strategy.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Accès interdit" });
    }

    delete req.body.author;
    strategy = await Strategy.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });

    res.status(200).json({ success: true, data: strategy });
  } catch (error) {
    next(error);
  }
};

// @desc  Supprimer une stratégie
// @route DELETE /api/strategies/:id
const deleteStrategy = async (req, res, next) => {
  try {
    const strategy = await Strategy.findById(req.params.id);
    if (!strategy) return res.status(404).json({ success: false, message: "Introuvable" });

    if (req.user.role !== "admin" && strategy.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Accès interdit" });
    }

    await strategy.deleteOne();
    await Review.deleteMany({ strategy: req.params.id });
    res.status(200).json({ success: true, message: "Stratégie supprimée" });
  } catch (error) {
    next(error);
  }
};

// @desc  Ajouter une review à une stratégie
// @route POST /api/strategies/:id/reviews
const addReview = async (req, res, next) => {
  try {
    const strategy = await Strategy.findById(req.params.id);
    if (!strategy) return res.status(404).json({ success: false, message: "Introuvable" });

    // Vérifier si l'auteur n'est pas en train de se noter lui-même
    if (strategy.author.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "Vous ne pouvez pas noter votre propre stratégie" });
    }

    const review = await Review.create({
      strategy: req.params.id,
      author:   req.user._id,
      ...req.body,
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Vous avez déjà noté cette stratégie" });
    }
    next(error);
  }
};

// @desc  Mes stratégies (pour le vendeur)
// @route GET /api/strategies/mine
const getMyStrategies = async (req, res, next) => {
  try {
    const strategies = await Strategy.find({ author: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: strategies.length, data: strategies });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStrategies, getStrategy, createStrategy,
  updateStrategy, deleteStrategy, addReview, getMyStrategies,
};
