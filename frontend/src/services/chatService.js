import api from "./api.js";

/**
 * Send message to AI chat API.
 *
 * Supports:
 * - Text-only messages using JSON
 * - Image-only messages using FormData
 * - Text + image messages using FormData
 *
 * @param {string} accountId - Selected social account id
 * @param {string} message - User message text
 * @param {string} token - JWT token
 * @param {string|null} sessionId - Existing chat session id
 * @param {File|null} imageFile - Optional uploaded image
 */
export const chatWithAI = async (
  accountId,
  message,
  token,
  sessionId = null,
  imageFile = null
) => {
  /**
   * Image request:
   * FormData is required because files cannot be sent as normal JSON.
   */
  if (imageFile) {
    const formData = new FormData();

    formData.append("message", message || "");

    if (sessionId) {
      formData.append("sessionId", sessionId);
    }

    formData.append("image", imageFile);

    const response = await api.post(`/ai/chat/${accountId}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  }

  /**
   * Text-only request:
   * Normal JSON body is enough.
   */
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