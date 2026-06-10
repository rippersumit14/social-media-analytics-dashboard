import express from "express";
import axios from "axios";

import {
  helmetConfig,
  corsConfig,
  JSON_PAYLOAD_LIMIT,
  URL_ENCODED_LIMIT,
} from "./config/security.js";

import requestLogger from "./middlewares/requestLogger.js";
import { globalRateLimiter } from "./middlewares/rateLimiter.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";

import logger from "./utils/logger.js";

/**
 * --------------------------------------------------
 * Routes
 * --------------------------------------------------
 */

import authRoutes from "./routes/authRoutes.js";

import instagramRoutes from "./routes/instagramRoutes.js";

import instagramMediaRoutes from "./routes/instagramMediaRoutes.js";

import instagramAnalyticsRoutes from "./routes/instagramAnalyticsRoutes.js";


const app = express();

/**
 * --------------------------------------------------
 * Temporary Meta Connectivity Test
 * --------------------------------------------------
 *
 * Remove after development.
 */

app.get(
  "/meta-test",
  async (req, res) => {
    try {
      const response =
        await axios.get(
          "https://graph.facebook.com/v25.0/oauth/access_token",
          {
            params: {
              client_id:
                process.env.META_APP_ID,

              client_secret:
                process.env.META_APP_SECRET,

              grant_type:
                "client_credentials",
            },
          }
        );

      return res.status(200).json(
        response.data
      );

    } catch (error) {

      console.error(
        "\nMETA TEST ERROR"
      );

      console.dir(
        error.response?.data,
        {
          depth: null,
        }
      );

      return res.status(500).json(
        error.response?.data || {
          message:
            error.message,
        }
      );
    }
  }
);

/**
 * --------------------------------------------------
 * Security
 * --------------------------------------------------
 */

app.disable(
  "x-powered-by"
);

app.use(
  helmetConfig
);

app.use(
  corsConfig
);

app.use(
  globalRateLimiter
);

/**
 * --------------------------------------------------
 * Body Parsers
 * --------------------------------------------------
 */

app.use(
  express.json({
    limit:
      JSON_PAYLOAD_LIMIT,
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit:
      URL_ENCODED_LIMIT,
  })
);

/**
 * --------------------------------------------------
 * Request Logging
 * --------------------------------------------------
 */

app.use(
  requestLogger
);

/**
 * --------------------------------------------------
 * Root Route
 * --------------------------------------------------
 */

app.get(
  "/",
  (req, res) => {

    return res.status(200).json({
      success: true,

      message:
        "Creator Growth Software API is running",
    });
  }
);

/**
 * --------------------------------------------------
 * Health Check
 * --------------------------------------------------
 */

app.get(
  "/api/health",
  (req, res) => {

    return res.status(200).json({
      success: true,

      status: "OK",

      environment:
        process.env.NODE_ENV,

      uptime:
        process.uptime(),

      timestamp:
        new Date().toISOString(),
    });
  }
);

/**
 * --------------------------------------------------
 * API Routes
 * --------------------------------------------------
 */

/**
 * Authentication
 */

app.use(
  "/api/auth",
  authRoutes
);

/**
 * Instagram OAuth
 */

app.use(
  "/api/instagram",
  instagramRoutes
);

//Instgram Analytics Routes
app.use(
  "/api/instagram/analytics",
  instagramAnalyticsRoutes
);


/**
 * Instagram Media Sync
 */

app.use(
  "/api/instagram/media",
  instagramMediaRoutes
);

/**
 * --------------------------------------------------
 * 404 Handler
 * --------------------------------------------------
 */

app.use(
  (req, res) => {

    return res.status(404).json({
      success: false,

      message:
        "Route not found",
    });
  }
);

/**
 * --------------------------------------------------
 * Global Error Handler
 * --------------------------------------------------
 */

app.use(
  errorMiddleware
);

/**
 * --------------------------------------------------
 * Startup Log
 * --------------------------------------------------
 */

logger.info(
  "Express application initialized"
);

export default app;