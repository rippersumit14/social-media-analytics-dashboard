import express from "express";

import protect from "../middlewares/authMiddleware.js";
import {
  creatorNewsRefreshRateLimiter,
} from "../middlewares/rateLimiter.js";
import {
  getCreatorNewsController,
  refreshCreatorNewsController,
} from "../controllers/creatorNewsController.js";

const router = express.Router();

router.use(protect);

router.get(
  "/",
  getCreatorNewsController
);

router.post(
  "/refresh",
  creatorNewsRefreshRateLimiter,
  refreshCreatorNewsController
);

export default router;
