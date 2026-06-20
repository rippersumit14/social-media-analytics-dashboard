import asyncHandler from "../middlewares/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import AppError from "../utils/AppError.js";

import {
  createConversation,
  getUserConversations,
  getConversationById,
  getConversationMessages,
  saveUserMessage,
  saveAssistantMessage,
  buildHistoryMessages,
  buildCreatorContext,
  updateConversationActivity,
  archiveConversation,
  renameConversation,
  deleteConversation,
  restoreConversation,
} from "../services/conversationService.js";

import { generateAnalyticsResponse } from "../services/aiService.js";

/**
 * --------------------------------------------------
 * Create Conversation
 * --------------------------------------------------
 */

export const createConversationController = asyncHandler(async (req, res) => {
  const { instagramAccountId, title } = req.body;

  if (!instagramAccountId) {
    throw new AppError("Instagram account id is required", 400);
  }

  const conversation = await createConversation({
    userId: req.user._id,
    instagramAccountId,
    title,
  });

  return res.status(201).json(
    new ApiResponse({
      success: true,
      statusCode: 201,
      message: "Conversation created successfully",
      data: {
        conversation,
      },
    })
  );
});

/**
 * --------------------------------------------------
 * Get User Conversations
 * --------------------------------------------------
 */

export const getConversationsController = asyncHandler(async (req, res) => {
  const conversations = await getUserConversations(req.user._id);

  return res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: "Conversations fetched successfully",
      data: {
        conversations,
      },
    })
  );
});

/**
 * --------------------------------------------------
 * Get Conversation Messages
 * --------------------------------------------------
 */

export const getConversationMessagesController = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  await getConversationById(conversationId, req.user._id);

  const messages = await getConversationMessages(conversationId);

  return res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: "Messages fetched successfully",
      data: {
        messages,
      },
    })
  );
});

/**
 * --------------------------------------------------
 * Chat With AI
 * --------------------------------------------------
 */

export const chatWithAIController = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { message } = req.body;

  if (!message?.trim()) {
    throw new AppError("Message is required", 400);
  }

  const conversation = await getConversationById(conversationId, req.user._id);

  /**
   * Save User Message
   */

  await saveUserMessage({
    conversationId,
    userId: req.user._id,
    content: message,
  });

  /**
   * Build Context
   */

  const [historyMessages, creatorContext] = await Promise.all([
    buildHistoryMessages(conversationId),
    buildCreatorContext(conversation.instagramAccount),
  ]);

  console.log("\nCREATOR CONTEXT RECEIVED:");
  console.log(creatorContext);

  /**
   * Generate AI Response
   */

  const aiResult = await generateAnalyticsResponse({
    analyticsContext: creatorContext,
    historyMessages,
    latestUserMessage: message,
  });

  /**
   * Save Assistant Message
   */

  const aiMessage = await saveAssistantMessage({
    conversationId,
    userId: req.user._id,
    content: aiResult.reply,
    provider: aiResult.provider,
    model: aiResult.modelUsed,
    latencyMs: aiResult.latencyMs,
  });

  /**
   * Update Conversation Activity
   */

  await updateConversationActivity(conversationId);

  return res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: "AI response generated successfully",
      data: {
        reply: aiMessage,
      },
    })
  );
});

/**
 * --------------------------------------------------
 * Archive Conversation
 * --------------------------------------------------
 */

export const archiveConversationController = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  const conversation = await archiveConversation(conversationId, req.user._id);

  return res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: "Conversation archived successfully",
      data: {
        conversation,
      },
    })
  );
});

/**
 * --------------------------------------------------
 * Rename Conversation
 * --------------------------------------------------
 */

export const renameConversationController =
  asyncHandler(async (req, res) => {

    const { conversationId } =
      req.params;

    const { title } =
      req.body;

    const conversation =
      await renameConversation({

        conversationId,

        userId:
          req.user._id,

        title,
      });

    return res.status(200).json(

      new ApiResponse({

        success: true,

        statusCode: 200,

        message:
          "Conversation renamed successfully",

        data: {
          conversation,
        },
      })
    );
  });

  /**
 * --------------------------------------------------
 * Delete Conversation
 * --------------------------------------------------
 *
 * Soft delete.
 */

export const deleteConversationController =
  asyncHandler(async (req, res) => {

    const { conversationId } =
      req.params;

    const conversation =
      await deleteConversation({

        conversationId,

        userId:
          req.user._id,
      });

    return res.status(200).json(

      new ApiResponse({

        success: true,

        statusCode: 200,

        message:
          "Conversation deleted successfully",

        data: {
          conversation,
        },
      })
    );
  });


  /**
 * --------------------------------------------------
 * Restore Conversation
 * --------------------------------------------------
 */

export const restoreConversationController =
  asyncHandler(async (req, res) => {

    const { conversationId } =
      req.params;

    const conversation =
      await restoreConversation({

        conversationId,

        userId:
          req.user._id,
      });

    return res.status(200).json(

      new ApiResponse({

        success: true,

        statusCode: 200,

        message:
          "Conversation restored successfully",

        data: {
          conversation,
        },
      })
    );
  });