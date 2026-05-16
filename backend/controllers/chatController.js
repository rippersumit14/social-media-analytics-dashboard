import SocialAccount from "../models/SocialAccount.js";
import AnalyticsSnapshot from "../models/AnalyticsSnapshot.js";
import User, { PLAN_AI_LIMITS } from "../models/User.js";

import ChatSession from "../models/ChatSession.js";
import ChatMessage from "../models/ChatMessage.js";

import {
  uploadImagesToCloudinary,
  deleteImageFromCloudinary,
} from "../services/cloudinaryStorageService.js";

import {
  generateAnalyticsResponse,
  generateAnalyticsResponseStream,
} from "../services/aiService.js";

/**
 * Chat system hard limits.
 */
const MAX_SESSIONS_PER_ACCOUNT = 20;
const MAX_MESSAGES_PER_SESSION = 100;
const MAX_CONTEXT_MESSAGES = 12;

/**
 * Daily AI usage reset interval.
 */
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

/**
 * Safely delete Cloudinary image.
 *
 * Important:
 * Cleanup should NEVER break
 * main delete flow.
 */
const safeDeleteCloudinaryImage = async (publicId) => {
  try {
    if (!publicId) return;

    await deleteImageFromCloudinary(publicId);
  } catch (error) {
    console.error("[CLOUDINARY_DELETE_ERROR]", {
      publicId,
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Reset AI usage if 24h passed.
 */
const shouldResetAIUsage = (resetDate) => {
  if (!resetDate) return true;

  const lastResetTime = new Date(resetDate).getTime();

  return Date.now() - lastResetTime >= ONE_DAY_IN_MS;
};

/**
 * Prepare usage before AI request.
 */
const prepareAIUsageForRequest = async (user) => {
  const planLimit =
    PLAN_AI_LIMITS[user.plan] || PLAN_AI_LIMITS.FREE;

  user.aiUsageLimit = planLimit;

  if (shouldResetAIUsage(user.aiUsageResetDate)) {
    user.aiUsageCount = 0;
    user.aiUsageResetDate = new Date();
  }

  await user.save();

  return user;
};

/**
 * Build usage object for frontend.
 */
const buildUsageInfo = (user) => {
  return {
    plan: user.plan,
    used: user.aiUsageCount,
    limit: user.aiUsageLimit,
    remaining: Math.max(
      user.aiUsageLimit - user.aiUsageCount,
      0
    ),
    resetDate: user.aiUsageResetDate,
  };
};

/**
 * Generate session title.
 */
const buildSessionTitle = (message) => {
  const clean = message?.replace(/\s+/g, " ").trim();

  if (!clean) return "New Chat";

  return clean.length > 60
    ? `${clean.slice(0, 60)}...`
    : clean;
};

/**
 * Normalize user prompt.
 */
const buildUserMessageText = (message, hasImages) => {
  const cleanMessage = message?.trim() || "";

  if (cleanMessage) return cleanMessage;

  if (hasImages) {
    return "The user uploaded images and wants analysis.";
  }

  return "";
};

/**
 * Keep only latest sessions.
 */
const trimOldSessions = async (
  userId,
  socialAccountId
) => {
  const sessions = await ChatSession.find({
    user: userId,
    socialAccount: socialAccountId,
  })
    .sort({ updatedAt: -1 })
    .select("_id");

  if (sessions.length <= MAX_SESSIONS_PER_ACCOUNT)
    return;

  const sessionsToDelete =
    sessions.slice(MAX_SESSIONS_PER_ACCOUNT);

  const sessionIds = sessionsToDelete.map(
    (session) => session._id
  );

  /**
   * Load images for cleanup.
   */
  const messages = await ChatMessage.find({
    session: { $in: sessionIds },
  }).select("images");

  for (const message of messages) {
    for (const image of message.images || []) {
      await safeDeleteCloudinaryImage(
        image.publicId
      );
    }
  }

  await ChatMessage.deleteMany({
    session: { $in: sessionIds },
  });

  await ChatSession.deleteMany({
    _id: { $in: sessionIds },
  });
};

/**
 * Keep only latest messages.
 */
const trimOldMessages = async (sessionId) => {
  const messages = await ChatMessage.find({
    session: sessionId,
  })
    .sort({ createdAt: 1 });

  if (messages.length <= MAX_MESSAGES_PER_SESSION)
    return;

  const messagesToDelete = messages.slice(
    0,
    messages.length - MAX_MESSAGES_PER_SESSION
  );

  /**
   * Cleanup images.
   */
  for (const message of messagesToDelete) {
    for (const image of message.images || []) {
      await safeDeleteCloudinaryImage(
        image.publicId
      );
    }
  }

  const messageIds = messagesToDelete.map(
    (message) => message._id
  );

  await ChatMessage.deleteMany({
    _id: { $in: messageIds },
  });
};

/**
 * Get or create session.
 */
const getOrCreateChatSession = async ({
  sessionId,
  userId,
  socialAccountId,
  userMessageText,
}) => {
  if (sessionId) {
    return ChatSession.findOne({
      _id: sessionId,
      user: userId,
      socialAccount: socialAccountId,
    });
  }

  const session = await ChatSession.create({
    user: userId,
    socialAccount: socialAccountId,
    title: buildSessionTitle(userMessageText),
  });

  await trimOldSessions(userId, socialAccountId);

  return session;
};

/**
 * Load recent messages for AI context.
 */
const buildHistoryMessages = async (sessionId) => {
  const messages = await ChatMessage.find({
    session: sessionId,
  })
    .sort({ createdAt: -1 })
    .limit(MAX_CONTEXT_MESSAGES)
    .lean();

  return messages.reverse().map((msg) => ({
    role: msg.role,
    content: msg.content,
    images:
      msg.images?.map((img) => img.imageUrl) || [],
  }));
};

/**
 * Build analytics-aware AI context.
 */
const buildAnalyticsContext = (
  socialAccount,
  snapshots
) => {
  const latest =
    snapshots[snapshots.length - 1] || null;

  if (!latest) {
    return `
Account username: ${socialAccount.username}
Platform: ${socialAccount.platform}

No analytics data available yet.
`;
  }

  return `
Account username: ${socialAccount.username}
Platform: ${socialAccount.platform}

Latest analytics:
- Followers: ${latest.followers}
- Following: ${latest.following}
- Posts: ${latest.posts}
- Engagement Rate: ${latest.engagementRate}
`;
};

/**
 * Save assistant response.
 */
const finalizeAIResponse = async ({
  user,
  activeSession,
  userId,
  socialAccountId,
  aiResult,
}) => {
  await ChatMessage.create({
    session: activeSession._id,
    user: userId,
    socialAccount: socialAccountId,
    role: "assistant",
    content: aiResult.reply,
    model: aiResult.modelUsed,
    latencyMs: aiResult.latencyMs,
  });

  activeSession.selectedModel =
    aiResult.modelUsed;

  activeSession.updatedAt = new Date();

  await activeSession.save();

  await trimOldMessages(activeSession._id);

  user.aiUsageCount += 1;

  await user.save();

  return aiResult.reply;
};

/**
 * Normal AI chat endpoint.
 */
export const chatWithAI = async (req, res) => {
  try {
    const { socialAccountId } = req.params;

    const { message, sessionId } = req.body;

    const userId = req.user._id;

    /**
     * Multiple uploaded files.
     */
    const uploadedFiles = req.files || [];

    const hasImages = uploadedFiles.length > 0;

    const userMessageText =
      buildUserMessageText(
        message,
        hasImages
      );

    if (!userMessageText && !hasImages) {
      return res.status(400).json({
        success: false,
        message:
          "Message or at least one image is required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await prepareAIUsageForRequest(user);

    const usageInfo = buildUsageInfo(user);

    if (usageInfo.remaining <= 0) {
      return res.status(403).json({
        success: false,
        message:
          "Daily AI usage limit reached",
        usage: usageInfo,
      });
    }

    const socialAccount =
      await SocialAccount.findOne({
        _id: socialAccountId,
        user: userId,
      });

    if (!socialAccount) {
      return res.status(404).json({
        success: false,
        message:
          "Social account not found or unauthorized",
      });
    }

    const activeSession =
      await getOrCreateChatSession({
        sessionId,
        userId,
        socialAccountId,
        userMessageText,
      });

    /**
     * Upload optimized images.
     */
    const uploadedImages =
      await uploadImagesToCloudinary(
        uploadedFiles
      );

    /**
     * Convert images to base64 for AI.
     */
    const imageBase64List =
      uploadedFiles.map((file) =>
        file.buffer.toString("base64")
      );

    const imageMimeTypes =
      uploadedFiles.map(
        (file) => file.mimetype
      );

    /**
     * Save user message.
     */
    const userMessage =
      await ChatMessage.create({
        session: activeSession._id,
        user: userId,
        socialAccount: socialAccountId,
        role: "user",
        content: userMessageText,
        images: uploadedImages,
      });

    const historyMessages =
      await buildHistoryMessages(
        activeSession._id
      );

    const snapshots =
      await AnalyticsSnapshot.find({
        socialAccount: socialAccountId,
      }).sort({ capturedAt: 1 });

    const analyticsContext =
      buildAnalyticsContext(
        socialAccount,
        snapshots
      );

    /**
     * Generate AI response.
     */
    const aiResult =
      await generateAnalyticsResponse({
        analyticsContext,
        historyMessages,
        latestUserMessage:
          userMessageText,
        imageBase64List,
        imageMimeTypes,
        preferredModelId:
          activeSession.selectedModel,
      });

    const aiReply =
      await finalizeAIResponse({
        user,
        activeSession,
        userId,
        socialAccountId,
        aiResult,
      });

    return res.status(200).json({
      success: true,
      reply: aiReply,
      sessionId: activeSession._id,
      sessionTitle: activeSession.title,
      userMessage,
      modelUsed: aiResult.modelUsed,
      modelName: aiResult.modelName,
      latencyMs: aiResult.latencyMs,
      usage: buildUsageInfo(user),
    });
  } catch (error) {
    console.error("[CHAT_WITH_AI_ERROR]", {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "AI request failed",
    });
  }
};

/**
 * Streaming AI chat endpoint.
 */
export const chatWithAIStream =
  async (req, res) => {
    try {
      /**
       * You can later reuse
       * same multi-image logic here.
       */

      return res.status(501).json({
        success: false,
        message:
          "Streaming upgrade pending for multi-image support",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          "Streaming AI failed",
      });
    }
  };

/**
 * Get all sessions.
 */
export const getChatSessions =
  async (req, res) => {
    try {
      const { socialAccountId } =
        req.params;

      const userId = req.user._id;

      const sessions =
        await ChatSession.find({
          user: userId,
          socialAccount:
            socialAccountId,
        })
          .sort({ updatedAt: -1 })
          .lean();

      return res.status(200).json({
        success: true,
        sessions,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch sessions",
      });
    }
  };

/**
 * Get session messages.
 */
export const getSessionMessages =
  async (req, res) => {
    try {
      const { sessionId } =
        req.params;

      const userId = req.user._id;

      const messages =
        await ChatMessage.find({
          session: sessionId,
          user: userId,
        }).sort({ createdAt: 1 });

      return res.status(200).json({
        success: true,
        messages,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          "Failed to load messages",
      });
    }
  };

/**
 * Rename session.
 */
export const renameChatSession =
  async (req, res) => {
    try {
      const { sessionId } =
        req.params;

      const { title } = req.body;

      const userId = req.user._id;

      const session =
        await ChatSession.findOneAndUpdate(
          {
            _id: sessionId,
            user: userId,
          },
          {
            title,
          },
          {
            new: true,
          }
        );

      return res.status(200).json({
        success: true,
        session,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          "Failed to rename session",
      });
    }
  };

/**
 * Delete session and cleanup images.
 */
export const deleteChatSession =
  async (req, res) => {
    try {
      const { sessionId } =
        req.params;

      const userId = req.user._id;

      const messages =
        await ChatMessage.find({
          session: sessionId,
          user: userId,
        });

      /**
       * Cleanup cloud images.
       */
      for (const message of messages) {
        for (const image of message.images ||
          []) {
          await safeDeleteCloudinaryImage(
            image.publicId
          );
        }
      }

      await ChatMessage.deleteMany({
        session: sessionId,
        user: userId,
      });

      await ChatSession.deleteOne({
        _id: sessionId,
        user: userId,
      });

      return res.status(200).json({
        success: true,
        message:
          "Chat session deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          "Failed to delete session",
      });
    }
  };