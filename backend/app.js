import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import socialAccountRoutes from "./routes/socialAccountRoutes.js"
import analyticsSnapshotRoutes from "./routes/analyticsSnapshotRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

const app = express();

//Global middleware configuration
//Enable cross origin-resource sharing

app.use(cors());

//Parse incoming JSON requests bodies
app.use(express.json());

//Log HTTP requests in development
app.use(morgan("dev"));

//adding the socialAccountRoute
app.use("/api/social-accounts", socialAccountRoutes);

//adding the snapshot route
app.use("/api/analytics-snapshots", analyticsSnapshotRoutes); 

//adding the ai route
app.use("/api/ai", aiRoutes);


//Base route
//Useful for confirming backend is running

app.get("/", (req, res) => {
  res.json({
    message: "Social media Analytics API is running",
  });
});

//Health Check route 
//Usefull for testing server status

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

//authentication routes
//all auth endpoints will start with /api/auth

app.use("/api/auth", authRoutes);

export default app;
