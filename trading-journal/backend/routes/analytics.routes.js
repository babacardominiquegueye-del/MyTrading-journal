// routes/analytics.routes.js
const express = require("express");
const router  = express.Router();
const {
  getDashboardStats, getMonthlyPerformance,
  getEmotionAnalysis, getSetupAnalysis,
} = require("../controllers/analytics.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

router.use(protect);

router.get("/dashboard", getDashboardStats);
router.get("/monthly",   getMonthlyPerformance);
router.get("/emotions",  authorize("premium_trader", "admin"), getEmotionAnalysis);
router.get("/setups",    getSetupAnalysis);

module.exports = router;
