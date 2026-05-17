// =============================================================
// models/Review.js - Strategy Review Schema
// =============================================================
const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    // Review belongs to a Strategy
    strategy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Strategy",
      required: true,
    },

    // Review written by a User
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },

    title: {
      type: String,
      required: [true, "Review title is required"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },

    comment: {
      type: String,
      required: [true, "Review comment is required"],
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },

    // Was the strategy actually used in live trading?
    usedInLive: { type: Boolean, default: false },

    // Helpful votes from other users
    helpfulVotes: { type: Number, default: 0 },

    isApproved: { type: Boolean, default: true }, // Admin can remove reviews
  },
  {
    timestamps: true,
  }
);

// =============================================================
// COMPOUND UNIQUE INDEX
// One review per user per strategy - prevents duplicate reviews
// =============================================================
ReviewSchema.index({ strategy: 1, author: 1 }, { unique: true });

// =============================================================
// POST HOOK: Update strategy average rating after review saved
// =============================================================
ReviewSchema.post("save", async function () {
  // Recalculate average rating for the strategy
  const Strategy = mongoose.model("Strategy");
  const stats = await mongoose.model("Review").aggregate([
    { $match: { strategy: this.strategy } },
    {
      $group: {
        _id: "$strategy",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Strategy.findByIdAndUpdate(this.strategy, {
      "stats.averageRating": Math.round(stats[0].avgRating * 10) / 10,
      "stats.totalReviews": stats[0].count,
    });
  }
});

const Review = mongoose.model("Review", ReviewSchema);

module.exports = Review;
