// services/chatService.js

import ChatSession from "../models/ChatSession.js";
import ChatMessage from "../models/ChatMessage.js";

import User, {
    PLAN_AI_LIMITS,
} from "../models/User.js";

import {
    deleteImageFromCloudinary,
} from "./cloudinaryStorageService.js";

/**
 * ---------------------------------------------------
 * Constants
 * ---------------------------------------------------
 */

const MAX_SESSIONS_PER_ACCOUNT = 20;

const MAX_MESSAGES_PER_SESSION = 100;

const MAX_CONTEXT_MESSAGES = 12;

const ONE_DAY_IN_MS =
    24 * 60 * 60 * 1000;

/**
 * ---------------------------------------------------
 * Safe Cloudinary Cleanup
 * ---------------------------------------------------
 */

export const safeDeleteCloudinaryImage =
    async (
        publicId
    ) => {

        try {

            if (!publicId) {
                return;
            }

            await deleteImageFromCloudinary(
                publicId
            );

        } catch (error) {

            console.error(
                "[CLOUDINARY_DELETE_ERROR]",
                {
                    publicId,

                    message:
                        error.message,
                }
            );
        }
    };

/**
 * ---------------------------------------------------
 * Determine AI Usage Reset
 * ---------------------------------------------------
 */

const shouldResetAIUsage =
    (
        resetDate
    ) => {

        if (!resetDate) {
            return true;
        }

        const lastReset =
            new Date(
                resetDate
            ).getTime();

        return (
            Date.now() -
                lastReset >=
            ONE_DAY_IN_MS
        );
    };

/**
 * ---------------------------------------------------
 * Prepare User AI Usage
 * ---------------------------------------------------
 *
 * Handles:
 * - plan limits
 * - daily reset
 * - usage synchronization
 */

export const prepareAIUsageForRequest =
    async (
        user
    ) => {

        const limit =
            PLAN_AI_LIMITS[
                user.plan
            ] ||
            PLAN_AI_LIMITS.FREE;

        user.aiUsageLimit =
            limit;

        /**
         * Reset usage if needed
         */
        if (
            shouldResetAIUsage(
                user.aiUsageResetDate
            )
        ) {

            user.aiUsageCount = 0;

            user.aiUsageResetDate =
                new Date();
        }

        await user.save();

        return user;
    };

/**
 * ---------------------------------------------------
 * Build Usage Info
 * ---------------------------------------------------
 */

export const buildUsageInfo =
    (
        user
    ) => {

        return {

            plan: user.plan,

            used:
                user.aiUsageCount,

            limit:
                user.aiUsageLimit,

            remaining:
                Math.max(
                    user.aiUsageLimit -
                        user.aiUsageCount,
                    0
                ),

            resetDate:
                user.aiUsageResetDate,
        };
    };

/**
 * ---------------------------------------------------
 * Build Chat Session Title
 * ---------------------------------------------------
 */

const buildSessionTitle =
    (
        message
    ) => {

        const clean =
            message
                ?.replace(
                    /\s+/g,
                    " "
                )
                .trim();

        if (!clean) {
            return "New Chat";
        }

        return clean.length > 60
            ? `${clean.slice(
                  0,
                  60
              )}...`
            : clean;
    };

/**
 * ---------------------------------------------------
 * Build User Message Text
 * ---------------------------------------------------
 */

export const buildUserMessageText =
    (
        message,
        hasImages
    ) => {

        const clean =
            message?.trim() || "";

        if (clean) {
            return clean;
        }

        if (hasImages) {
            return "Analyze the uploaded images.";
        }

        return "";
    };

/**
 * ---------------------------------------------------
 * Trim Old Sessions
 * ---------------------------------------------------
 */

export const trimOldSessions =
    async (
        userId,
        socialAccountId
    ) => {

        const sessions =
            await ChatSession.find({

                user: userId,

                socialAccount:
                    socialAccountId,
            })
                .sort({
                    updatedAt: -1,
                })
                .select("_id");

        if (
            sessions.length <=
            MAX_SESSIONS_PER_ACCOUNT
        ) {
            return;
        }

        const sessionsToDelete =
            sessions.slice(
                MAX_SESSIONS_PER_ACCOUNT
            );

        const sessionIds =
            sessionsToDelete.map(
                (session) =>
                    session._id
            );

        const messages =
            await ChatMessage.find({
                session: {
                    $in: sessionIds,
                },
            });

        /**
         * Cleanup Cloudinary images
         */
        for (const message of messages) {

            for (const image of message.images || []) {

                await safeDeleteCloudinaryImage(
                    image.publicId
                );
            }
        }

        /**
         * Delete old messages
         */
        await ChatMessage.deleteMany({

            session: {
                $in: sessionIds,
            },
        });

        /**
         * Delete old sessions
         */
        await ChatSession.deleteMany({

            _id: {
                $in: sessionIds,
            },
        });
    };

/**
 * ---------------------------------------------------
 * Trim Old Messages
 * ---------------------------------------------------
 */

export const trimOldMessages =
    async (
        sessionId
    ) => {

        const messages =
            await ChatMessage.find({

                session: sessionId,
            })
                .sort({
                    createdAt: 1,
                })
                .select("_id images");

        if (
            messages.length <=
            MAX_MESSAGES_PER_SESSION
        ) {
            return;
        }

        const messagesToDelete =
            messages.slice(
                0,
                messages.length -
                    MAX_MESSAGES_PER_SESSION
            );

        /**
         * Cleanup old images
         */
        for (const message of messagesToDelete) {

            for (const image of message.images || []) {

                await safeDeleteCloudinaryImage(
                    image.publicId
                );
            }
        }

        /**
         * Delete old messages
         */
        await ChatMessage.deleteMany({

            _id: {
                $in:
                    messagesToDelete.map(
                        (message) =>
                            message._id
                    ),
            },
        });
    };

/**
 * ---------------------------------------------------
 * Get Or Create Chat Session
 * ---------------------------------------------------
 */

export const getOrCreateChatSession =
  async ({

    sessionId,

    userId,

    socialAccountId,

    userMessageText,
  }) => {

    /**
     * Existing session flow
     */
    if (sessionId) {

      const existingSession =
        await ChatSession.findOne({

          _id:
            sessionId,

          user:
            userId,

          socialAccount:
            socialAccountId,
        });

      /**
       * Return existing session
       */
      if (existingSession) {

        return existingSession;
      }
    }

    /**
     * Create new session
     */
    const newSession =
      await ChatSession.create({

        user:
          userId,

        socialAccount:
          socialAccountId,

        title:
          buildSessionTitle(
            userMessageText
          ),
      });

    /**
     * Trim old sessions
     */
    await trimOldSessions(

      userId,

      socialAccountId
    );

    return newSession;
  };


/**
 * ---------------------------------------------------
 * Build History Messages
 * ---------------------------------------------------
 */

export const buildHistoryMessages =
    async (
        sessionId
    ) => {

        const messages =
            await ChatMessage.find({

                session: sessionId,
            })
                .sort({
                    createdAt: -1,
                })
                .limit(
                    MAX_CONTEXT_MESSAGES
                )
                .lean();

        return messages
            .reverse()
            .map((msg) => ({

                role: msg.role,

                content:
                    msg.content,
            }));
    };

/**
 * ---------------------------------------------------
 * Build Analytics Context
 * ---------------------------------------------------
 */

export const buildAnalyticsContext =
    (
        socialAccount,
        snapshots
    ) => {

        const latest =
            snapshots[
                snapshots.length - 1
            ] || {};

        return `
Platform: ${socialAccount.platform}
Username: ${socialAccount.username}
Followers: ${latest.followers || 0}
Engagement Rate: ${latest.engagementRate || 0}
Reach: ${latest.reach || 0}
Impressions: ${latest.impressions || 0}
`;
    };

/**
 * ---------------------------------------------------
 * Finalize AI Response
 * ---------------------------------------------------
 *
 * Handles:
 * - assistant message persistence
 * - usage increment
 * - session update
 * - message trimming
 */

export const finalizeAIResponse =
    async ({

        user,

        activeSession,

        userId,

        socialAccountId,

        aiResult,
    }) => {

        /**
         * Save assistant message
         */
        await ChatMessage.create({

            session:
                activeSession._id,

            user: userId,

            socialAccount:
                socialAccountId,

            role: "assistant",

            content:
                aiResult.reply,

            images: [],

            model:
                aiResult.modelUsed,

            latencyMs:
                aiResult.latencyMs,
        });

        /**
         * Increment usage
         */
        user.aiUsageCount += 1;

        await user.save();

        /**
         * Update session activity
         */
        activeSession.updatedAt =
            new Date();

        await activeSession.save();

        /**
         * Trim old messages
         */
        await trimOldMessages(
            activeSession._id
        );

        return {

            aiReply:
                aiResult.reply,
        };
    };