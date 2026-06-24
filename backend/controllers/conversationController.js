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

import {
  generateAnalyticsResponse,
  generateStreamingAnalyticsResponse,
} from "../services/aiService.js";

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
export const getConversationMessagesController = asyncHandler(
  async (req, res) => {
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
  }
);

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

  /**
   * Generate AI Response
   *
   * Fix 1 — was `analyticsContext: creatorContext` which caused
   * aiService.js to receive undefined for its `creatorContext` param,
   * making the AI respond with "No creator context available."
   */
  const aiResult = await generateAnalyticsResponse({
    creatorContext,
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
 * Stream Chat With AI
 * --------------------------------------------------
 */
export const streamChatWithAIController = asyncHandler(async (req, res) => {
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

  /**
   * SSE Headers
   */
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  /**
   * Disconnect Handling
   * Track if client disconnects mid-stream so we can break early
   * and skip saving an incomplete response to the database.
   */
  let clientDisconnected = false;

  req.on("close", () => {
    clientDisconnected = true;
    console.log("SSE Client Disconnected");
  });

  /**
   * Stream Started
   */
  res.write(`event:start\ndata:Streaming started\n\n`);

  /**
   * Model Event
   * Lets the frontend know which model is responding before chunks arrive.
   */
  res.write(`event:model\ndata:llama-3.3-70b-versatile\n\n`);

  /**
   * Start AI Stream
   */
  let stream;

  try {
    stream = await generateStreamingAnalyticsResponse({
      creatorContext,
      historyMessages,
      latestUserMessage: message,
    });
  } catch (error) {
    res.write(`event:error\ndata:${error.message}\n\n`);
    res.end();
    return;
  }

  let fullResponse = "";

  /**
   * Stream Chunks
   * - Raw content written directly — no JSON.stringify, no extra quotes
   * - Wrapped in try/catch so Groq failures emit an error event instead of hanging
   * - Checks clientDisconnected flag each iteration to break early on close
   */
  try {
    for await (const chunk of stream) {
      if (clientDisconnected) {
        break;
      }

      const content = chunk?.choices?.[0]?.delta?.content;

      if (!content) {
        continue;
      }

      fullResponse += content;

      res.write(`event:chunk\ndata:${content}\n\n`);
    }
  } catch (error) {
    res.write(`event:error\ndata:${error.message}\n\n`);
    res.end();
    return;
  }

  /**
   * Fix 5 — Skip saving if client disconnected mid-stream.
   * Prevents storing a partial response in the database.
   */
  if (clientDisconnected) {
    return;
  }

  /**
   * Save Assistant Message
   * Provider/model hardcoded for SSE V1 (Groq only).
   * Will be replaced when streaming provider fallback is built.
   */
  await saveAssistantMessage({
    conversationId,
    userId: req.user._id,
    content: fullResponse,
    provider: "groq",
    model: "llama-3.3-70b-versatile",
  });

  /**
   * Update Activity
   */
  await updateConversationActivity(conversationId);

  /**
   * Complete
   */
  res.write(`event:complete\ndata:done\n\n`);
  res.end();
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
export const renameConversationController = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { title } = req.body;

  const conversation = await renameConversation({
    conversationId,
    userId: req.user._id,
    title,
  });

  return res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: "Conversation renamed successfully",
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
export const deleteConversationController = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  const conversation = await deleteConversation({
    conversationId,
    userId: req.user._id,
  });

  return res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: "Conversation deleted successfully",
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
export const restoreConversationController = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  const conversation = await restoreConversation({
    conversationId,
    userId: req.user._id,
  });

  return res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: "Conversation restored successfully",
      data: {
        conversation,
      },
    })
  );
});


