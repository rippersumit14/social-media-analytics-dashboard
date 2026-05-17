import express from "express";

import protect from "../middleware/authMiddleware.js";

import aiRateLimiter from "../middleware/aiRateLimiter.js";

import { uploadImages } from "../middleware/uploadMiddleware.js";

import {
  chatWithAI,
  chatWithAIStream,
  getChatSessions,
  getSessionMessages,
  renameChatSession,
  deleteChatSession,
} from "../controllers/chatController.js";

import {
  getAIInsights,
} from "../controllers/aiController.js";

const router = express.Router();

/**
 * Generate analytics AI insights.
 *
 * Example:
 * - growth analysis
 * - engagement insights
 * - recommendations
 */
router.post(
  "/insights/:socialAccountId",

  protect,

  aiRateLimiter,

  getAIInsights
);

/**
 * Normal AI chat endpoint.
 *
 * Supports:
 * - text-only
 * - image-only
 * - text + multiple images
 *
 * multipart/form-data
 *
 * Frontend fields:
 * - message
 * - sessionId (optional)
 * - images[]
 */
router.post(
  "/chat/:socialAccountId",

  protect,

  aiRateLimiter,

  /**
   * Parse multiple image uploads.
   *
   * Max:
   * 5 images
   */
  uploadImages.array(
    "images",
    5
  ),

  chatWithAI
);

/**
 * Streaming AI endpoint.
 *
 * IMPORTANT:
 * Temporarily disabled during
 * stabilization phase.
 *
 * Route preserved for
 * future SSE rebuild.
 */
router.post(
  "/chat/:socialAccountId/stream",

  protect,

  aiRateLimiter,

  uploadImages.array(
    "images",
    5
  ),

  chatWithAIStream
);

/**
 * Get all chat sessions
 * for selected social account.
 */
router.get(
  "/chat/sessions/:socialAccountId",

  protect,

  getChatSessions
);

/**
 * Get all messages
 * for selected chat session.
 */
router.get(
  "/chat/session/:sessionId/messages",

  protect,

  getSessionMessages
);

/**
 * Rename existing chat session.
 */
router.patch(
  "/chat/session/:sessionId",

  protect,

  renameChatSession
);

/**
 * Delete chat session.
 *
 * Also cleans:
 * - chat messages
 * - cloud images
 */
router.delete(
  "/chat/session/:sessionId",

  protect,

  deleteChatSession
);

export default router;