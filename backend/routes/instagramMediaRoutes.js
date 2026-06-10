import express from "express";

import protect from "../middlewares/authMiddleware.js";

import {
  syncMedia,
} from "../controllers/instagramMediaController.js";

const router =
  express.Router();

/**
 * --------------------------------------------------
 * Sync Instagram Media
 * --------------------------------------------------
 *
 * POST
 * /api/instagram/media/sync
 */

router.post(
  "/sync",
  protect,
  syncMedia
);

export default router;