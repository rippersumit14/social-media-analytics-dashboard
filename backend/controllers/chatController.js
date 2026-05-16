import SocialAccount from "../models/SocialAccount.js";
import AnalyticsSnapshot from "../models/AnalyticsSnapshot.js";
import User, { PLAN_AI_LIMITS } from "../models/User.js";
import ChatSession from "../models/ChatSession.js";
import ChatMessage from "../models/ChatMessage.js";

import {
  generateAnalyticsResponse,
  generateAnalyticsResponseStream,
} from "../services/aiService.js";

import { uploadImageToCloudinary } from "../services/cloudinaryStorageService.js";

// Hard limits for chat system
const MAX_SESSIONS_PER_ACCOUNT = 20;
const MAX_MESSAGES_PER_SESSION = 100;
const MAX_CONTEXT_MESSAGES = 12;

// Daily AI usage reset window
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

// Upload image if provided in request
const handleOptionalImageUpload = async (file) => {
  if (!file) {
    return null;
  }

  const uploadedImage = await uploadImageToCloudinary(file);
  return uploadedImage;
};

// Check if user's AI usage should reset based on time
const shouldResetAIUsage = (resetDate) => {
  if (!resetDate) return true;

  const lastResetTime = new Date(resetDate).getTime();
  return Date.now() - lastResetTime >= ONE_DAY_IN_MS;
};

// Prepare user's daily AI usage before each AI request
const prepareAIUsageForRequest = async (user) => {
  const planLimit = PLAN_AI_LIMITS[user.plan] || PLAN_AI_LIMITS.FREE;

  user.aiUsageLimit = planLimit;

  if (shouldResetAIUsage(user.aiUsageResetDate)) {
    user.aiUsageCount = 0;
    user.aiUsageResetDate = new Date();
  }

  await user.save();
  return user;
};

// Build usage object for frontend UI
const buildUsageInfo = (user) => {
  return {
    plan: user.plan,
    used: user.aiUsageCount,
    limit: user.aiUsageLimit,
    remaining: Math.max(user.aiUsageLimit - user.aiUsageCount, 0),
    resetDate: user.aiUsageResetDate,
  };
};

// Generate readable session title from first message
const buildSessionTitle = (message) => {
  const clean = message?.replace(/\s+/g, " ").trim();

  if (!clean) return "New Chat";

  return clean.length > 60 ? `${clean.slice(0, 60)}...` : clean;
};

// Normalize user message (text-only, image-only, or image + text)
const buildUserMessageText = (message, hasImage) => {
  const cleanMessage = message?.trim() || "";

  if (cleanMessage) return cleanMessage;

  if (hasImage) {
    return "The user uploaded an image and wants analysis.";
  }

  return "";
};

// Keep only latest 20 sessions per account
const trimOldSessions = async (userId, socialAccountId) => {
  const sessions = await ChatSession.find({
    user: userId,
    socialAccount: socialAccountId,
  })
    .sort({ updatedAt: -1 })
    .select("_id");

  if (sessions.length <= MAX_SESSIONS_PER_ACCOUNT) return;

  const sessionsToDelete = sessions.slice(MAX_SESSIONS_PER_ACCOUNT);
  const sessionIdsToDelete = sessionsToDelete.map((session) => session._id);

  await ChatMessage.deleteMany({
    session: { $in: sessionIdsToDelete },
  });

  await ChatSession.deleteMany({
    _id: { $in: sessionIdsToDelete },
  });
};

// Keep only latest 100 messages per session
const trimOldMessages = async (sessionId) => {
  const messages = await ChatMessage.find({
    session: sessionId,
  })
    .sort({ createdAt: 1 })
    .select("_id");

  if (messages.length <= MAX_MESSAGES_PER_SESSION) return;

  const messagesToDelete = messages.slice(
    0,
    messages.length - MAX_MESSAGES_PER_SESSION
  );

  const messageIdsToDelete = messagesToDelete.map((message) => message._id);

  await ChatMessage.deleteMany({
    _id: { $in: messageIdsToDelete },
  });
};

// Get existing session or create new one
const getOrCreateChatSession = async ({
  sessionId,
  userId,
  socialAccountId,
  userMessageText,
}) => {
  if (sessionId) {
    const existingSession = await ChatSession.findOne({
      _id: sessionId,
      user: userId,
      socialAccount: socialAccountId,
    });

    return existingSession;
  }

  const newSession = await ChatSession.create({
    user: userId,
    socialAccount: socialAccountId,
    title: buildSessionTitle(userMessageText),
    selectedModel: null,
  });

  await trimOldSessions(userId, socialAccountId);
  return newSession;
};

// Load recent messages and convert them into AI chat format
const buildHistoryMessages = async (sessionId) => {
  const recentMessages = await ChatMessage.find({
    session: sessionId,
  })
    .sort({ createdAt: -1 })
    .limit(MAX_CONTEXT_MESSAGES)
    .lean();

  return recentMessages.reverse().map((msg) => ({
    role: msg.role,
    content: msg.content,
    imageUrl: msg.image?.imageUrl || null,
  }));
};

// Build analytics-aware AI context
const buildAnalyticsContext = (socialAccount, snapshots) => {
  const first = snapshots[0] || null;
  const latest = snapshots[snapshots.length - 1] || null;

  if (!first || !latest) {
    return `
Account information:
- Username: ${socialAccount.username}
- Platform: ${socialAccount.platform}

Analytics availability:
- No detailed analytics snapshots are available yet.
- Use general social media expertise where helpful.
- If user asks about performance, mention that better insights require synced analytics.
`;
  }

  return `
Account information:
- Username: ${socialAccount.username}
- Platform: ${socialAccount.platform}

Analytics context:
First snapshot:
- Followers: ${first.followers}
- Following: ${first.following}
- Posts: ${first.posts}
- Likes: ${first.likes}
- Comments: ${first.comments}
- Engagement Rate: ${first.engagementRate}
- Impressions: ${first.impressions}
- Reach: ${first.reach}

Latest snapshot:
- Followers: ${latest.followers}
- Following: ${latest.following}
- Posts: ${latest.posts}
- Likes: ${latest.likes}
- Comments: ${latest.comments}
- Engagement Rate: ${latest.engagementRate}
- Impressions: ${latest.impressions}
- Reach: ${latest.reach}

Change summary:
- Follower change: ${(latest.followers ?? 0) - (first.followers ?? 0)}
- Engagement rate change: ${(
    (latest.engagementRate ?? 0) - (first.engagementRate ?? 0)
  ).toFixed(2)}
- Post change: ${(latest.posts ?? 0) - (first.posts ?? 0)}
- Likes change: ${(latest.likes ?? 0) - (first.likes ?? 0)}
- Comments change: ${(latest.comments ?? 0) - (first.comments ?? 0)}
`;
};

// Save assistant response and finalize session
const finalizeAIResponse = async ({
  user,
  activeSession,
  userId,
  socialAccountId,
  aiResult,
}) => {
  const aiReply = aiResult.reply;

  await ChatMessage.create({
    session: activeSession._id,
    user: userId,
    socialAccount: socialAccountId,
    role: "assistant",
    content: aiReply,
    model: aiResult.modelUsed,
    latencyMs: aiResult.latencyMs,
  });

  // Persist preferred model
  if (aiResult.modelUsed) {
    activeSession.selectedModel = aiResult.modelUsed;
  }

  activeSession.updatedAt = new Date();
  await activeSession.save();
  await trimOldMessages(activeSession._id);

  // Count usage only for successful responses
  const isAISuccess =
    aiReply &&
    !aiResult.failed &&
    !aiReply.includes("AI is currently busy");

  if (isAISuccess) {
    user.aiUsageCount += 1;
    await user.save();
  }

  return {
    aiReply,
    isAISuccess,
  };
};

// Normal AI chat endpoint
export const chatWithAI = async (req, res) => {
  try {
    const { socialAccountId } = req.params;
    const { message, sessionId } = req.body || {};
    const userId = req.user._id;

    // Get uploaded file
    const uploadedFile = req.file || null;
    const hasImage = Boolean(uploadedFile);

    // Normalize user prompt
    const userMessageText = buildUserMessageText(message, hasImage);

    // Validate empty request
    if (!userMessageText && !hasImage) {
      return res.status(400).json({
        success: false,
        message: "Message or image is required",
      });
    }

    // Load current user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prepare AI usage counters
    await prepareAIUsageForRequest(user);
    const usageInfoBeforeAI = buildUsageInfo(user);

    // Validate usage limits
    if (usageInfoBeforeAI.remaining <= 0) {
      return res.status(403).json({
        success: false,
        message:
          "Daily AI usage limit reached. Please try again after reset or upgrade your plan.",
        usage: usageInfoBeforeAI,
      });
    }

    // Validate social account ownership
    const socialAccount = await SocialAccount.findOne({
      _id: socialAccountId,
      user: userId,
    });

    if (!socialAccount) {
      return res.status(404).json({
        success: false,
        message: "Social account not found or not authorized",
      });
    }

    // Get existing session or create new session
    const activeSession = await getOrCreateChatSession({
      sessionId,
      userId,
      socialAccountId,
      userMessageText,
    });

    if (!activeSession) {
      return res.status(404).json({
        success: false,
        message: "Chat session not found",
      });
    }

    // Upload image to Cloudinary
    const uploadedImage = await handleOptionalImageUpload(uploadedFile);

    // Base64 image for vision AI models
    const imageBase64 = uploadedFile
      ? uploadedFile.buffer.toString("base64")
      : null;

    const imageMimeType = uploadedFile?.mimetype || null;

    // Save user message
    const userMessage = await ChatMessage.create({
      session: activeSession._id,
      user: userId,
      socialAccount: socialAccountId,
      role: "user",
      content: userMessageText,
      image: uploadedImage || undefined,
    });

    // Load recent history
    const historyMessages = await buildHistoryMessages(activeSession._id);

    // Load analytics snapshots
    const snapshots = await AnalyticsSnapshot.find({
      socialAccount: socialAccountId,
    }).sort({ capturedAt: 1 });

    // Build analytics-aware prompt context
    const analyticsContext = buildAnalyticsContext(socialAccount, snapshots);

    // Generate AI response
    const aiResult = await generateAnalyticsResponse({
      analyticsContext,
      historyMessages,
      latestUserMessage: userMessageText,
      imageBase64,
      imageMimeType,
      preferredModelId: activeSession.selectedModel,
    });

    // Save assistant response
    const { aiReply } = await finalizeAIResponse({
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
      remainingUsage: Math.max(
        user.aiUsageLimit - user.aiUsageCount,
        0
      ),
    });
  } catch (error) {
    console.error("[CHAT_WITH_AI_ERROR]", {
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode,
      details: error.details,
      timestamp: new Date().toISOString(),
    });

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.message || "AI is currently busy, please try again",
    });
  }
};

// Streaming AI chat using SSE
export const chatWithAIStream = async (req, res) => {
  try {
    const { socialAccountId } = req.params;
    const { message, sessionId } = req.body || {};
    const userId = req.user._id;

    // Get uploaded file
    const uploadedFile = req.file || null;
    const hasImage = Boolean(uploadedFile);

    // Normalize user message
    const userMessageText = buildUserMessageText(message, hasImage);

    if (!userMessageText && !hasImage) {
      return res.status(400).json({
        success: false,
        message: "Message or image is required",
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
    const usageInfoBeforeAI = buildUsageInfo(user);

    if (usageInfoBeforeAI.remaining <= 0) {
      return res.status(403).json({
        success: false,
        message:
          "Daily AI usage limit reached. Please try again after reset or upgrade your plan.",
        usage: usageInfoBeforeAI,
      });
    }

    const socialAccount = await SocialAccount.findOne({
      _id: socialAccountId,
      user: userId,
    });

    if (!socialAccount) {
      return res.status(404).json({
        success: false,
        message: "Social account not found or not authorized",
      });
    }

    const activeSession = await getOrCreateChatSession({
      sessionId,
      userId,
      socialAccountId,
      userMessageText,
    });

    if (!activeSession) {
      return res.status(404).json({
        success: false,
        message: "Chat session not found",
      });
    }

    // Upload image to Cloudinary
    const uploadedImage = await handleOptionalImageUpload(uploadedFile);

    // Base64 image for AI processing
    const imageBase64 = uploadedFile
      ? uploadedFile.buffer.toString("base64")
      : null;

    const imageMimeType = uploadedFile?.mimetype || null;

    // Save user message
    const userMessage = await ChatMessage.create({
      session: activeSession._id,
      user: userId,
      socialAccount: socialAccountId,
      role: "user",
      content: userMessageText,
      image: uploadedImage || undefined,
    });

    // Load history context
    const historyMessages = await buildHistoryMessages(activeSession._id);

    // Load analytics snapshots
    const snapshots = await AnalyticsSnapshot.find({
      socialAccount: socialAccountId,
    }).sort({ capturedAt: 1 });

    const analyticsContext = buildAnalyticsContext(socialAccount, snapshots);

    // Start SSE stream
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    res.flushHeaders?.();

    // Helper for sending SSE events
    const sendEvent = (event, data) => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Send session metadata
    sendEvent("session", {
      sessionId: activeSession._id,
      sessionTitle: activeSession.title,
    });

    // Send user message immediately
    sendEvent("userMessage", {
      message: userMessage,
    });

    // Generate streaming AI response
    const aiResult = await generateAnalyticsResponseStream({
      analyticsContext,
      historyMessages,
      latestUserMessage: userMessageText,
      imageBase64,
      imageMimeType,
      preferredModelId: activeSession.selectedModel,

      // Notify selected model
      onModelSelected: (modelInfo) => {
        sendEvent("model", modelInfo);
      },

      // Stream token chunks
      onChunk: (chunk) => {
        sendEvent("chunk", { chunk });
      },
    });

    // Finalize AI response
    const { aiReply } = await finalizeAIResponse({
      user,
      activeSession,
      userId,
      socialAccountId,
      aiResult,
    });

    // Final SSE completion event
    sendEvent("done", {
      success: true,
      reply: aiReply,
      sessionId: activeSession._id,
      sessionTitle: activeSession.title,
      modelUsed: aiResult.modelUsed,
      modelName: aiResult.modelName,
      latencyMs: aiResult.latencyMs,
      usage: buildUsageInfo(user),
      remainingUsage: Math.max(
        user.aiUsageLimit - user.aiUsageCount,
        0
      ),
    });

    res.end();
  } catch (error) {
    console.error("[CHAT_WITH_AI_STREAM_ERROR]", {
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode,
      details: error.details,
      timestamp: new Date().toISOString(),
    });

    if (!res.headersSent) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message:
          error.message || "AI is currently busy, please try again",
      });
    }

    res.write("event: error\n");
    res.write(
      `data: ${JSON.stringify({
        message:
          error.message || "AI is currently busy, please try again",
      })}\n\n`
    );

    res.end();
  }
};

// Get all chat sessions
export const getChatSessions = async (req, res) => {
  try {
    const { socialAccountId } = req.params;
    const userId = req.user._id;

    const sessions = await ChatSession.find({
      user: userId,
      socialAccount: socialAccountId,
    })
      .sort({ updatedAt: -1 })
      .limit(MAX_SESSIONS_PER_ACCOUNT)
      .lean();

    const sessionIds = sessions.map((session) => session._id);

    const lastMessages = await ChatMessage.aggregate([
      {
        $match: {
          session: { $in: sessionIds },
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $group: {
          _id: "$session",
          lastMessage: { $first: "$content" },
        },
      },
    ]);

    const lastMessageMap = {};

    lastMessages.forEach((message) => {
      lastMessageMap[message._id.toString()] = message.lastMessage;
    });

    const formattedSessions = sessions.map((session) => ({
      sessionId: session._id,
      title: session.title,
      lastMessagePreview:
        lastMessageMap[session._id.toString()]?.slice(0, 80) || "",
      selectedModel: session.selectedModel || null,
      updatedAt: session.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      sessions: formattedSessions,
    });
  } catch (error) {
    console.error("[GET_CHAT_SESSIONS_ERROR]", {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    return res.status(500).json({
      success: false,
      message: "Failed to load chat sessions",
    });
  }
};

// Get session messages
export const getSessionMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    const session = await ChatSession.findOne({
      _id: sessionId,
      user: userId,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Chat session not found",
      });
    }

    const messages = await ChatMessage.find({
      session: sessionId,
      user: userId,
    })
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      session: {
        sessionId: session._id,
        title: session.title,
        selectedModel: session.selectedModel || null,
      },
      messages,
    });
  } catch (error) {
    console.error("[GET_SESSION_MESSAGES_ERROR]", {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    return res.status(500).json({
      success: false,
      message: "Failed to load session messages",
    });
  }
};

// Rename chat session
export const renameChatSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { title } = req.body;
    const userId = req.user._id;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Session title is required",
      });
    }

    const session = await ChatSession.findOneAndUpdate(
      {
        _id: sessionId,
        user: userId,
      },
      {
        title: title.trim(),
      },
      {
        returnDocument: "after",
      }
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Chat session not found",
      });
    }

    return res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    console.error("[RENAME_CHAT_SESSION_ERROR]", {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    return res.status(500).json({
      success: false,
      message: "Failed to rename chat session",
    });
  }
};

// Delete chat session
export const deleteChatSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    const session = await ChatSession.findOne({
      _id: sessionId,
      user: userId,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Chat session not found",
      });
    }

    // Load session images for future cleanup
    await ChatMessage.find({
      session: sessionId,
      user: userId,
    }).select("image.publicId");

    // Delete all session messages
    await ChatMessage.deleteMany({
      session: sessionId,
      user: userId,
    });

    // Delete session
    await ChatSession.deleteOne({
      _id: sessionId,
      user: userId,
    });

    return res.status(200).json({
      success: true,
      message: "Chat session deleted successfully",
    });
  } catch (error) {
    console.error("[DELETE_CHAT_SESSION_ERROR]", {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    return res.status(500).json({
      success: false,
      message: "Failed to delete chat session",
    });
  }
};