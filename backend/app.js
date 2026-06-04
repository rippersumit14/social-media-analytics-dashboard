import express from "express";

import {
  helmetConfig,
  corsConfig,
  JSON_PAYLOAD_LIMIT,
  URL_ENCODED_LIMIT,
} from "./config/security.js";

import requestLogger from "./middlewares/requestLogger.js";

import { globalRateLimiter } from "./middlewares/rateLimiter.js";

import errorMiddleware from "./middlewares/errorMiddleware.js";

import authRoutes from "./routes/authRoutes.js";

import logger from "./utils/logger.js";

const app = express();

/**
 * Security
 */

app.disable("x-powered-by");

app.use(helmetConfig);

app.use(corsConfig);

app.use(globalRateLimiter);

/**
 * Body Parsing
 */

app.use(
  express.json({
    limit: JSON_PAYLOAD_LIMIT,
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: URL_ENCODED_LIMIT,
  })
);

/**
 * Logging
 */

app.use(requestLogger);

/**
 * Root Route
 */

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Creator Growth Software API is running",
  });
});

/**
 * Health Check
 */

app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,
    status: "OK",
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/**
 * --------------------------------------------------
 * ACTIVE ROUTES
 * --------------------------------------------------
 */

app.use("/api/auth", authRoutes);

/**
 * --------------------------------------------------
 * FUTURE ROUTES
 * --------------------------------------------------
 *
 * Enable after implementation
 */

// app.use("/api/conversations", conversationRoutes);

// app.use("/api/notes", noteRoutes);

// app.use("/api/content-ideas", contentIdeaRoutes);

// app.use("/api/reminders", reminderRoutes);

// app.use("/api/creator-score", creatorScoreRoutes);

// app.use("/api/instagram/auth", instagramAuthRoutes);

// app.use(
//   "/api/instagram/analytics",
//   instagramAnalyticsRoutes
// );

// app.use("/api/ai", aiRoutes);

/**
 * 404
 */

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/**
 * Error Handler
 */

app.use(errorMiddleware);

logger.info(
  "Express application initialized"
);

export default app;