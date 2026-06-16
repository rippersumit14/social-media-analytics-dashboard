import express
  from "express";

import protect
  from "../middlewares/authMiddleware.js";

import {

  createConversationController,

  getConversationsController,

  getConversationMessagesController,

  chatWithAIController,

  archiveConversationController,

} from "../controllers/conversationController.js";

const router =
  express.Router();

/**
 * --------------------------------------------------
 * Conversations
 * --------------------------------------------------
 */

router.post(
  "/",
  protect,
  createConversationController
);

router.get(
  "/",
  protect,
  getConversationsController
);

/**
 * --------------------------------------------------
 * Messages
 * --------------------------------------------------
 */

router.get(
  "/:conversationId/messages",
  protect,
  getConversationMessagesController
);

/**
 * --------------------------------------------------
 * AI Chat
 * --------------------------------------------------
 */

router.post(
  "/:conversationId/chat",
  protect,
  chatWithAIController
);

/**
 * --------------------------------------------------
 * Archive
 * --------------------------------------------------
 */

router.patch(
  "/:conversationId/archive",
  protect,
  archiveConversationController
);

export default router;