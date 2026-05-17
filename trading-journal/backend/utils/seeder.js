// ============================================================
// utils/seeder.js — Données de démonstration réalistes
// ============================================================
// Lance avec : npm run seed
// Supprime les données : npm run seed -- --destroy
//
// Ce script crée des données réalistes pour que le dashboard
// soit complet dès le premier lancement.
// ============================================================
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const User         = require("../models/User");
const Trade        = require("../models/Trade");
const Strategy     = require("../models/Strategy");
const JournalEntry = require("../models/JournalEntry");

const connectDB = require("../config/db");

const pairs = ["EUR/USD", "GBP/USD", "USD/JPY", "BTC/USDT", "ETH/USDT", "AAPL", "TSLA", "GOLD"];
const setups = ["breakout", "pullback", "reversal", "trend_following", "range"];
const emotions = ["calm", "excited", "fearful", "confident", "anxious", "neutral"];
const afterEmotions = ["satisfied", "disappointed", "angry", "relieved", "neutral"];
const markets = ["forex", "crypto", "stocks", "commodities"];

// Génère un nombre aléatoire entre min et max
const rand = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max));
const pick = (arr) => arr[randInt(0, arr.length)];

// Génère une date dans les N derniers mois
const randomDate = (monthsBack = 6) => {
  const date = new Date();
  date.setMonth(date.getMonth() - randInt(0, monthsBack));
  date.setDate(randInt(1, 28));
  return date;
};

const generateTrades = (userId, count = 60) => {
  const trades = [];

  for (let i = 0; i < count; i++) {
    const direction = pick(["buy", "sell"]);
    const pair      = pick(pairs);
    const entryPrice = parseFloat(rand(1.0, 200.0).toFixed(4));
    const sl = entryPrice * (direction === "buy" ? 0.99 : 1.01);
    const tp = entryPrice * (direction === "buy" ? 1.02 : 0.98);
    const rr = parseFloat((Math.abs(tp - entryPrice) / Math.abs(entryPrice - sl)).toFixed(2));

    // 55% winrate réaliste
    const isWin = Math.random() < 0.55;
    const result = Math.random() < 0.05 ? "breakeven" : isWin ? "win" : "loss";
    const pnl = result === "win"
      ? parseFloat(rand(50, 500).toFixed(2))
      : result === "loss"
      ? parseFloat(-rand(30, 300).toFixed(2))
      : 0;

    const entryDate = randomDate(6);
    const exitDate  = new Date(entryDate);
    exitDate.setHours(exitDate.getHours() + randInt(1, 48));

    trades.push({
      createdBy: userId,
      pair,
      market:    markets.find((m) =>
        ["BTC/USDT","ETH/USDT"].includes(pair) ? m === "crypto"
        : ["AAPL","TSLA"].includes(pair) ? m === "stocks"
        : ["GOLD"].includes(pair) ? m === "commodities"
        : m === "forex"
      ) || "forex",
      direction,
      entryPrice,
      exitPrice:  result === "win"
        ? direction === "buy" ? entryPrice * 1.02 : entryPrice * 0.98
        : direction === "buy" ? entryPrice * 0.99 : entryPrice * 1.01,
      stopLoss:   parseFloat(sl.toFixed(4)),
      takeProfit: parseFloat(tp.toFixed(4)),
      riskRewardRatio: rr,
      result,
      profitLoss: pnl,
      entryDate,
      exitDate,
      setup:   pick(setups),
      emotions:{
        beforeTrade: pick(emotions),
        afterTrade:  pick(afterEmotions),
        followedPlan: Math.random() > 0.2,
      },
      notes: result === "loss"
        ? "Trade contre tendance, aurais dû attendre confirmation"
        : "Setup propre, bon entry sur le retest",
      tags: [pair.split("/")[0].toLowerCase(), pick(setups)],
      qualityRating: randInt(1, 6),
    });
  }
  return trades;
};

const seedDB = async () => {
  await connectDB();

  if (process.argv[2] === "--destroy") {
    console.log("🗑️  Suppression des données...");
    await Promise.all([
      User.deleteMany(),
      Trade.deleteMany(),
      Strategy.deleteMany(),
      JournalEntry.deleteMany(),
    ]);
    console.log("✅ Données supprimées");
    process.exit(0);
  }

  console.log("🌱 Création des données de démonstration...");

  // Vider les données existantes de seed
  await User.deleteMany({ email: { $in: ["admin@demo.com", "trader@demo.com", "premium@demo.com"] } });

  // ---- Créer les utilisateurs ----
  const adminUser = await User.create({
    username: "AdminDemo",
    email: "admin@demo.com",
    password: "demo1234",
    role: "admin",
    profile: {
      firstName: "Admin",
      lastName: "Demo",
      bio: "Administrateur de la plateforme",
      tradingStyle: "swing_trading",
    },
  });

  const traderUser = await User.create({
    username: "TraderAlex",
    email: "trader@demo.com",
    password: "demo1234",
    role: "trader",
    profile: {
      firstName: "Alex",
      lastName: "Martin",
      bio: "Trader forex depuis 3 ans, spécialisé EUR/USD",
      tradingStyle: "day_trading",
      favoriteMarkets: ["forex", "crypto"],
    },
  });

  const premiumUser = await User.create({
    username: "PremiumSarah",
    email: "premium@demo.com",
    password: "demo1234",
    role: "premium_trader",
    profile: {
      firstName: "Sarah",
      lastName: "Dubois",
      bio: "Swing trader sur actions et crypto",
      tradingStyle: "swing_trading",
    },
  });

  // ---- Créer les trades ----
  const traderTrades  = generateTrades(traderUser._id, 70);
  const premiumTrades = generateTrades(premiumUser._id, 45);
  const adminTrades   = generateTrades(adminUser._id, 30);

  await Trade.insertMany([...traderTrades, ...premiumTrades, ...adminTrades]);

  // ---- Stratégie de démonstration ----
  await Strategy.create({
    author:      premiumUser._id,
    title:       "Pullback sur EMA 20 — Forex",
    description: "Stratégie de pullback sur la moyenne mobile exponentielle 20 périodes. Entrée sur retest de l'EMA en tendance établie. Cette approche simple mais efficace permet de trader dans le sens du marché avec un risque maîtrisé. Idéale pour les paires majeures forex sur H1 et H4.",
    type:        "day_trading",
    markets:     ["forex"],
    timeframes:  ["H1", "H4"],
    entryRules:  [
      "Prix en tendance haussière au-dessus de EMA 50",
      "Attendre pullback sur EMA 20",
      "Confirmation par bougie d'inversion (pin bar, engulfing)",
      "Volume supérieur à la moyenne",
    ],
    exitRules: [
      "Stop Loss sous le dernier swing low",
      "Take Profit au ratio 1:2 minimum",
      "Sortie si prix clôture sous EMA 20",
    ],
    riskManagement: "Risque maximum 1% du capital par trade. Ne pas trader lors des annonces économiques majeures.",
    indicators:  ["EMA 20", "EMA 50", "Volume", "RSI 14"],
    backtesting: { winRate: 62, avgRR: 2.1, totalTrades: 180, period: "Jan 2023 - Déc 2023" },
    isPublished: true,
    isFree:      true,
    tags:        ["ema", "pullback", "forex", "tendance"],
  });

  // ---- Entrée journal ----
  await JournalEntry.create({
    author:  traderUser._id,
    date:    new Date(),
    title:   "Session du lundi — Bonne discipline",
    content: "Session productive aujourd'hui. J'ai attendu mes setups sans me précipiter. Le trade EUR/USD s'est très bien déroulé, pullback propre sur l'EMA 20. J'ai évité de trader pendant la news NFP comme prévu. Mes émotions étaient bien contrôlées tout au long de la session.",
    marketCondition: "trending",
    mood:    "good",
    keyLessons: ["La patience paie", "Ne jamais trader pendant les news"],
    nextSessionGoals: ["Viser 2 setups maximum", "Vérifier le calendrier économique le matin"],
  });

  // Mise à jour stats utilisateurs
  const updateStats = async (user, trades) => {
    const closed = trades.filter((t) => t.result !== "open");
    const wins   = closed.filter((t) => t.result === "win").length;
    const pnl    = closed.reduce((s, t) => s + t.profitLoss, 0);
    const rrT    = closed.filter((t) => t.riskRewardRatio > 0);
    const avgRR  = rrT.length ? rrT.reduce((s, t) => s + t.riskRewardRatio, 0) / rrT.length : 0;

    await User.findByIdAndUpdate(user._id, {
      "stats.totalTrades": closed.length,
      "stats.winRate":     closed.length ? Math.round((wins / closed.length) * 100) : 0,
      "stats.totalPnL":    Math.round(pnl * 100) / 100,
      "stats.averageRR":   Math.round(avgRR * 100) / 100,
    });
  };

  await updateStats(traderUser,  traderTrades);
  await updateStats(premiumUser, premiumTrades);
  await updateStats(adminUser,   adminTrades);

  console.log("✅ Données créées avec succès !");
  console.log("\n📋 Comptes de démonstration :");
  console.log("   Admin     → admin@demo.com   / demo1234");
  console.log("   Trader    → trader@demo.com  / demo1234");
  console.log("   Premium   → premium@demo.com / demo1234");

  process.exit(0);
};

seedDB().catch((err) => {
  console.error("❌ Erreur seeder:", err);
  process.exit(1);
});
