/**
 * server.js
 *
 * Main backend entry point.
 *
 * Important:
 * Environment variables MUST load
 * before importing app/services/configs.
 */

/**
 * Load .env FIRST.
 *
 * This prevents:
 * - Cloudinary config issues
 * - Redis config issues
 * - OpenRouter config issues
 */
import "./config/env.js";

import app from "./app.js";
import connectDB from "./config/db.js";

/**
 * Connect MongoDB database.
 */
connectDB();

/**
 * Application port.
 */
const PORT = process.env.PORT || 5000;

/**
 * Start Express server.
 */
app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});