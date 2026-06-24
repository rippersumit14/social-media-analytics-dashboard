/**
 * --------------------------------------------------
 * Load Environment Variables First
 * --------------------------------------------------
 */

import "./config/env.js";

/**
 * --------------------------------------------------
 * Application
 * --------------------------------------------------
 */

import app from "./app.js";

/**
 * --------------------------------------------------
 * Database
 * --------------------------------------------------
 */

import connectDB from "./config/db.js";

/**
 * --------------------------------------------------
 * Environment Validation
 * --------------------------------------------------
 */

import validateEnv from "./config/validateEnv.js";

/**
 * --------------------------------------------------
 * Mail Verification
 * --------------------------------------------------
 */

import { verifyMailConnection } from "./config/mail.js";

/**
 * --------------------------------------------------
 * Redis
 * --------------------------------------------------
 */

import redis from "./config/redis.js";

/**
 * --------------------------------------------------
 * Automation Runner
 * --------------------------------------------------
 */

import startAutomationRunner from "./jobs/automationRunner.js";

/**
 * --------------------------------------------------
 * Logger
 * --------------------------------------------------
 */

import logger from "./utils/logger.js";

/**
 * --------------------------------------------------
 * Server Configuration
 * --------------------------------------------------
 */

const PORT = process.env.PORT || 5000;

let server;

/**
 * --------------------------------------------------
 * Start Server
 * --------------------------------------------------
 */

const startServer = async () => {
  try {
    const startedAt = Date.now();

    /**
     * Validate Environment Variables
     */
    validateEnv();

    /**
     * Connect MongoDB
     */
    await connectDB();

    /**
     * Verify SMTP Connection
     */
    await verifyMailConnection();

    /**
     * Verify Redis Connection
     */
    await redis.ping();

    /**
     * Start Express Server
     */
    server = app.listen(PORT, () => {
      logger.info("Backend server started successfully", {
        port: PORT,
        environment: process.env.NODE_ENV,
        startupTimeMs: Date.now() - startedAt,
        nodeVersion: process.version,
      });

      startAutomationRunner();

      logger.info("Automation scheduler initialized successfully");
    });

    /**
     * Fix 3 — SSE timeout settings.
     * Without these, long-lived SSE connections get cut off by Node's
     * default keep-alive timeout before streaming finishes.
     * Set outside the listen() callback so they apply immediately
     * after the server instance is created.
     */
    server.keepAliveTimeout = 65000;
    server.headersTimeout = 66000;

  } catch (error) {
    logger.error("Server startup failed", {
      message: error.message,
      stack: error.stack,
    });

    process.exit(1);
  }
};

/**
 * --------------------------------------------------
 * Graceful Shutdown
 * --------------------------------------------------
 */

const gracefulShutdown = async (signal) => {
  logger.warn("Graceful shutdown initiated", { signal });

  try {
    if (server) {
      server.close(async () => {
        logger.info("HTTP server closed successfully");

        try {
          await redis.quit();
          logger.info("Redis connection closed");
        } catch (redisError) {
          logger.error("Error closing Redis connection", {
            message: redisError.message,
          });
        }

        process.exit(0);
      });
    } else {
      /**
       * Fix 4 — Handle edge case where SIGTERM arrives before the server
       * instance is created (e.g. startup fails mid-way).
       * Without this else branch, shutdown would hang indefinitely.
       */
      process.exit(0);
    }
  } catch (error) {
    logger.error("Graceful shutdown failed", {
      message: error.message,
    });

    process.exit(1);
  }
};

/**
 * --------------------------------------------------
 * Process Events
 * --------------------------------------------------
 */

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Promise Rejection", {
    reason: reason?.message || reason,
  });
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", {
    message: error.message,
    stack: error.stack,
  });

  process.exit(1);
});

process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

/**
 * --------------------------------------------------
 * Bootstrap Application
 * --------------------------------------------------
 */

startServer();