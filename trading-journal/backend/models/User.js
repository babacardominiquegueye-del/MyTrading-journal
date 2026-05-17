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

// =============================================================
// USER SCHEMA DEFINITION
// =============================================================
const UserSchema = new mongoose.Schema(
  {
    // Basic Info
    username: {
      type: String,
      required: [true, "Username is required"], // Custom error message
      unique: true, // Creates a unique index in MongoDB
      trim: true, // Removes leading/trailing spaces
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true, // Always store emails in lowercase
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
      select: false, // NEVER include password in query results by default
      // To get it: User.findOne().select('+password')
    },

    // =============================================================
    // RBAC - Role Based Access Control
    // Lecture 5 Auth Concept: Role-based authorization
    //
    // WHY ENUMS?
    // Restricts the field to only these values.
    // Prevents invalid roles like "superadmin" or "hacker" 😄
    // =============================================================
    role: {
      type: String,
      enum: {
        values: ["admin", "trader", "premium_trader", "strategy_seller"],
        message: "{VALUE} is not a valid role",
      },
      default: "trader", // New users start as basic traders
    },

    // Profile Information
    profile: {
      firstName: { type: String, trim: true },
      lastName: { type: String, trim: true },
      avatar: { type: String }, // URL to profile picture
      bio: { type: String, maxlength: [500, "Bio cannot exceed 500 characters"] },
      country: { type: String },
      tradingStyle: {
        type: String,
        enum: ["scalping", "day_trading", "swing_trading", "position_trading", "other"],
      },
      favoriteMarkets: [{ type: String }], // ["forex", "crypto", "stocks"]
    },

    // Account Statistics (Lecture 7 Concept: Embedded documents)
    // These are stats calculated and cached on the user document
    stats: {
      totalTrades: { type: Number, default: 0 },
      winRate: { type: Number, default: 0 },
      totalPnL: { type: Number, default: 0 },
      averageRR: { type: Number, default: 0 },
      rank: { type: Number },
    },

    // Account Status
    isActive: {
      type: Boolean,
      default: true,
    },

    // Premium subscription date (for premium_trader role)
    premiumUntil: {
      type: Date,
    },

    // Password reset fields
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    lastLogin: {
      type: Date,
    },
  },
  {
    // =============================================================
    // SCHEMA OPTIONS
    // timestamps: true automatically adds createdAt and updatedAt
    // This is Mongoose magic - you don't have to manage these manually
    // =============================================================
    timestamps: true,

    // toJSON transform removes sensitive fields when converting to JSON
    // This runs when you do res.json(user) or JSON.stringify(user)
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password; // Never expose password
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpire;
        return ret;
      },
    },
  }
);

// =============================================================
// MONGOOSE MIDDLEWARE (Pre/Post Hooks)
// =============================================================
//
// Lecture 5 Concept: Middleware concept (hooks work similarly)
// Pre hooks run BEFORE a database operation
// Post hooks run AFTER a database operation
//
// WHY HASH IN THE MODEL?
// By hashing in the pre-save hook, we GUARANTEE passwords are
// ALWAYS hashed regardless of which controller saves a user.
// It's impossible to accidentally save a plain-text password.
// =============================================================

// Pre-save hook: Hash password before saving to database
UserSchema.pre("save", async function (next) {
  // Only hash the password if it was MODIFIED (not on profile updates)
  // Without this check, we'd re-hash an already-hashed password!
  if (!this.isModified("password")) {
    return next(); // Skip hashing, continue to save
  }

  // WHY IS BCRYPT SLOW? (INTENTIONALLY!)
  // Bcrypt is designed to be computationally expensive.
  // The "salt rounds" (10) means it runs 2^10 = 1024 iterations.
  // This makes brute-force attacks extremely slow.
  // A hacker would need millions of years to crack properly bcrypt'd passwords.
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// =============================================================
// MONGOOSE INSTANCE METHODS
// Methods available on individual document instances
// Call like: const user = await User.findOne(); user.matchPassword("...")
// =============================================================

// Compare entered password with hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  // bcrypt.compare() hashes the enteredPassword with the same salt
  // and compares it to the stored hash. Returns true/false.
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token for this user
UserSchema.methods.getSignedJwtToken = function () {
  // jwt.sign() creates a token containing the user's ID and role
  //
  // WHY JWT?
  // JWT (JSON Web Token) is STATELESS authentication.
  // The server doesn't need to store sessions in a database.
  // Every request carries the token, server verifies it cryptographically.
  //
  // TOKEN PAYLOAD: { id: "...", role: "trader" }
  // The payload is BASE64 encoded (NOT encrypted!) - don't put secrets in it
  return jwt.sign(
    {
      id: this._id,
      role: this.role,
      username: this.username,
    },
    process.env.JWT_SECRET, // The secret key used to sign
    {
      expiresIn: process.env.JWT_EXPIRE || "7d", // Token expiry
    }
  );
};

// Check if user has required role(s)
UserSchema.methods.hasRole = function (...roles) {
  return roles.includes(this.role);
};

// Check if user is premium or admin
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
// Indexes make queries FAST. Without an index, MongoDB scans
// every document (O(n) search). With an index, it's O(log n).
// Add indexes on fields you frequently search/filter by.
UserSchema.index({ email: 1 }); // Already unique, but explicit
UserSchema.index({ role: 1 });
UserSchema.index({ "stats.rank": 1 });

const User = mongoose.model("User", UserSchema);

module.exports = User;
