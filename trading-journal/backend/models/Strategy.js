// =============================================================
// models/Strategy.js - Trading Strategy Schema
// =============================================================
//
// Lecture 7 Concept: Mongoose schema relationships
// This model has relationships to BOTH User (author) and Review
// =============================================================

const mongoose = require("mongoose");

const StrategySchema = new mongoose.Schema(
  {
    // Author of the strategy (references User collection)
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Strategy must have an author"],
    },

    title: {
      type: String,
      required: [true, "Strategy title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },

    description: {
      type: String,
      required: [true, "Strategy description is required"],
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },

    // Strategy type
    type: {
      type: String,
      enum: ["scalping", "day_trading", "swing_trading", "position_trading"],
      required: true,
    },

    // Markets this strategy works on
    markets: [
      {
        type: String,
        enum: ["forex", "crypto", "stocks", "commodities", "indices"],
      },
    ],

    // Recommended timeframes
    timeframes: [
      {
        type: String,
        enum: ["M1", "M5", "M15", "M30", "H1", "H4", "D1", "W1"],
      },
    ],

    // Strategy Rules
    entryRules: [{ type: String }], // List of entry criteria
    exitRules: [{ type: String }], // List of exit criteria
    riskManagement: { type: String }, // Risk management description

    // Indicators used
    indicators: [{ type: String }],

    // Backtesting results (if provided)
    backtesting: {
      winRate: { type: Number },
      avgRR: { type: Number },
      totalTrades: { type: Number },
      period: { type: String },
    },

    // Pricing - Strategies can be free or paid
    price: {
      type: Number,
      default: 0, // 0 = free
      min: [0, "Price cannot be negative"],
    },

    isFree: {
      type: Boolean,
      default: true,
    },

    // Visibility
    isPublished: {
      type: Boolean,
      default: false,
    },

    // Social Stats
    // Lecture 7 Concept: Embedded documents vs references
    // We store aggregated stats ON the strategy document for fast reads
    // The full reviews are in a SEPARATE collection (see Review model)
    stats: {
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      purchases: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 },
    },

    // Tags for search/filter
    tags: [{ type: String, lowercase: true }],

    // Cover image URL
    coverImage: { type: String },
  },
  {
    timestamps: true,
  }
);

// Indexes for marketplace search
StrategySchema.index({ isPublished: 1, "stats.averageRating": -1 });
StrategySchema.index({ author: 1 });
StrategySchema.index({ type: 1 });
StrategySchema.index({ tags: 1 });

// Text index for search functionality
StrategySchema.index({ title: "text", description: "text", tags: "text" });

const Strategy = mongoose.model("Strategy", StrategySchema);

module.exports = Strategy;
