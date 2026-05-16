import SocialAccount from "../models/SocialAccount.js";
import AnalyticsSnapshot from "../models/AnalyticsSnapshot.js";
import User, { PLAN_AI_LIMITS } from "../models/User.js";
import ChatSession from "../models/ChatSession.js";
import ChatMessage from "../models/ChatMessage.js";
import {
  generateAnalyticsResponse,
  generateAnalyticsResponseStream,
} from "../services/aiService.js";

/**
 * Hard limits for SaaS-style chat history.
 */
const MAX_SESSIONS_PER_ACCOUNT = 20;
const MAX_MESSAGES_PER_SESSION = 100;
const MAX_CONTEXT_MESSAGES = 12;

/**
 * Daily usage reset window.
 */
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

/**
 * Check if user's AI usage should reset.
 */
const shouldResetAIUsage = (resetDate) => {
  if (!resetDate) return true;

  const lastResetTime = new Date(resetDate).getTime();
  return Date.now() - lastResetTime >= ONE_DAY_IN_MS;
};

/**
 * Prepare user's daily AI usage before each AI request.
 */
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

/**
 * Build usage object for frontend UI.
 */
const buildUsageInfo = (user) => {
  return {
    plan: user.plan,
    used: user.aiUsageCount,
    limit: user.aiUsageLimit,
    remaining: Math.max(user.aiUsageLimit - user.aiUsageCount, 0),
    resetDate: user.aiUsageResetDate,
  };
};

/**
 * Generate a readable session title from first message.
 */
const buildSessionTitle = (message) => {
  const clean = message?.replace(/\s+/g, " ").trim();

  if (!clean) return "New Chat";

  return clean.length > 60 ? `${clean.slice(0, 60)}...` : clean;
};

/**
 * Normalize user message for text-only, image-only, and text+image requests.
 */
const buildUserMessageText = (message, hasImage) => {
  const cleanMessage = message?.trim() || "";

  if (cleanMessage) return cleanMessage;

  if (hasImage) return "The user uploaded an image and wants analysis.";

  return "";
};

/**
 * Build social-account analytics context for the AI prompt.
 */
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

/**
 * Keep only the latest 20 sessions for a user/account.
 */
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

/**
 * Keep only the latest 100 messages in one session.
 */
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

/**
 * Get existing session or create a new one.
 */
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

/**
 * Load recent messages and convert them into OpenAI/OpenRouter chat format.
 */
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
  }));
};

/**
 * Save assistant reply, session model, usage, and cleanup.
 */
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
  });

  if (aiResult.modelUsed) {
    activeSession.selectedModel = aiResult.modelUsed;
  }

  activeSession.updatedAt = new Date();
  await activeSession.save();

  await trimOldMessages(activeSession._id);

  const isAISuccess =
    aiReply && !aiResult.failed && !aiReply.includes("AI is currently busy");

  if (isAISuccess) {
    user.aiUsageCount += 1;
    await user.save();
  }

  return {
    aiReply,
    isAISuccess,
  };
};

/**
 * @desc    Normal non-streaming AI chat
 * @route   POST /api/ai/chat/:socialAccountId
 * @access  Private
 */
export const chatWithAI = async (req, res) => {
  try {
    const { socialAccountId } = req.params;
    const { message, sessionId } = req.body || {};
    const userId = req.user._id;

    const uploadedImage = req.file || null;
    const hasImage = Boolean(uploadedImage);
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

    const imageBase64 = uploadedImage
      ? uploadedImage.buffer.toString("base64")
      : null;

    const imageMimeType = uploadedImage?.mimetype || null;

    await ChatMessage.create({
      session: activeSession._id,
      user: userId,
      socialAccount: socialAccountId,
      role: "user",
      content: userMessageText,
      imageUrl: null,
    });

    const historyMessages = await buildHistoryMessages(activeSession._id);

    const snapshots = await AnalyticsSnapshot.find({
      socialAccount: socialAccountId,
    }).sort({ capturedAt: 1 });

    const analyticsContext = buildAnalyticsContext(socialAccount, snapshots);

    const aiResult = await generateAnalyticsResponse({
      analyticsContext,
      historyMessages,
      latestUserMessage: userMessageText,
      imageBase64,
      imageMimeType,
      preferredModelId: activeSession.selectedModel,
    });

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
      modelUsed: aiResult.modelUsed,
      modelName: aiResult.modelName,
      latencyMs: aiResult.latencyMs,
      usage: buildUsageInfo(user),
      remainingUsage: Math.max(user.aiUsageLimit - user.aiUsageCount, 0),
    });
  } catch (error) {
    console.error("[CHAT_WITH_AI_ERROR]", {
      message: error.message,
      timestamp: new Date().toISOString(),
    });

    return res.status(500).json({
      success: false,
      message: "AI is currently busy, please try again",
    });
  }
};

/**
 * @desc    Streaming AI chat using Server-Sent Events
 * @route   POST /api/ai/chat/:socialAccountId/stream
 * @access  Private
 */
export const chatWithAIStream = async (req, res) => {
  try {
    const { socialAccountId } = req.params;
    const { message, sessionId } = req.body || {};
    const userId = req.user._id;

    const uploadedImage = req.file || null;
    const hasImage = Boolean(uploadedImage);
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

    const imageBase64 = uploadedImage
      ? uploadedImage.buffer.toString("base64")
      : null;

    const imageMimeType = uploadedImage?.mimetype || null;

    await ChatMessage.create({
      session: activeSession._id,
      user: userId,
      socialAccount: socialAccountId,
      role: "user",
      content: userMessageText,
      imageUrl: null,
    });

    const historyMessages = await buildHistoryMessages(activeSession._id);

    const snapshots = await AnalyticsSnapshot.find({
      socialAccount: socialAccountId,
    }).sort({ capturedAt: 1 });

    const analyticsContext = buildAnalyticsContext(socialAccount, snapshots);

    /**
     * Start Server-Sent Events stream.
     */
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    /**
     * Send one SSE event block to frontend.
     */
    const sendEvent = (event, data) => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    sendEvent("session", {
      sessionId: activeSession._id,
      sessionTitle: activeSession.title,
    });

    const aiResult = await generateAnalyticsResponseStream({
      analyticsContext,
      historyMessages,
      latestUserMessage: userMessageText,
      imageBase64,
      imageMimeType,
      preferredModelId: activeSession.selectedModel,

      onModelSelected: (modelInfo) => {
        sendEvent("model", modelInfo);
      },

      onChunk: (chunk) => {
        sendEvent("chunk", { chunk });
      },
    });

    const { aiReply } = await finalizeAIResponse({
      user,
      activeSession,
      userId,
      socialAccountId,
      aiResult,
    });

    sendEvent("done", {
      success: true,
      reply: aiReply,
      sessionId: activeSession._id,
      sessionTitle: activeSession.title,
      modelUsed: aiResult.modelUsed,
      modelName: aiResult.modelName,
      latencyMs: aiResult.latencyMs,
      usage: buildUsageInfo(user),
      remainingUsage: Math.max(user.aiUsageLimit - user.aiUsageCount, 0),
    });

    res.end();
  } catch (error) {
    console.error("[CHAT_WITH_AI_STREAM_ERROR]", {
      message: error.message,
      timestamp: new Date().toISOString(),
    });

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "AI is currently busy, please try again",
      });
    }

    res.write("event: error\n");
    res.write(
      `data: ${JSON.stringify({
        message: "AI is currently busy, please try again",
      })}\n\n`
    );
    res.end();
  }
};

/**
 * @desc    Get all chat sessions for selected social account
 * @route   GET /api/ai/chat/sessions/:socialAccountId
 * @access  Private
 */
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
      timestamp: new Date().toISOString(),
    });

    return res.status(500).json({
      success: false,
      message: "Failed to load chat sessions",
    });
  }
};

/**
 * @desc    Get all messages of selected chat session
 * @route   GET /api/ai/chat/session/:sessionId/messages
 * @access  Private
 */
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
      timestamp: new Date().toISOString(),
    });

    return res.status(500).json({
      success: false,
      message: "Failed to load session messages",
    });
  }
};

/**
 * @desc    Rename chat session
 * @route   PATCH /api/ai/chat/session/:sessionId
 * @access  Private
 */
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
      timestamp: new Date().toISOString(),
    });

    return res.status(500).json({
      success: false,
      message: "Failed to rename chat session",
    });
  }
};

/**
 * @desc    Delete chat session and its messages
 * @route   DELETE /api/ai/chat/session/:sessionId
 * @access  Private
 */
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
      message: "Chat session deleted successfully",
    });
  } catch (error) {
    console.error("[DELETE_CHAT_SESSION_ERROR]", {
      message: error.message,
      timestamp: new Date().toISOString(),
    });

    return res.status(500).json({
      success: false,
      message: "Failed to delete chat session",
    });
  }
};