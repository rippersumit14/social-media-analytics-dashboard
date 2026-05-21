/**
 * ---------------------------------------------------
 * Load Environment Variables FIRST
 * ---------------------------------------------------
 *
 * Prevents configuration issues for:
 * - Cloudinary
 * - MongoDB
 * - AI providers
 * - Redis (future)
 * - OAuth providers
 */

import "./config/env.js";

import app from "./app.js";

import connectDB from "./config/db.js";

/**
 * Server Port
 */
const PORT = process.env.PORT || 5000;

/**
 * ---------------------------------------------------
 * Start Backend Server
 * ---------------------------------------------------
 */

const startServer = async () => {

  try {

    /**
     * Connect MongoDB database
     */
    await connectDB();

    /**
     * Start Express HTTP server
     */
    const server = app.listen(PORT, () => {

      console.log(
        `[SERVER_READY] Backend running on http://localhost:${PORT}`
      );
    });

    /**
     * ---------------------------------------------------
     * Graceful Shutdown Handler
     * ---------------------------------------------------
     *
     * Allows deployment platforms and local development
     * environments to properly close the server.
     *
     * Prevents:
     * - hanging connections
     * - corrupted requests
     * - abrupt process termination
     */

    const shutdown = (signal) => {

      console.log(
        `[SERVER_SHUTDOWN] Received ${signal}`
      );

      /**
       * Stop accepting new requests
       */
      server.close(() => {

        console.log(
          "[SERVER_SHUTDOWN] HTTP server closed"
        );

        process.exit(0);
      });
    };

    /**
     * Handle termination signals
     */
    process.on("SIGINT", () => shutdown("SIGINT"));

    process.on("SIGTERM", () => shutdown("SIGTERM"));

  } catch (error) {

    /**
     * Fatal startup error
     * Example:
     * - Mongo connection failure
     * - Invalid environment variables
     */

    console.error("[SERVER_START_ERROR]", {
      message: error.message,
    });

    process.exit(1);
  }
};

/**
 * Bootstrap backend server
 */
startServer();