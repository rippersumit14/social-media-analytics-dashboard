import express from "express";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes.js";
import socialAccountRoutes from "./routes/socialAccountRoutes.js";
import analyticsSnapshotRoutes from "./routes/analyticsSnapshotRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

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

export default app;