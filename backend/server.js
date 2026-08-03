/**
 * --------------------------------------------------
 * Load Environment Variables First
 * --------------------------------------------------
 */

import "./config/env.js";
import mongoose from "mongoose";

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

import redis, {
  verifyRedisConnection,
} from "./config/redis.js";

/**
 * --------------------------------------------------
 * Automation Runner
 * --------------------------------------------------
 */

import startAutomationRunner from "./jobs/automationRunner.js";
import {
  startEmailWorker,
  closeEmailWorker,
} from "./jobs/emailWorker.js";
import {
  closeEmailQueue,
} from "./jobs/emailQueue.js";

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
    const redisReady =
      await verifyRedisConnection();

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
      if (redisReady) {
        startEmailWorker();
      } else {
        logger.warn(
          "Email queue worker not started because Redis is unavailable; direct email fallback will be used where possible"
        );
      }

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
    const closeSharedResources = async () => {
      await Promise.allSettled([
        closeEmailWorker(),
        closeEmailQueue(),
        redis.quit(),
        mongoose.connection.close(),
      ]);

      logger.info("Shared backend resources closed");
    };

    if (server) {
      server.close(async () => {
        logger.info("HTTP server closed successfully");

        await closeSharedResources();

        process.exit(0);
      });
    } else {
      /**
       * Fix 4 — Handle edge case where SIGTERM arrives before the server
       * instance is created (e.g. startup fails mid-way).
       * Without this else branch, shutdown would hang indefinitely.
       */
      await closeSharedResources();
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
