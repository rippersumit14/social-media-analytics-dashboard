/**
 * server.js
 * Entry point of the backend application.
 */

import dotenv from "dotenv";

/**
 * Load environment variables FIRST
 * before importing app/services/configs.
 */
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;

/**
 * Start Express server
 */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});