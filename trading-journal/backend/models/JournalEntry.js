// =============================================================
// models/JournalEntry.js - Trading Journal Entry Schema
// =============================================================
const mongoose = require("mongoose");

const JournalEntrySchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Journal date (for calendar view)
    date: {
      type: Date,
      required: [true, "Journal date is required"],
      default: Date.now,
    },

    title: {
      type: String,
      required: [true, "Journal title is required"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },

    content: {
      type: String,
      required: [true, "Journal content is required"],
      maxlength: [10000, "Content cannot exceed 10000 characters"],
    },

    // Market conditions on that day
    marketCondition: {
      type: String,
      enum: ["trending", "ranging", "volatile", "quiet", "news_driven"],
    },

    // Overall mood/mindset for the trading day
    mood: {
      type: String,
      enum: ["excellent", "good", "neutral", "poor", "terrible"],
    },

    // Trade IDs referenced in this journal entry
    relatedTrades: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trade",
      },
    ],

    // Key lessons learned that day
    keyLessons: [{ type: String }],

    // Goals for next session
    nextSessionGoals: [{ type: String }],

    tags: [{ type: String, lowercase: true }],

    isPrivate: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

JournalEntrySchema.index({ author: 1, date: -1 });

const JournalEntry = mongoose.model("JournalEntry", JournalEntrySchema);

module.exports = JournalEntry;
