import api from "./api.js";

/**
 * -------------------------------------------------------
 * Normalize AI response safely.
 * -------------------------------------------------------
 */
const normalizeResponse = (
  responseData = {}
) => {
  return {
    success:
      responseData.success ??
      true,

    message:
      responseData.message ||
      "",

    /**
     * AI insights.
     */
    insights:
      responseData.insights ||
      responseData.data
        ?.insights ||
      "",

    /**
     * Remaining AI usage.
     */
    remainingUsage:
      responseData.remainingUsage ??
      responseData.data
        ?.remainingUsage ??
      null,

    /**
     * Usage metadata.
     */
    usage:
      responseData.usage ||
      responseData.data
        ?.usage ||
      null,

    /**
     * Messages payload.
     */
    messages:
      responseData.messages ||
      responseData.data
        ?.messages ||
      [],

    /**
     * Raw payload.
     */
    data:
      responseData.data ||
      responseData,
  };
};

/**
 * -------------------------------------------------------
 * Generate AI insights.
 * -------------------------------------------------------
 */
export const getAIInsights =
  async ({
    socialAccountId,
    signal,
  }) => {
    if (!socialAccountId) {
      throw new Error(
        "Social account ID is required."
      );
    }

    const response =
      await api.post(
        `/ai/insights/${socialAccountId}`,
        {},
        {
          signal,
        }
      );

    return normalizeResponse(
      response.data
    );
  };

/**
 * -------------------------------------------------------
 * Get session messages.
 * -------------------------------------------------------
 */
export const getSessionMessages =
  async ({
    sessionId,
    signal,
  }) => {
    if (!sessionId) {
      throw new Error(
        "Session ID is required."
      );
    }

    const response =
      await api.get(
        `/ai/chat/session/${sessionId}/messages`,
        {
          signal,
        }
      );

    return normalizeResponse(
      response.data
    );
  };