import express from "express";
import {
  getInstagramOAuthUrl,
  handleInstagramOAuthCallback,
  getInstagramStatus,
} from "../controllers/instagramController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @route   GET /api/instagram/oauth/url
 * @desc    Generate Instagram OAuth login URL
 * @access  Private
 *
 * Why protected:
 * Only logged-in users should be able to start an Instagram connection.
 * The backend uses req.user._id to sign the OAuth state.
 */
router.get("/oauth/url", protect, getInstagramOAuthUrl);

/**
 * @route   GET /api/instagram/oauth/callback
 * @desc    Handle Meta OAuth redirect callback
 * @access  Public callback
 *
 * Why not protected by JWT middleware:
 * Meta redirects the browser to this endpoint and will not send our JWT.
 * Security is handled by the signed OAuth state token instead.
 */
router.get("/oauth/callback", handleInstagramOAuthCallback);

 /* @route   GET /api/instagram/status
 * @desc    Check whether Instagram OAuth is configured
 * @access  Private
 *
 * Why protected:
 * Configuration status is app behavior metadata, and this route belongs
 * to authenticated dashboard usage.
 */
router.get("/status", protect, getInstagramStatus);

export default router;