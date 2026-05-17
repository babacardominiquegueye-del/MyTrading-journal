// =============================================================
// middleware/validation.middleware.js - Input Validation
// =============================================================
//
// Lecture 5 Concept: Validation middleware
//
// WHY VALIDATE ON THE BACKEND?
// Frontend validation is for UX (fast feedback).
// Backend validation is for SECURITY.
// NEVER trust data from the client - always validate on the server!
// A malicious user can bypass frontend validation with tools like Postman.
//
// We use express-validator library for clean validation rules
// =============================================================

const { body, validationResult } = require("express-validator");

// =============================================================
// VALIDATION RUNNER
// =============================================================
// This middleware checks if any validation errors occurred
// and returns them before reaching the controller
// Run this AFTER your validation rules
const runValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Format errors into a readable array
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formattedErrors,
    });
  }

  next(); // No errors, proceed to controller
};

// =============================================================
// AUTH VALIDATION RULES
// =============================================================

const validateRegister = [
  body("username")
    .trim()
    .notEmpty().withMessage("Username is required")
    .isLength({ min: 3, max: 30 }).withMessage("Username must be between 3-30 characters")
    .matches(/^[a-zA-Z0-9_]+$/).withMessage("Username can only contain letters, numbers, and underscores"),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
    .matches(/\d/).withMessage("Password must contain at least one number"),

  runValidation,
];

const validateLogin = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email"),

  body("password")
    .notEmpty().withMessage("Password is required"),

  runValidation,
];

// =============================================================
// TRADE VALIDATION RULES
// =============================================================

const validateTrade = [
  body("pair")
    .trim()
    .notEmpty().withMessage("Trading pair is required")
    .isLength({ max: 20 }).withMessage("Pair name too long"),

  body("direction")
    .notEmpty().withMessage("Trade direction is required")
    .isIn(["buy", "sell", "long", "short"]).withMessage("Direction must be buy, sell, long, or short"),

  body("entryPrice")
    .notEmpty().withMessage("Entry price is required")
    .isFloat({ min: 0 }).withMessage("Entry price must be a positive number"),

  body("stopLoss")
    .optional()
    .isFloat({ min: 0 }).withMessage("Stop loss must be a positive number"),

  body("takeProfit")
    .optional()
    .isFloat({ min: 0 }).withMessage("Take profit must be a positive number"),

  body("entryDate")
    .optional()
    .isISO8601().withMessage("Entry date must be a valid date"),

  runValidation,
];

// =============================================================
// STRATEGY VALIDATION RULES
// =============================================================

const validateStrategy = [
  body("title")
    .trim()
    .notEmpty().withMessage("Strategy title is required")
    .isLength({ max: 100 }).withMessage("Title cannot exceed 100 characters"),

  body("description")
    .trim()
    .notEmpty().withMessage("Strategy description is required")
    .isLength({ min: 50 }).withMessage("Description must be at least 50 characters"),

  body("type")
    .notEmpty().withMessage("Strategy type is required")
    .isIn(["scalping", "day_trading", "swing_trading", "position_trading"])
    .withMessage("Invalid strategy type"),

  runValidation,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateTrade,
  validateStrategy,
  runValidation,
};
