import api from "./api.js";

/**
 * Send a message to backend AI chat API
 *
 * @param {string} accountId - Selected social account ID
 * @param {string} message - User's current message
 * @param {string} token - Auth token
 * @param {string|null} sessionId - Existing chat session ID (optional)
 * @returns {Promise<Object>} reply, remainingUsage, sessionId, sessionTitle
 */
export const chatWithAI = async (accountId, message, token, sessionId = null) => {
  const response = await api.post(
    `/ai/chat/${accountId}`,
    {
      message,
      sessionId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};