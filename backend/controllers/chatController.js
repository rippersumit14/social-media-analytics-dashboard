import mongoose from "mongoose";
import SocialAccount from "../models/SocialAccount.js";
import AnalyticsSnapshot from "../models/AnalyticsSnapshot.js";
import User from "../models/User.js";
import { generateAnalyticsResponse } from "../services/aiService.js";

/**
 * Chat session storage strategy
 *
 * To avoid requiring extra model files right now,
 * this controller uses raw MongoDB collections through mongoose.connection.db:
 *
 * Collections used:
 * - chat_sessions
 * - chat_messages
 *
 * This keeps the feature working without creating extra schema files today.
 *
 * Document shape:
 *
 * chat_sessions:
 * {
 *   _id,
 *   userId,
 *   socialAccountId,
 *   title,
 *   createdAt,
 *   updatedAt
 * }
 *
 * chat_messages:
 * {
 *   _id,
 *   sessionId,
 *   userId,
 *   socialAccountId,
 *   role,        // "user" | "assistant"
 *   content,
 *   createdAt
 * }
 */

// ---------- Limits ----------
const MAX_SESSIONS_PER_ACCOUNT = 20;
const MAX_MESSAGES_PER_SESSION = 100;
const MAX_CONTEXT_MESSAGES = 12; // messages sent to AI for continuity

/**
 * Helper: get raw collections safely
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
 * Helper: trim old sessions if session count exceeds limit
 * Keeps only the most recent MAX_SESSIONS_PER_ACCOUNT sessions
 */
const trimOldSessions = async (sessionsCollection, messagesCollection, userId, socialAccountId) => {
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
 * Helper: trim old messages if message count exceeds limit
 * Keeps only the most recent MAX_MESSAGES_PER_SESSION messages
 */
const trimOldMessages = async (messagesCollection, sessionId) => {
  const allMessages = await messagesCollection
    .find({ sessionId })
    .sort({ createdAt: 1 })
    .toArray();

  if (allMessages.length <= MAX_MESSAGES_PER_SESSION) {
    return;
  }

  const messagesToDelete = allMessages.slice(0, allMessages.length - MAX_MESSAGES_PER_SESSION);
  const idsToDelete = messagesToDelete.map((msg) => msg._id);

  if (idsToDelete.length > 0) {
    await messagesCollection.deleteMany({ _id: { $in: idsToDelete } });
  }
};

/**
 * Helper: create a readable session title from first user message
 */
const buildSessionTitle = (message) => {
  const clean = message.replace(/\s+/g, " ").trim();
  if (!clean) return "New Chat";
  return clean.length > 60 ? `${clean.slice(0, 60)}...` : clean;
};

//Build a safe user message for text, image-only, or text + image chat
const buildUserMessgeText = (message, hasImage) => {
  const cleanMessage = message?.trim() || "";

  if(cleanMessage) return cleanMessage;

  if(hasImage){
    return "The user uploads an image and wants analysis"
  }

  return "";


}

/**
 * Helper: build analytics context block
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
- Engagement rate change: ${((latest.engagementRate ?? 0) - (first.engagementRate ?? 0)).toFixed(2)}
- Post change: ${(latest.posts ?? 0) - (first.posts ?? 0)}
- Likes change: ${(latest.likes ?? 0) - (first.likes ?? 0)}
- Comments change: ${(latest.comments ?? 0) - (first.comments ?? 0)}
`;
};

/**
 * @desc    AI personal assistant chat for analytics + strategy
 * @route   POST /api/ai/chat/:socialAccountId
 * @access  Private
 *
 * Request body:
 * {
 *   "message": "Why is my engagement increasing?",
 *   "sessionId": "optional-existing-session-id"
 * }
 *
 * Response:
 * {
 *   "reply": "...",
 *   "remainingUsage": 97,
 *   "sessionId": "...",
 *   "sessionTitle": "Why is my engagement increasing?"
 * }
 */
export const chatWithAI = async (req, res) => {
  try {
    const { socialAccountId } = req.params;
    const {message, sessionId} = req.body;
    const uploadedImage = req.file || null;
    const hasImage = Boolean(uploadedImage);

    const userMessageText = buildUserMessgeText(message, hasImage);

    //Validate input: allow only the text is allowed, image-only, or text + image.
    if(!userMessageText && !hasImage){
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

    // Usage limit check
    if (user.aiUsageCount >= user.aiUsageLimit) {
      return res.status(403).json({
        message: "AI usage limit reached. Please try again later or upgrade your plan.",
      });
    }

    // Ensure account belongs to this user
    const socialAccount = await SocialAccount.findOne({
      _id: socialAccountId,
      user: req.user._id,
    });

    if (!socialAccount) {
      return res.status(404).json({
        message: "Social account not found or not authorized",
      });
    }

    // Load snapshots for account-aware answers
    const snapshots = await AnalyticsSnapshot.find({
      socialAccount: socialAccountId,
    }).sort({ capturedAt: 1 });

    const { sessions, messages } = getCollections();

    const now = new Date();
    let activeSession = null;

    // ---------- Session resolution ----------
    if (sessionId) {
      // Reuse existing session if valid and owned by same user/account
      activeSession = await sessions.findOne({
        _id: new mongoose.Types.ObjectId(sessionId),
        userId: user._id.toString(),
        socialAccountId,
      });
    }

    // If no valid session found, create a new one
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

      // Trim old sessions after creating a new one
      await trimOldSessions(
        sessions,
        messages,
        user._id.toString(),
        socialAccountId
      );
    }

    // ---------- Save current user message ----------
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

    // ---------- Load recent message history ----------
    const recentHistory = await messages
      .find({ sessionId: activeSession._id })
      .sort({ createdAt: -1 })
      .limit(MAX_CONTEXT_MESSAGES)
      .toArray();

    // Reverse because DB fetch is latest-first, AI expects oldest-first
    const orderedHistory = recentHistory.reverse();

    // Convert DB messages to chat completion messages
    const historyMessages = orderedHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Build analytics context for system prompt
    const analyticsContext = buildAnalyticsContext(socialAccount, snapshots);

    // ---------- Ask AI ----------
    const aiReply = await generateAnalyticsResponse({
      analyticsContext,
      historyMessages,
      latestUserMessage: userMessageText,
      imageBase64,
      imageMimeType,
    });

    // ---------- Save assistant reply ----------
    const assistantMessageDoc = {
      sessionId: activeSession._id,
      userId: user._id.toString(),
      socialAccountId,
      role: "assistant",
      content: aiReply,
      createdAt: new Date(),
    };

    await messages.insertOne(assistantMessageDoc);

    // Update session timestamp
    await sessions.updateOne(
      { _id: activeSession._id },
      {
        $set: {
          updatedAt: new Date(),
        },
      }
    );

    // Trim message history if needed
    await trimOldMessages(messages, activeSession._id);

    // Increment usage after successful AI responses
    user.aiUsageCount += 1;
    await user.save();

    return res.status(200).json({
      reply: aiReply,
      remainingUsage: user.aiUsageLimit - user.aiUsageCount,
      sessionId: activeSession._id.toString(),
      sessionTitle: activeSession.title,
    });
  } catch (error) {
    console.error("chatWithAI error:", error.message);

    return res.status(500).json({
      message: "Chat AI error",
      error: error.message,
    });
  }
};