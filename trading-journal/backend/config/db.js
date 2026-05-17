// =============================================================
// config/db.js - Database Connection
// =============================================================
//
// Lecture 7 Concept: MongoDB Connection Setup
// 
// This module is responsible for ONE thing: connecting to MongoDB.
// This is the "Single Responsibility Principle" in practice -
// each file/module should do ONE job well.
//
// WHY SEPARATE THIS INTO ITS OWN FILE?
// - Easy to test the DB connection independently
// - Easy to swap databases (MongoDB → PostgreSQL) in one place
// - Keeps server.js clean and focused on server setup
// =============================================================

const mongoose = require("mongoose");

// connectDB is an async function because DB connections take time
// We don't want to block the entire application while connecting
const connectDB = async () => {
  try {
    // mongoose.connect() returns a Promise - we await it
    // process.env.MONGO_URI reads from our .env file (never hardcode this!)
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // conn.connection.host tells us WHERE we connected (useful for debugging)
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If DB connection fails, we CANNOT run the application safely
    // Log the error clearly and exit the process with code 1 (error)
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Exit with failure - don't start a broken server
  }
};

module.exports = connectDB;
