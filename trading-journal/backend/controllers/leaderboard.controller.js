// ============================================================
// controllers/leaderboard.controller.js — Classement
// ============================================================
// Lecture 7 Concept: MongoDB Aggregation Pipeline
// ============================================================
const Trade = require("../models/Trade");
const User  = require("../models/User");

// @desc  Classement général des traders
// @route GET /api/leaderboard
// @access Private (Premium ou Admin)
const getLeaderboard = async (req, res, next) => {
  try {
    const { period = "alltime", metric = "pnl" } = req.query;

    // Filtre temporel
    const dateFilter = {};
    const now = new Date();
    if (period === "monthly") {
      dateFilter.$gte = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === "weekly") {
      const monday = new Date(now);
      monday.setDate(now.getDate() - now.getDay() + 1);
      dateFilter.$gte = monday;
    }

    const matchFilter = {
      result: { $in: ["win", "loss", "breakeven"] },
    };
    if (Object.keys(dateFilter).length > 0) {
      matchFilter.entryDate = dateFilter;
    }

    // Aggregation : calcule les stats par utilisateur
    const leaderboard = await Trade.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id:         "$createdBy",
          totalPnL:    { $sum: "$profitLoss" },
          totalTrades: { $sum: 1 },
          wins:        { $sum: { $cond: [{ $eq: ["$result", "win"] }, 1, 0] } },
          avgRR:       { $avg: "$riskRewardRatio" },
        },
      },
      {
        $addFields: {
          winRate: {
            $round: [
              { $multiply: [{ $divide: ["$wins", "$totalTrades"] }, 100] },
              1,
            ],
          },
        },
      },
      // Trier selon la métrique choisie
      {
        $sort: metric === "winrate"
          ? { winRate: -1 }
          : metric === "trades"
          ? { totalTrades: -1 }
          : { totalPnL: -1 },
      },
      { $limit: 50 },
      // Jointure avec la collection Users pour obtenir username + avatar
      {
        $lookup: {
          from:         "users",
          localField:   "_id",
          foreignField: "_id",
          as:           "user",
        },
      },
      { $unwind: "$user" },
      // Sélectionne uniquement les champs utiles
      {
        $project: {
          username:    "$user.username",
          avatar:      "$user.profile.avatar",
          role:        "$user.role",
          totalPnL:    { $round: ["$totalPnL", 2] },
          totalTrades: 1,
          winRate:     1,
          avgRR:       { $round: ["$avgRR", 2] },
        },
      },
    ]);

    // Ajoute le rang
    const ranked = leaderboard.map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));

    // Position de l'utilisateur actuel
    const myRank = ranked.findIndex(
      (e) => e._id?.toString() === req.user._id.toString()
    );

    res.status(200).json({
      success: true,
      data:    ranked,
      myRank:  myRank !== -1 ? myRank + 1 : null,
      period,
      metric,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getLeaderboard };
