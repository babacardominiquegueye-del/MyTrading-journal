// =============================================================
// middleware/error.middleware.js - Global Error Handler
// =============================================================
//
// Lecture 5 Concept: Express error handling middleware
//
// Express recognizes error middleware by the 4-parameter signature:
// (err, req, res, next) - the "err" first parameter is KEY
//
// HOW IT WORKS:
// When you call next(error) anywhere in your app,
// Express skips ALL regular middleware and routes and jumps
// directly to this error handler.
//
// This is GLOBAL error handling - write it once, catch everything.
// This is why errorHandler must be the LAST middleware registered!
// =============================================================

const errorHandler = (err, req, res, next) => {
  // Clone the error to avoid mutating the original
  let error = { ...err };
  error.message = err.message;

  // Log error in development for debugging
  if (process.env.NODE_ENV === "development") {
    console.error("❌ Error:", {
      message: err.message,
      stack: err.stack,
      name: err.name,
    });
  }

  // =============================================================
  // MONGOOSE SPECIFIC ERRORS
  // Different error types need different HTTP responses
  // =============================================================

  // Mongoose CastError: Invalid MongoDB ObjectId
  // Example: GET /api/trades/not-a-valid-id → CastError
  if (err.name === "CastError") {
    const message = `Resource not found - invalid ID: ${err.value}`;
    error = { statusCode: 404, message };
  }

  // Mongoose Validation Error: Schema validation failed
  // Example: Missing required field, value outside enum
  if (err.name === "ValidationError") {
    // Extract all validation error messages into an array
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = { statusCode: 400, message };
  }

  // Mongoose Duplicate Key Error (code 11000)
  // Example: Registering with an email that already exists
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate value for field '${field}' - this ${field} is already taken`;
    error = { statusCode: 400, message };
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    error = { statusCode: 401, message: "Invalid token" };
  }

  if (err.name === "TokenExpiredError") {
    error = { statusCode: 401, message: "Token expired, please login again" };
  }

  // =============================================================
  // SEND ERROR RESPONSE
  // =============================================================
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Server Error",
    // Only send stack trace in development (NEVER in production!)
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
