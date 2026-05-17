// ============================================================
// routes/trade.routes.js
// ============================================================
const express = require("express");
const router  = express.Router();

const {
  getTrades, getTrade, createTrade,
  updateTrade, deleteTrade, getTradesByCalendar,
} = require("../controllers/trade.controller");
const { protect } = require("../middleware/auth.middleware");
const { validateTrade } = require("../middleware/validation.middleware");

// Toutes les routes trades nécessitent d'être connecté
// router.use(protect) applique protect à TOUTES les routes ci-dessous
router.use(protect);

router.route("/")
  .get(getTrades)
  .post(validateTrade, createTrade);

router.get("/calendar", getTradesByCalendar);

router.route("/:id")
  .get(getTrade)
  .patch(updateTrade)
  .delete(deleteTrade);

module.exports = router;
