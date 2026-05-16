import express from "express";

import { getAIInsights } from "../controllers/aiController.js";

import protect from "../middleware/authMiddleware.js";
import aiRateLimiter from "../middleware/aiRateLimiter.js";

import {
  chatWithAI,
  chatWithAIStream,
  getChatSessions,
  getSessionMessages,
  renameChatSession,
  deleteChatSession,
} from "../controllers/chatController.js";

import { uploadImage } from "../middleware/uploadMiddleware.js";

const router = express.Router();

/**
 * =========================================================
 * AI INSIGHTS ROUTES
 * =========================================================
 */

/**
 * Generate AI insights for selected social account.
 *
 * Features:
 * - analytics-aware prompting
 * - AI recommendations
 * - engagement analysis
 * - growth suggestions
 */
router.post(
  "/insights/:socialAccountId",
  protect,
  aiRateLimiter,
  getAIInsights
);

/**
 * =========================================================
 * AI CHAT ROUTES
 * =========================================================
 */

/**
 * Normal AI chat route.
 *
 * Supports:
 * - text-only chat
 * - image-only chat
 * - image + text chat
 *
 * Frontend request:
 * multipart/form-data
 *
 * Expected image field:
 * image
 */
router.post(
  "/chat/:socialAccountId",
  protect,
  aiRateLimiter,

  /**
   * Parse uploaded image from multipart/form-data.
   *
   * Creates:
   * req.file
   */
  uploadImage.single("image"),

  chatWithAI
);

/**
 * Streaming AI chat route.
 *
 * Used for:
 * - ChatGPT-style typing UI
 * - live token streaming
 * - SSE response streaming
 *
 * Supports:
 * - text-only chat
 * - image-only chat
 * - image + text chat
 *
 * Note:
 * aiRateLimiter intentionally removed because
 * usage validation already happens inside controller.
 */
router.post(
  "/chat/:socialAccountId/stream",
  protect,

  /**
   * Parse uploaded image from multipart/form-data.
   */
  uploadImage.single("image"),

  chatWithAIStream
);

/**
 * =========================================================
 * CHAT SESSION ROUTES
 * =========================================================
 */

/**
 * Get all chat sessions for selected social account.
 *
 * Used for:
 * - chat history sidebar
 * - recent conversations
 * - session switching
 */
router.get(
  "/chat/sessions/:socialAccountId",
  protect,
  getChatSessions
);

/**
 * Get all messages of selected chat session.
 *
 * Used when:
 * - opening old chat
 * - restoring chat history
 * - loading previous messages
 */
router.get(
  "/chat/session/:sessionId/messages",
  protect,
  getSessionMessages
);

/**
 * Rename selected chat session.
 *
 * Example:
 * "Instagram growth ideas"
 * →
 * "Q2 marketing strategy"
 */
router.patch(
  "/chat/session/:sessionId",
  protect,
  renameChatSession
);

/**
 * Delete selected chat session.
 *
 * Removes:
 * - session
 * - related chat messages
 *
 * Future enhancement:
 * - delete associated Cloudinary images
 */
router.delete(
  "/chat/session/:sessionId",
  protect,
  deleteChatSession
);

export default router;