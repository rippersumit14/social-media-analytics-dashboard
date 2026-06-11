import express from "express";

import {
  getDashboard,
} from "../controllers/dashboardController.js";

import protect
  from "../middlewares/authMiddleware.js";

const router =
  express.Router();

/**
 * --------------------------------------------------
 * Dashboard
 * --------------------------------------------------
 */

router.get(
  "/overview",
  protect,
  getDashboard
);

export default router;