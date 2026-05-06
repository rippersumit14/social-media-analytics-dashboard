import SocialAccount from "../models/SocialAccount.js";
import AnalyticsSnapshot from "../models/AnalyticsSnapshot.js";
import User, { PLAN_AI_LIMITS } from "../models/User.js";
import { generateAnalyticsResponse } from "../services/aiService.js";
import ChatSession from "../models/ChatSession.js";
import ChatMessage from "../models/ChatMessage.js";

/**
 * Chat Controller
 *
 * Handles:
 * - AI chat requests
 * - text-only messages
 * - image-only messages
 * - text + image messages
 * - chat session storage
 * - chat message storage
 * - analytics context injection
 * - daily AI usage enforcement
 */

// ---------- Chat Limits ----------
const MAX_SESSIONS_PER_ACCOUNT = 20;
const MAX_MESSAGES_PER_SESSION = 100;
const MAX_CONTEXT_MESSAGES = 12;

// ---------- Usage Limits ----------
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

/**
 * Checks if daily AI usage should reset.
 */
const shouldResetAIUsage = (resetDate) => {
  if (!resetDate) return true;

  const lastResetTime = new Date(resetDate).getTime();
  const now = Date.now();

  return now - lastResetTime >= ONE_DAY_IN_MS;
};

/**
 * Syncs user AI usage limit with plan and resets daily count if needed.
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
 * Builds frontend-friendly usage response.
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
 * Creates readable session title from first user message.
 */
const buildSessionTitle = (message) => {
  const clean = message?.replace(/\s+/g, " ").trim();

  if (!clean) return "New Chat";

  return clean.length > 60 ? `${clean.slice(0, 60)}...` : clean;
};

/**
 * Builds safe user message text for text/image chats.
 */
const buildUserMessageText = (message, hasImage) => {
  const cleanMessage = message?.trim() || "";

  if (cleanMessage) return cleanMessage;

  if (hasImage) return "The user uploaded an image and wants analysis.";

  return "";
};

/**
 * Builds analytics context for AI prompt.
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
- If the user asks about performance, mention that more accurate insights require synced analytics.
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
 * Deletes old sessions if user has more than allowed sessions per account.
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
 * Deletes old messages if session has more than allowed messages.
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
 * @desc    AI assistant chat for analytics + strategy
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

    /**
     * Allow:
     * - text-only
     * - image-only
     * - text + image
     */
    if (!userMessageText && !hasImage) {
      return res.status(400).json({
        success: false,
        message: "Message or image is required",
      });
    }

    /**
     * Check authenticated user.
     */
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    /**
     * Prepare usage before AI call.
     */
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

    /**
     * Ensure selected social account belongs to logged-in user.
     */
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

    /**
     * Find existing session or create new session.
     */
    let activeSession;

    if (sessionId) {
      activeSession = await ChatSession.findOne({
        _id: sessionId,
        user: userId,
        socialAccount: socialAccountId,
      });

      if (!activeSession) {
        return res.status(404).json({
          success: false,
          message: "Chat session not found",
        });
      }
    } else {
      activeSession = await ChatSession.create({
        user: userId,
        socialAccount: socialAccountId,
        title: buildSessionTitle(userMessageText),
      });

      await trimOldSessions(userId, socialAccountId);
    }

    /**
     * Prepare image for AI vision model.
     */
    const imageBase64 = uploadedImage
      ? uploadedImage.buffer.toString("base64")
      : null;

    const imageMimeType = uploadedImage?.mimetype || null;

    /**
     * Save user message.
     */
    await ChatMessage.create({
      session: activeSession._id,
      user: userId,
      socialAccount: socialAccountId,
      role: "user",
      content: userMessageText,
      imageUrl: null,
    });

    /**
     * Load recent chat history for AI continuity.
     */
    const recentMessages = await ChatMessage.find({
      session: activeSession._id,
    })
      .sort({ createdAt: -1 })
      .limit(MAX_CONTEXT_MESSAGES)
      .lean();

    const historyMessages = recentMessages.reverse().map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    /**
     * Load analytics snapshots for context-aware replies.
     */
    const snapshots = await AnalyticsSnapshot.find({
      socialAccount: socialAccountId,
    }).sort({ capturedAt: 1 });

    const analyticsContext = buildAnalyticsContext(socialAccount, snapshots);

    /**
     * Generate AI reply.
     * Retry, fallback, and provider reliability are handled inside aiService.js.
     */
    const aiReply = await generateAnalyticsResponse({
      analyticsContext,
      historyMessages,
      latestUserMessage: userMessageText,
      imageBase64,
      imageMimeType,
    });

    const isAISuccess = aiReply && !aiReply.includes("AI is currently busy");

    /**
     * Save assistant reply.
     */
    await ChatMessage.create({
      session: activeSession._id,
      user: userId,
      socialAccount: socialAccountId,
      role: "assistant",
      content: aiReply,
    });

    /**
     * Update session latest activity.
     */
    activeSession.updatedAt = new Date();
    await activeSession.save();

    await trimOldMessages(activeSession._id);

    /**
     * Increment usage only when AI reply is successful.
     */
    if (isAISuccess) {
      user.aiUsageCount += 1;
      await user.save();
    }

    return res.status(200).json({
      success: true,
      reply: aiReply,
      sessionId: activeSession._id,
      sessionTitle: activeSession.title,
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
 * @desc    Get all messages of a chat session
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