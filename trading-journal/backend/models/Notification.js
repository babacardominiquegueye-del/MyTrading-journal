// =============================================================
// models/Notification.js - Notification Schema
// =============================================================
const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "review_received",
        "strategy_liked",
        "rank_changed",
        "achievement_unlocked",
        "system",
      ],
      required: true,
    },

    title: { type: String, required: true },
    message: { type: String, required: true },

    // Optional reference to related resource
    relatedResource: {
      resourceType: {
        type: String,
        enum: ["trade", "strategy", "review", "user"],
      },
      resourceId: { type: mongoose.Schema.Types.ObjectId },
    },

    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ recipient: 1, isRead: 1 });
NotificationSchema.index({ recipient: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", NotificationSchema);

module.exports = Notification;
