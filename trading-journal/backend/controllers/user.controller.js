// ============================================================
// controllers/user.controller.js — Gestion Utilisateurs
// ============================================================
const User  = require("../models/User");
const Trade = require("../models/Trade");

// @desc  Profil public d'un utilisateur
// @route GET /api/users/:username
const getPublicProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select("username profile stats role createdAt");

    if (!user) return res.status(404).json({ success: false, message: "Utilisateur introuvable" });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc  Mettre à jour son propre profil
// @route PATCH /api/users/profile
const updateProfile = async (req, res, next) => {
  try {
    // Champs que l'utilisateur peut modifier
    const allowed = ["profile"];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true, runValidators: true,
    });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc  [ADMIN] Liste tous les utilisateurs
// @route GET /api/users
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc  [ADMIN] Changer le rôle d'un utilisateur
// @route PATCH /api/users/:id/role
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const validRoles = ["admin", "trader", "premium_trader", "strategy_seller"];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: "Rôle invalide" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ success: false, message: "Utilisateur introuvable" });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc  [ADMIN] Activer/Désactiver un compte
// @route PATCH /api/users/:id/toggle-status
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "Introuvable" });

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Compte ${user.isActive ? "activé" : "désactivé"}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPublicProfile, updateProfile, getAllUsers, updateUserRole, toggleUserStatus };
