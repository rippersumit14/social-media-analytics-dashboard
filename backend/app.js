import express from "express";
import cors from "cors";
import morgan from "morgan";

// Global error middleware
import errorMiddleware from "./middlewares/errorMiddleware.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import socialAccountRoutes from "./routes/socialAccountRoutes.js";
import analyticsSnapshotRoutes from "./routes/analyticsSnapshotRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import instagramRoutes from "./routes/instagramRoutes.js";

const app = express();

/**
 * ---------------------------------------------------
 * Global Middlewares
 * ---------------------------------------------------
 */

// Enable CORS
app.use(cors());

// Parse incoming JSON payloads
app.use(express.json());

// Parse URL encoded form data
app.use(express.urlencoded({ extended: true }));

// HTTP request logger
app.use(morgan("dev"));

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
 * - health verification
 */

app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

/**
 * ---------------------------------------------------
 * API Routes
 * ---------------------------------------------------
 */

// Authentication routes
app.use("/api/auth", authRoutes);

// Social account routes
app.use("/api/social-accounts", socialAccountRoutes);

// Analytics snapshot routes
app.use("/api/analytics-snapshots", analyticsSnapshotRoutes);

// AI routes
app.use("/api/ai", aiRoutes);

/**
 * Instagram OAuth + Graph API routes
 *
 * Current endpoints:
 * GET /api/instagram/oauth/url
 * GET /api/instagram/oauth/callback
 *
 * Future scalability:
 * - token refresh
 * - analytics sync
 * - insights fetching
 * - account linking
 */
app.use("/api/instagram", instagramRoutes);

/**
 * ---------------------------------------------------
 * Global Error Middleware
 * ---------------------------------------------------
 *
 * IMPORTANT:
 * Must always be registered LAST.
 *
 * Handles:
 * - AppError custom errors
 * - asyncHandler forwarded errors
 * - Multer upload errors
 * - unexpected server errors
 */

app.use(errorMiddleware);

export default app;