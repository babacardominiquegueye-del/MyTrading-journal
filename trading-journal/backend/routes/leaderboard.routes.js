// routes/leaderboard.routes.js
const express = require("express");
const router  = express.Router();
const { getLeaderboard } = require("../controllers/leaderboard.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

router.get("/", protect, authorize("premium_trader", "admin"), getLeaderboard);

module.exports = router;

// ============================================================
// Fichier: routes/journal.routes.js
// ============================================================
