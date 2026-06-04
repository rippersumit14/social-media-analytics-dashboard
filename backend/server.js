/**
 * --------------------------------------------------
 * Load Environment Variables First
 * --------------------------------------------------
 */

import "./config/env.js";

/**
 * Application
 */
import app from "./app.js";

/**
 * Database
 */
import connectDB from "./config/db.js";

/**
 * Environment Validation
 */
import validateEnv from "./config/validateEnv.js";

/**
 * Mail Verification
 */
import {
  verifyMailConnection,
} from "./config/mail.js";

/**
 * Logger
 */
import logger from "./utils/logger.js";

/**
 * Server Port
 */
const PORT =
  process.env.PORT || 5000;

/**
 * Server Instance
 */
let server;

/**
 * --------------------------------------------------
 * Start Server
 * --------------------------------------------------
 */

const startServer =
  async () => {
    try {
      const startedAt =
        Date.now();

      /**
       * Validate Environment Variables
       */

      validateEnv();

      /**
       * Connect Database
       */

      await connectDB();

      /**
       * Verify SMTP Connection
       */

      await verifyMailConnection();

      /**
       * Start Express Server
       */

      server =
        app.listen(
          PORT,
          () => {
            logger.info(
              "Backend server started successfully",
              {
                port: PORT,

                environment:
                  process.env.NODE_ENV,

                startupTimeMs:
                  Date.now() -
                  startedAt,

                nodeVersion:
                  process.version,
              }
            );
          }
        );
    } catch (error) {
      logger.error(
        "Server startup failed",
        {
          message:
            error.message,

          stack:
            error.stack,
        }
      );

      process.exit(1);
    }
  };

/**
 * --------------------------------------------------
 * Graceful Shutdown
 * --------------------------------------------------
 */

const gracefulShutdown =
  async (
    signal
  ) => {
    logger.warn(
      "Graceful shutdown initiated",
      {
        signal,
      }
    );

    try {
      if (server) {
        server.close(() => {
          logger.info(
            "HTTP server closed successfully"
          );

          process.exit(0);
        });
      }
    } catch (error) {
      logger.error(
        "Graceful shutdown failed",
        {
          message:
            error.message,
        }
      );

      process.exit(1);
    }
  };

/**
 * --------------------------------------------------
 * Process Events
 * --------------------------------------------------
 */

process.on(
  "unhandledRejection",
  (reason) => {
    logger.error(
      "Unhandled Promise Rejection",
      {
        reason:
          reason?.message ||
          reason,
      }
    );
  }
);

process.on(
  "uncaughtException",
  (error) => {
    logger.error(
      "Uncaught Exception",
      {
        message:
          error.message,

        stack:
          error.stack,
      }
    );

    process.exit(1);
  }
);

process.on(
  "SIGINT",
  () =>
    gracefulShutdown(
      "SIGINT"
    )
);

process.on(
  "SIGTERM",
  () =>
    gracefulShutdown(
      "SIGTERM"
    )
);

/**
 * --------------------------------------------------
 * Start Server
 * --------------------------------------------------
 */

startServer();