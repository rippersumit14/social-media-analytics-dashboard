import express from "express";

/**
 * ---------------------------------------------------
 * Security Configuration
 * ---------------------------------------------------
 */

import {
  helmetConfig,
  corsConfig,
  JSON_PAYLOAD_LIMIT,
  URL_ENCODED_LIMIT,
} from "./config/security.js";

/**
 * ---------------------------------------------------
 * Request Logger Middleware
 * ---------------------------------------------------
 */

import requestLogger from "./middlewares/requestLogger.js";

/**
 * ---------------------------------------------------
 * Rate Limiters
 * ---------------------------------------------------
 */

import { globalRateLimiter } from "./middlewares/rateLimiter.js";

/**
 * ---------------------------------------------------
 * Global Error Middleware
 * ---------------------------------------------------
 */

import errorMiddleware from "./middlewares/errorMiddleware.js";

/**
 * ---------------------------------------------------
 * Routes
 * ---------------------------------------------------
 */

import authRoutes from "./routes/authRoutes.js";
import socialAccountRoutes from "./routes/socialAccountRoutes.js";
import analyticsSnapshotRoutes from "./routes/analyticsSnapshotRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import instagramRoutes from "./routes/instagramRoutes.js";

/**
 * ---------------------------------------------------
 * Logger
 * ---------------------------------------------------
 */

import logger from "./utils/logger.js";

const app = express();

/**
 * ---------------------------------------------------
 * Express Security Hardening
 * ---------------------------------------------------
 */

/**
 * Hide Express technology
 */
app.disable("x-powered-by");

/**
 * ---------------------------------------------------
 * Security Middlewares
 * ---------------------------------------------------
 */

/**
 * Helmet security headers
 */
app.use(helmetConfig);

/**
 * Secure CORS configuration
 */
app.use(corsConfig);

/**
 * Global API rate limiter
 */
app.use(globalRateLimiter);

/**
 * ---------------------------------------------------
 * Request Parsing
 * ---------------------------------------------------
 */

/**
 * Parse JSON payloads
 */
app.use(
  express.json({
    limit: JSON_PAYLOAD_LIMIT,
  })
);

/**
 * Parse URL encoded payloads
 */
app.use(
  express.urlencoded({
    extended: true,
    limit: URL_ENCODED_LIMIT,
  })
);

/**
 * ---------------------------------------------------
 * Logging Middlewares
 * ---------------------------------------------------
 */

/**
 * Structured request logger
 *
 * Note:
 * Morgan has been removed to avoid duplicate request logs.
 */
app.use(requestLogger);

/**
 * ---------------------------------------------------
 * Base Route
 * ---------------------------------------------------
 */

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Social Media Analytics API is running",
  });
});

/**
 * ---------------------------------------------------
 * Health Check Route
 * ---------------------------------------------------
 *
 * Used for:
 * - deployment monitoring
 * - uptime checks
 * - load balancers
 * - production health verification
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
 * ---------------------------------------------------
 * API Routes
 * ---------------------------------------------------
 */

/**
 * Authentication routes
 */
app.use("/api/auth", authRoutes);

/**
 * Social account routes
 */
app.use("/api/social-accounts", socialAccountRoutes);

/**
 * Analytics snapshot routes
 */
app.use("/api/analytics-snapshots", analyticsSnapshotRoutes);

/**
 * AI routes
 */
app.use("/api/ai", aiRoutes);

/**
 * Instagram OAuth + Graph API routes
 *
 * Future scalability:
 * - token refresh
 * - analytics sync
 * - account linking
 * - insights fetching
 */

app.use("/api/instagram", instagramRoutes);

/**
 * ---------------------------------------------------
 * 404 Route Handler
 * ---------------------------------------------------
 *
 * IMPORTANT:
 * Do NOT use "*" in newer Express versions. A bare app.use catches all unmatched routes safely.
 */
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/**
 * ---------------------------------------------------
 * Global Error Middleware
 * ---------------------------------------------------
 *
 * IMPORTANT:
 * Always register LAST
 *
 * Handles:
 * - AppError
 * - asyncHandler errors
 * - Multer errors
 * - unexpected server failures
 */
app.use(errorMiddleware);

/**
 * ---------------------------------------------------
 * Startup Log
 * ---------------------------------------------------
 */

logger.info("Express application initialized");

export default app;