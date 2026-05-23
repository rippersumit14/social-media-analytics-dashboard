/**
 * ---------------------------------------------------
 * AI Memory Optimization
 * ---------------------------------------------------
 */

/**
 * Max messages to keep
 */
const MAX_HISTORY_MESSAGES =
  12;

/**
 * ---------------------------------------------------
 * Optimize Chat History
 * ---------------------------------------------------
 */

export const optimizeConversationHistory =
  (
    messages = []
  ) => {

    /**
     * Keep latest messages
     */
    const recentMessages =
      messages.slice(

        -MAX_HISTORY_MESSAGES //keeps the latest messages only
      );

    /**
     * Normalize messages
     */
    return recentMessages.map(

      (message) => ({

        role:
          message.role,

        content:
          message.content,
      })
    );
  };