import express from "express";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes.js";
import socialAccountRoutes from "./routes/socialAccountRoutes.js";
import analyticsSnapshotRoutes from "./routes/analyticsSnapshotRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import instagramRoutes from "./routes/instagramRoutes.js";

const app = express();

/**
 * Global middleware
 */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

/**
 * Base route
 */
app.get("/", (req, res) => {
  res.json({
    message: "Social media Analytics API is running",
  });
});

/**
 * Health check route
 */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

/**
 * API routes
 */
app.use("/api/auth", authRoutes);
app.use("/api/social-accounts", socialAccountRoutes);
app.use("/api/analytics-snapshots", analyticsSnapshotRoutes);
app.use("/api/ai", aiRoutes);

/**
 * Instagram OAuth + Graph API routes
 *
 * Current endpoints:
 * GET /api/instagram/oauth/url
 * GET /api/instagram/oauth/callback
 *
 * Why separate:
 * Instagram integration will grow into OAuth, analytics sync,
 * account refresh, token checks, and insights fetching.
 */
app.use("/api/instagram", instagramRoutes);

/**
 * JSON error boundary for middleware errors.
 *
 * Main use today:
 * - Multer upload validation errors
 * - request body parsing errors
 *
 * Controllers still handle their own expected domain errors.
 */
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  console.error("[API_ERROR]", {
    path: req.originalUrl,
    message: error.message,
  });

  const statusCode =
    error.statusCode || (error.code === "LIMIT_FILE_SIZE" ? 400 : 500);

  return res.status(statusCode).json({
    message:
      statusCode === 500
        ? "Internal server error"
        : error.message || "Invalid request",
  });
});

export default app;
