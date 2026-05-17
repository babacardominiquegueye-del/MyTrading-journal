// ============================================================
// routes/strategy.routes.js
// ============================================================
const express = require("express");
const router  = express.Router();
const {
  getStrategies, getStrategy, createStrategy,
  updateStrategy, deleteStrategy, addReview, getMyStrategies,
} = require("../controllers/strategy.controller");
const { protect, authorize } = require("../middleware/auth.middleware");
const { validateStrategy } = require("../middleware/validation.middleware");

router.get("/",     getStrategies);        // Public
router.get("/mine", protect, getMyStrategies);
router.get("/:id",  getStrategy);          // Public

router.post(
  "/",
  protect,
  authorize("strategy_seller", "admin"),
  validateStrategy,
  createStrategy
);
router.patch(  "/:id",         protect, updateStrategy);
router.delete( "/:id",         protect, deleteStrategy);
router.post(   "/:id/reviews", protect, addReview);

module.exports = router;
