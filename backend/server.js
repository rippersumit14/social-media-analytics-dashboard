/**
 * Load .env FIRST.
 *
 * This prevents:
 * - Cloudinary config issues
 * - Redis config issues
 * - AI provider config issues
 */
import "./config/env.js";

import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`[SERVER_READY] Backend running on http://localhost:${PORT}`);
    });

    /**
     * Close the HTTP server before process exit so deployment platforms can
     * recycle the service cleanly.
     */
    const shutdown = (signal) => {
      console.log(`[SERVER_SHUTDOWN] Received ${signal}`);
      server.close(() => process.exit(0));
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("[SERVER_START_ERROR]", {
      message: error.message,
    });

    process.exit(1);
  }
};

startServer();
