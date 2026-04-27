import api from "./api.js";

/**
 * Send message to AI chat API
 *
 * Supports:
 * - Text-only (JSON)
 * - Text + image (FormData)
 *
 * @param {string} accountId
 * @param {string} message
 * @param {string} token
 * @param {string|null} sessionId
 * @param {File|null} imageFile
 */
export const chatWithAI = async (
  accountId,
  message,
  token,
  sessionId = null,
  imageFile = null
) => {
  // IMAGE PRESENT 
  if (imageFile) {
    const formData = new FormData();

    formData.append("message", message);
    if (sessionId) formData.append("sessionId", sessionId);
    formData.append("image", imageFile);

    const response = await api.post(
      `/ai/chat/${accountId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  }

  // TEXT ONLY 
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