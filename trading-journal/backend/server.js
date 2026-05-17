// =============================================================
// server.js - Application Entry Point
// =============================================================
//
// Lecture 2 Concept: Modular backend architecture
// Lecture 5 Concept: Express middleware pipeline
//
// This is the ENTRY POINT of our backend application.
// Think of it as the "main()" of our server.
//
// WHAT HAPPENS HERE:
// 1. Load environment variables
// 2. Create the Express app
// 3. Register middleware
// 4. Register routes
// 5. Connect to database
// 6. Start listening for requests
// =============================================================

// dotenv MUST be loaded FIRST before any other module
// It reads our .env file and adds variables to process.env
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");

// ---------------------
// Import all route files
// ---------------------
// Lecture 4 Concept: RESTful route organization
// Each route file handles ONE resource (auth, trades, strategies, etc.)
const authRoutes = require("./routes/auth.routes");
const tradeRoutes = require("./routes/trade.routes");
const strategyRoutes = require("./routes/strategy.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const userRoutes = require("./routes/user.routes");
const leaderboardRoutes = require("./routes/leaderboard.routes");
const journalRoutes = require("./routes/journal.routes");
const notificationRoutes = require("./routes/notification.routes");

// Import custom error handler middleware
const errorHandler = require("./middleware/error.middleware");

// =============================================================
// INITIALIZE EXPRESS APP
// =============================================================
const app = express();

// =============================================================
// MIDDLEWARE PIPELINE
// =============================================================
// Lecture 5 Concept: Express middleware
//
// Middleware is code that runs BETWEEN receiving a request and
// sending a response. Each middleware function gets (req, res, next).
//
// ORDER MATTERS! Middleware runs top-to-bottom.
// If you put errorHandler before routes, errors won't be caught.
// If you put bodyParser after routes, req.body will be undefined.
// =============================================================

// CORS - Cross Origin Resource Sharing
// Allows our React frontend (port 3000) to talk to our API (port 5000)
// Without this, browsers BLOCK requests between different origins
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true, // Allow cookies/auth headers
  })
);

// Body Parser - parses incoming JSON request bodies
// Makes req.body available in our controllers
// Without this, req.body would be undefined!
app.use(express.json({ limit: "10kb" })); // Limit body size for security
app.use(express.urlencoded({ extended: true }));

// Morgan - HTTP request logger (only in development)
// Logs: GET /api/trades 200 45ms
// This is incredibly useful for debugging API calls
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// =============================================================
// API ROUTES
// =============================================================
// Lecture 4 Concept: RESTful route naming
//
// All routes are prefixed with /api/ 
// This makes it clear these are API endpoints, not pages
// =============================================================
app.use("/api/auth", authRoutes);
app.use("/api/trades", tradeRoutes);
app.use("/api/strategies", strategyRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/notifications", notificationRoutes);

// Health check route - useful to verify the server is running
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Trading Journal API is running",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Handle undefined routes (must come AFTER all valid routes)
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// =============================================================
// GLOBAL ERROR HANDLER (must be LAST middleware)
// =============================================================
// Lecture 5 Concept: Error handling middleware
// Express recognizes error middleware by the 4 parameters (err, req, res, next)
// This catches ALL errors thrown with next(error) anywhere in the app
app.use(errorHandler);

// =============================================================
// START SERVER
// =============================================================
const PORT = process.env.PORT || 5000;

// We connect to DB BEFORE starting the server
// This ensures the server is ready to handle requests that need the DB
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(
      `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    );
    console.log(`📊 API available at http://localhost:${PORT}/api`);
  });
};

startServer();

module.exports = app; // Export for testing
