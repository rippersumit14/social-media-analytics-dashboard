import mongoose from "mongoose";
import SocialAccount from "../models/SocialAccount.js";
import AnalyticsSnapshot from "../models/AnalyticsSnapshot.js";
import User, { PLAN_AI_LIMITS } from "../models/User.js";
import { generateAnalyticsResponse } from "../services/aiService.js";

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
 * Checks whether the user's AI usage window has expired.
 */
const shouldResetAIUsage = (resetDate) => {
  if (!resetDate) {
    return true;
  }

  const lastResetTime = new Date(resetDate).getTime();
  const now = Date.now();

  return now - lastResetTime >= ONE_DAY_IN_MS;
};

/**
 * Prepares user usage state before every AI request.
 *
 * Responsibilities:
 * - sync usage limit with current plan
 * - reset usage count if daily window expired
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
 * Builds frontend-friendly usage information.
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
 * Safely access raw MongoDB collections.
 */
const getCollections = () => {
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error("Database connection is not ready");
  }

  return {
    sessions: db.collection("chat_sessions"),
    messages: db.collection("chat_messages"),
  };
};

/**
 * Keeps only the latest sessions for a social account.
 */
const trimOldSessions = async (
  sessionsCollection,
  messagesCollection,
  userId,
  socialAccountId
) => {
  const sessions = await sessionsCollection
    .find({ userId, socialAccountId })
    .sort({ updatedAt: -1 })
    .toArray();

  if (sessions.length <= MAX_SESSIONS_PER_ACCOUNT) {
    return;
  }

  const sessionsToDelete = sessions.slice(MAX_SESSIONS_PER_ACCOUNT);
  const idsToDelete = sessionsToDelete.map((session) => session._id);

  if (idsToDelete.length > 0) {
    await sessionsCollection.deleteMany({ _id: { $in: idsToDelete } });
    await messagesCollection.deleteMany({ sessionId: { $in: idsToDelete } });
  }
};

/**
 * Keeps only the latest messages inside one session.
 */
const trimOldMessages = async (messagesCollection, sessionId) => {
  const allMessages = await messagesCollection
    .find({ sessionId })
    .sort({ createdAt: 1 })
    .toArray();

  if (allMessages.length <= MAX_MESSAGES_PER_SESSION) {
    return;
  }

  const messagesToDelete = allMessages.slice(
    0,
    allMessages.length - MAX_MESSAGES_PER_SESSION
  );

  const idsToDelete = messagesToDelete.map((msg) => msg._id);

  if (idsToDelete.length > 0) {
    await messagesCollection.deleteMany({ _id: { $in: idsToDelete } });
  }
};

/**
 * Creates a readable session title from the first user message.
 */
const buildSessionTitle = (message) => {
  const clean = message.replace(/\s+/g, " ").trim();

  if (!clean) {
    return "New Chat";
  }

  return clean.length > 60 ? `${clean.slice(0, 60)}...` : clean;
};

/**
 * Builds safe message text for:
 * - text-only chat
 * - image-only chat
 * - text + image chat
 */
const buildUserMessageText = (message, hasImage) => {
  const cleanMessage = message?.trim() || "";

  if (cleanMessage) {
    return cleanMessage;
  }

  if (hasImage) {
    return "The user uploaded an image and wants analysis.";
  }

  return "";
};

/**
 * Builds analytics context for the AI system prompt.
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
 * @desc    AI assistant chat for analytics + strategy
 * @route   POST /api/ai/chat/:socialAccountId
 * @access  Private
 */
export const chatWithAI = async (req, res) => {
  try {
    const { socialAccountId } = req.params;
    const { message, sessionId } = req.body;

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
        message: "Message or image is required",
      });
    }

    const imageBase64 = uploadedImage
      ? uploadedImage.buffer.toString("base64")
      : null;

    const imageMimeType = uploadedImage?.mimetype || null;

    // Current authenticated user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    /**
     * Prepare AI usage before checking the limit.
     * This resets daily usage if the user's usage window expired.
     */
    await prepareAIUsageForRequest(user);

    const usageInfoBeforeAI = buildUsageInfo(user);

    if (usageInfoBeforeAI.remaining <= 0) {
      return res.status(403).json({
        message:
          "Daily AI usage limit reached. Please try again after reset or upgrade your plan.",
        usage: usageInfoBeforeAI,
      });
    }

    // Ensure the selected social account belongs to the logged-in user
    const socialAccount = await SocialAccount.findOne({
      _id: socialAccountId,
      user: req.user._id,
    });

    if (!socialAccount) {
      return res.status(404).json({
        message: "Social account not found or not authorized",
      });
    }

    // Load account analytics snapshots for context-aware replies
    const snapshots = await AnalyticsSnapshot.find({
      socialAccount: socialAccountId,
    }).sort({ capturedAt: 1 });

    const { sessions, messages } = getCollections();

    const now = new Date();
    let activeSession = null;

    /**
     * Reuse session if sessionId is valid and belongs to same user/account.
     */
    if (sessionId) {
      activeSession = await sessions.findOne({
        _id: new mongoose.Types.ObjectId(sessionId),
        userId: user._id.toString(),
        socialAccountId,
      });
    }

    /**
     * Create new session when no valid session exists.
     */
    if (!activeSession) {
      const newSession = {
        userId: user._id.toString(),
        socialAccountId,
        title: buildSessionTitle(userMessageText),
        createdAt: now,
        updatedAt: now,
      };

      const insertResult = await sessions.insertOne(newSession);

      activeSession = {
        _id: insertResult.insertedId,
        ...newSession,
      };

      await trimOldSessions(
        sessions,
        messages,
        user._id.toString(),
        socialAccountId
      );
    }

    /**
     * Save current user message.
     */
    const userMessageDoc = {
      sessionId: activeSession._id,
      userId: user._id.toString(),
      socialAccountId,
      role: "user",
      content: userMessageText,
      image: hasImage
        ? {
            originalName: uploadedImage.originalname,
            mimeType: imageMimeType,
            size: uploadedImage.size,
          }
        : null,
      createdAt: now,
    };

    await messages.insertOne(userMessageDoc);

    /**
     * Load recent history for AI continuity.
     */
    const recentHistory = await messages
      .find({ sessionId: activeSession._id })
      .sort({ createdAt: -1 })
      .limit(MAX_CONTEXT_MESSAGES)
      .toArray();

    const orderedHistory = recentHistory.reverse();

    const historyMessages = orderedHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const analyticsContext = buildAnalyticsContext(socialAccount, snapshots);

    /**
     * Generate AI reply.
     * Reliability, retry, and fallback are handled inside aiService.js.
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
    const assistantMessageDoc = {
      sessionId: activeSession._id,
      userId: user._id.toString(),
      socialAccountId,
      role: "assistant",
      content: aiReply,
      createdAt: new Date(),
    };

    await messages.insertOne(assistantMessageDoc);

    // Update session activity timestamp
    await sessions.updateOne(
      { _id: activeSession._id },
      {
        $set: {
          updatedAt: new Date(),
        },
      }
    );

    await trimOldMessages(messages, activeSession._id);

    /**
     * Increment usage only after AI gives a valid successful response.
     * Failed to fallback responses should not consume user's daily quota
     */
    if (isAISuccess){
    user.aiUsageCount += 1;
    await user.save();
    }

    return res.status(200).json({
      reply: aiReply,
      usage: buildUsageInfo(user),
      remainingUsage: Math.max(user.aiUsageLimit - user.aiUsageCount, 0),
      sessionId: activeSession._id.toString(),
      sessionTitle: activeSession.title,
    });
  } catch (error) {
    console.error("[CHAT_WITH_AI_ERROR]", {
      message: error.message,
      timestamp: new Date().toISOString(),
    });

    return res.status(500).json({
      message: "AI is currently busy, please try again",
    });
  }
};