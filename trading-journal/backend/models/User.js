// =============================================================
// models/User.js - User Mongoose Schema
// =============================================================
//
// Lecture 7 Concept: MongoDB document modeling
// Lecture 7 Concept: Mongoose schema validation
//
// WHY MONGOOSE SCHEMAS?
// MongoDB is "schemaless" - it accepts any shape of document.
// But in real applications, we WANT structure and validation.
// Mongoose gives us schema validation on top of MongoDB.
//
// THINK OF IT LIKE:
// MongoDB collection = a box where you throw papers
// Mongoose schema = a form template every paper must follow
// =============================================================

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,      // ← unique:true crée DÉJÀ un index automatiquement
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    // =============================================================
    // RBAC - Role Based Access Control
    // Lecture 5 Auth Concept: Role-based authorization
    // =============================================================
    role: {
      type: String,
      enum: {
        values: ["admin", "trader", "premium_trader", "strategy_seller"],
        message: "{VALUE} is not a valid role",
      },
      default: "trader",
    },

    profile: {
      firstName: { type: String, trim: true },
      lastName:  { type: String, trim: true },
      avatar:    { type: String },
      bio:       { type: String, maxlength: [500, "Bio cannot exceed 500 characters"] },
      country:   { type: String },
      tradingStyle: {
        type: String,
        enum: ["scalping", "day_trading", "swing_trading", "position_trading", "other"],
      },
      favoriteMarkets: [{ type: String }],
    },

    // Lecture 7 Concept: Embedded documents
    stats: {
      totalTrades: { type: Number, default: 0 },
      winRate:     { type: Number, default: 0 },
      totalPnL:    { type: Number, default: 0 },
      averageRR:   { type: Number, default: 0 },
      rank:        { type: Number },
    },

    isActive:  { type: Boolean, default: true },
    premiumUntil: { type: Date },
    resetPasswordToken:  String,
    resetPasswordExpire: Date,
    lastLogin: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpire;
        return ret;
      },
    },
  }
);

// =============================================================
// PRE-SAVE HOOK — Hachage du mot de passe
// =============================================================
// Lecture 5 Concept: Middleware hooks
//
// WHY HASH IN THE MODEL?
// En hachant ici, on GARANTIT que le mot de passe est toujours
// haché, peu importe quel controller sauvegarde l'utilisateur.
//
// WHY IS BCRYPT SLOW? (INTENTIONNELLEMENT!)
// Bcrypt est conçu pour être coûteux en calcul.
// 10 salt rounds = 2^10 = 1024 itérations.
// Un hacker mettrait des millions d'années à cracker les mots de passe.
// =============================================================
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// =============================================================
// INSTANCE METHODS
// =============================================================

// Compare le mot de passe entré avec le hash stocké
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Génère un JWT signé pour cet utilisateur
// WHY JWT? Authentification STATELESS — le serveur ne stocke pas de sessions
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role, username: this.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );
};

UserSchema.methods.hasRole = function (...roles) {
  return roles.includes(this.role);
};

UserSchema.methods.isPremium = function () {
  return (
    this.role === "premium_trader" ||
    this.role === "admin" ||
    (this.premiumUntil && this.premiumUntil > new Date())
  );
};

// =============================================================
// INDEXES
// =============================================================
// Lecture 7 Concept: MongoDB indexes
//
// ⚠️  email N'EST PAS indexé ici — unique:true dans le schéma
//     crée DÉJÀ un index automatiquement sur ce champ.
//     Ajouter UserSchema.index({ email:1 }) en plus = index DUPLIQUÉ
//     → Warning Mongoose "Duplicate schema index"
// =============================================================
UserSchema.index({ role: 1 });
UserSchema.index({ "stats.rank": 1 });

const User = mongoose.model("User", UserSchema);

module.exports = User;