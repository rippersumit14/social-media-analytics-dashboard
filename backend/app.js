/**
 * app.js
 * Main Express application configuration using ES Modules.
 * Handles middleware and base routes.
 */

// Import dependencies using ES Modules
import express from "express";
import cors from "cors";
import morgan from "morgan";

// Initialize Express app
const app = express();

// ======================
// Middleware Configuration
// ======================
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse incoming JSON requests
app.use(morgan("dev")); // Log HTTP requests

// ======================
// Health Check Route
// ======================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Social Media Analytics API is running successfully ",
  });
});

// Export the app for use in server.js
export default app;