// =============================================================
// models/Trade.js - Trade Mongoose Schema
// =============================================================
//
// Lecture 7 Concept: MongoDB document modeling
// Lecture 7 Concept: Mongoose schema relationships
//
// WHY MONGODB FOR TRADING DATA?
// Trading data is naturally flexible:
// - Different markets have different fields (crypto 24/7, stocks have sessions)
// - Traders track different things (some track emotions, some don't)
// - Schema can evolve as features are added
// MongoDB's flexible documents handle this better than rigid SQL tables
// =============================================================

const mongoose = require("mongoose");

const TradeSchema = new mongoose.Schema(
  {
    // =============================================================
    // RELATIONSHIP: Trade belongs to a User
    // Lecture 7 Concept: Mongoose schema relationships
    //
    // type: mongoose.Schema.Types.ObjectId means this field stores
    // a MongoDB ObjectId that REFERENCES a document in the "User" collection
    //
    // ref: "User" enables .populate() to replace the ID with the full user object
    // Example: Trade.find().populate('createdBy') → gets user data automatically
    // =============================================================
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Trade must belong to a user"],
      index: true, // Index for fast "get all trades by user" queries
    },

    // Trading Pair (e.g., "EUR/USD", "BTC/USDT", "AAPL")
    pair: {
      type: String,
      required: [true, "Trading pair is required"],
      uppercase: true, // Store as uppercase for consistency
      trim: true,
    },

    // Market type
    market: {
      type: String,
      enum: ["forex", "crypto", "stocks", "commodities", "indices", "other"],
      default: "forex",
    },

    // Trade Direction
    direction: {
      type: String,
      required: [true, "Trade direction is required"],
      enum: {
        values: ["buy", "sell", "long", "short"],
        message: "Direction must be buy, sell, long, or short",
      },
    },

    // Price Data
    entryPrice: {
      type: Number,
      required: [true, "Entry price is required"],
      min: [0, "Entry price cannot be negative"],
    },

    exitPrice: {
      type: Number,
      min: [0, "Exit price cannot be negative"],
    },

    stopLoss: {
      type: Number,
      min: [0, "Stop loss cannot be negative"],
    },

    takeProfit: {
      type: Number,
      min: [0, "Take profit cannot be negative"],
    },

    // Position Size
    positionSize: {
      type: Number,
      min: [0, "Position size cannot be negative"],
    },

    // Lot size (for forex)
    lotSize: {
      type: Number,
      min: [0, "Lot size cannot be negative"],
    },

    // =============================================================
    // CALCULATED FIELDS - Risk/Reward Ratio
    //
    // We calculate and STORE RR instead of computing it every time.
    // This is a performance vs storage tradeoff.
    // For analytics queries on thousands of trades, pre-calculated
    // values are MUCH faster than calculating on-the-fly.
    // =============================================================
    riskRewardRatio: {
      type: Number,
      min: [0, "Risk/reward ratio cannot be negative"],
    },

    // Risk amount in account currency
    riskAmount: {
      type: Number,
      min: [0, "Risk amount cannot be negative"],
    },

    // Trade Result
    result: {
      type: String,
      enum: {
        values: ["win", "loss", "breakeven", "open"],
        message: "Result must be win, loss, breakeven, or open",
      },
      default: "open",
    },

    // Profit/Loss in account currency
    profitLoss: {
      type: Number,
      default: 0,
    },

    // Profit/Loss as percentage
    profitLossPercent: {
      type: Number,
      default: 0,
    },

    // Trade Timing
    entryDate: {
      type: Date,
      required: [true, "Entry date is required"],
      default: Date.now,
    },

    exitDate: {
      type: Date,
    },

    // Trade Duration in minutes (calculated on exit)
    durationMinutes: {
      type: Number,
    },

    // Strategy used for this trade
    strategy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Strategy",
    },

    // Trading Setup/Pattern
    setup: {
      type: String,
      enum: [
        "breakout",
        "pullback",
        "reversal",
        "trend_following",
        "range",
        "news",
        "other",
      ],
    },

    // Timeframe analyzed
    timeframe: {
      type: String,
      enum: ["M1", "M5", "M15", "M30", "H1", "H4", "D1", "W1", "MN"],
    },

    // Tags for filtering and categorizing trades
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    // =============================================================
    // PSYCHOLOGICAL TRACKING
    // One of the most powerful features of a trading journal!
    // Tracking emotions helps traders identify psychological patterns
    // =============================================================
    emotions: {
      beforeTrade: {
        type: String,
        enum: [
          "calm",
          "excited",
          "fearful",
          "greedy",
          "confident",
          "anxious",
          "neutral",
        ],
      },
      afterTrade: {
        type: String,
        enum: [
          "satisfied",
          "disappointed",
          "angry",
          "euphoric",
          "relieved",
          "neutral",
        ],
      },
      followedPlan: {
        type: Boolean,
        default: true,
      },
    },

    // Trade Notes
    notes: {
      type: String,
      maxlength: [2000, "Notes cannot exceed 2000 characters"],
    },

    // Screenshot URL (chart screenshot)
    screenshot: {
      type: String,
    },

    // Mistakes made (for learning)
    mistakes: [{ type: String }],

    // Lessons learned
    lessons: [{ type: String }],

    // Rating of the trade quality (1-5)
    qualityRating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  {
    // timestamps: true adds createdAt and updatedAt automatically
    timestamps: true,
  }
);

// =============================================================
// INDEXES FOR PERFORMANCE
// =============================================================
// Compound index: fast lookup of "all trades by user, sorted by date"
// This is the most common query in the app!
TradeSchema.index({ createdBy: 1, entryDate: -1 });
TradeSchema.index({ createdBy: 1, result: 1 });
TradeSchema.index({ createdBy: 1, pair: 1 });
TradeSchema.index({ pair: 1 }); // For leaderboard queries

// =============================================================
// PRE-SAVE HOOK: Calculate derived fields
// =============================================================
TradeSchema.pre("save", function (next) {
  // Calculate duration when exit date is set
  if (this.exitDate && this.entryDate) {
    const diffMs = this.exitDate - this.entryDate;
    this.durationMinutes = Math.round(diffMs / 60000);
  }

  // Auto-calculate risk/reward ratio if we have the data
  if (this.entryPrice && this.stopLoss && this.takeProfit) {
    const risk = Math.abs(this.entryPrice - this.stopLoss);
    const reward = Math.abs(this.takeProfit - this.entryPrice);

    if (risk > 0) {
      this.riskRewardRatio = parseFloat((reward / risk).toFixed(2));
    }
  }

  next();
});

// =============================================================
// VIRTUAL FIELDS
// =============================================================
// Virtuals are computed fields that are NOT stored in the database
// They're calculated on-the-fly when accessed
// Good for simple derived values you don't need to query on
TradeSchema.virtual("isOpen").get(function () {
  return this.result === "open";
});

TradeSchema.virtual("isWin").get(function () {
  return this.result === "win";
});

// Include virtuals when converting to JSON
TradeSchema.set("toJSON", { virtuals: true });
TradeSchema.set("toObject", { virtuals: true });

const Trade = mongoose.model("Trade", TradeSchema);

module.exports = Trade;
