import express from "express";
import mongoose from "mongoose";

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
import redis from "./config/redis.js";

/**
 * --------------------------------------------------
 * Routes
 * --------------------------------------------------
 */

import authRoutes from "./routes/authRoutes.js";

import instagramRoutes from "./routes/instagramRoutes.js";

import instagramMediaRoutes from "./routes/instagramMediaRoutes.js";

import instagramAnalyticsRoutes from "./routes/instagramAnalyticsRoutes.js";

import CreatorScoreRoutes from "./routes/creatorScoreRoutes.js";

import creatorInsightsRoutes from "./routes/creatorInsightsRoutes.js";

import dashboardRoutes from "./routes/dashboardRoutes.js";

/**
 * Fix 1 — was importing from ./models/Recommendation.js (a model, not a route).
 * Corrected to the actual route file.
 */
import recommendationRoutes from "./routes/recommendationRoutes.js";

import conversationRoutes from "./routes/conversationRoutes.js";

import personalNoteRoutes from "./routes/personalNoteRoutes.js";

import contactRoutes from "./routes/contactRoutes.js";

const app = express();

/**
 * --------------------------------------------------
 * Security
 * --------------------------------------------------
 */

app.disable("x-powered-by");

app.use(helmetConfig);

app.use(corsConfig);

/**
 * Fix 2 — requestLogger moved before globalRateLimiter.
 * Previously rate-limited requests were never logged at all.
 * Now every request is logged regardless of whether it gets blocked.
 */
app.use(requestLogger);

app.use(globalRateLimiter);

/**
 * --------------------------------------------------
 * Body Parsers
 * --------------------------------------------------
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
 * --------------------------------------------------
 * Root Route
 * --------------------------------------------------
 */

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Creator Growth Software API is running",
  });
});

/**
 * --------------------------------------------------
 * Health Check
 * --------------------------------------------------
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

app.get("/api/ready", async (req, res) => {
  const mongoReady =
    mongoose.connection.readyState === 1;

  let redisReady = false;

  try {
    await redis.ping();
    redisReady = true;
  } catch {
    redisReady = false;
  }

  const isReady =
    mongoReady && redisReady;

  return res.status(
    isReady ? 200 : 503
  ).json({
    success:
      isReady,
    status:
      isReady ? "READY" : "NOT_READY",
    checks: {
      mongo:
        mongoReady ? "connected" : "disconnected",
      redis:
        redisReady ? "connected" : "disconnected",
    },
    timestamp:
      new Date().toISOString(),
  });
});

/**
 * --------------------------------------------------
 * API Routes
 * --------------------------------------------------
 */

/**
 * Authentication
 */
app.use("/api/auth", authRoutes);

/**
 * Instagram OAuth
 */
app.use("/api/instagram", instagramRoutes);

/**
 * Instagram Analytics
 */
app.use("/api/instagram/analytics", instagramAnalyticsRoutes);

/**
 * Instagram Media Sync
 */
app.use("/api/instagram/media", instagramMediaRoutes);

/**
 * Creator Score Engine
 */
app.use("/api/creator-score", CreatorScoreRoutes);

/**
 * Dashboard
 */
app.use("/api/dashboard", dashboardRoutes);

/**
 * Creator Insights Engine
 */
app.use("/api/creator-insights", creatorInsightsRoutes);

/**
 * Recommendation Engine
 */
app.use("/api/recommendations", recommendationRoutes);

/**
 * Conversation
 */
app.use("/api/conversation", conversationRoutes);

/**
 * Personal Notes
 */
app.use("/api/notes", personalNoteRoutes);

/**
 * Public Contact
 */
app.use("/api/contact", contactRoutes);

/**
 * --------------------------------------------------
 * 404 Handler
 * --------------------------------------------------
 */

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    statusCode: 404,
    message: "Route not found",
  });
});

/**
 * --------------------------------------------------
 * Global Error Handler
 * --------------------------------------------------
 */

app.use(errorMiddleware);

/**
 * --------------------------------------------------
 * Startup Log
 * --------------------------------------------------
 */

logger.info("Express application initialized");

export default app;
