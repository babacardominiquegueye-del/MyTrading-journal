// ============================================================
// routes/auth.routes.js
// ============================================================
// Lecture 4 Concept: RESTful route naming
// Lecture 5 Concept: Express Router
//
// Express Router crée un mini-routeur indépendant.
// On le monte sur /api/auth dans server.js
// ============================================================
const express = require("express");
const router  = express.Router();

const { register, login, getMe, logout, updatePassword } =
  require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");
const { validateRegister, validateLogin } =
  require("../middleware/validation.middleware");

// Public routes (pas besoin d'être connecté)
router.post("/register", validateRegister, register);
router.post("/login",    validateLogin,    login);

// Protected routes (JWT requis)
router.get( "/me",       protect, getMe);
router.post("/logout",   protect, logout);
router.put( "/password", protect, updatePassword);

module.exports = router;
