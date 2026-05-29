import api from "./api.js";

/**
 * -------------------------------------------------------
 * Normalize backend AI responses safely.
 * -------------------------------------------------------
 */
const normalizeAIResponse = (
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
     * AI insights payload.
     */
    insights:
      responseData.insights ||
      responseData.data
        ?.insights ||
      null,

    /**
     * Chat sessions payload.
     */
    sessions:
      responseData.sessions ||
      responseData.data
        ?.sessions ||
      [],

    /**
     * Chat messages payload.
     */
    messages:
      responseData.messages ||
      responseData.data
        ?.messages ||
      [],

    /**
     * Session payload.
     */
    session:
      responseData.session ||
      responseData.data
        ?.session ||
      null,

    /**
     * Remaining usage info.
     */
    usage:
      responseData.usage ||
      responseData.data
        ?.usage ||
      null,

    /**
     * Raw backend payload.
     */
    data:
      responseData.data ||
      responseData,
  };
};

/**
 * -------------------------------------------------------
 * Get AI insights.
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

    return normalizeAIResponse(
      response.data
    );
  };

/**
 * -------------------------------------------------------
 * Get all chat sessions.
 * -------------------------------------------------------
 */
export const getChatSessions =
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
      await api.get(
        `/ai/chat/sessions/${socialAccountId}`,
        {
          signal,
        }
      );

    return normalizeAIResponse(
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

    return normalizeAIResponse(
      response.data
    );
  };

/**
 * -------------------------------------------------------
 * Rename chat session.
 * -------------------------------------------------------
 */
export const renameChatSession =
  async ({
    sessionId,
    title,
    signal,
  }) => {
    if (!sessionId) {
      throw new Error(
        "Session ID is required."
      );
    }

    const response =
      await api.patch(
        `/ai/chat/session/${sessionId}`,
        {
          title,
        },
        {
          signal,
        }
      );

    return normalizeAIResponse(
      response.data
    );
  };

/**
 * -------------------------------------------------------
 * Delete chat session.
 * -------------------------------------------------------
 */
export const deleteChatSession =
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
      await api.delete(
        `/ai/chat/session/${sessionId}`,
        {
          signal,
        }
      );

    return normalizeAIResponse(
      response.data
    );
  };

/**
 * -------------------------------------------------------
 * Create multipart AI request payload.
 * -------------------------------------------------------
 */
const buildChatFormData = ({
  message,
  images = [],
  sessionId,
}) => {
  const formData =
    new FormData();

  /**
   * User message.
   */
  formData.append(
    "message",
    message || ""
  );

  /**
   * Existing session support.
   */
  if (sessionId) {
    formData.append(
      "sessionId",
      sessionId
    );
  }

  /**
   * Multiple image uploads.
   */
  images.forEach((image) => {
    if (image?.file) {
      formData.append(
        "images",
        image.file
      );
    }
  });

  return formData;
};

/**
 * -------------------------------------------------------
 * Standard AI message request.
 *
 * Non-streaming fallback.
 * -------------------------------------------------------
 */
export const sendAIMessage =
  async ({
    socialAccountId,
    message,
    images = [],
    sessionId,
    signal,
  }) => {
    if (!socialAccountId) {
      throw new Error(
        "Social account ID is required."
      );
    }

    const formData =
      buildChatFormData({
        message,
        images,
        sessionId,
      });

    const response =
      await api.post(
        `/ai/chat/${socialAccountId}`,
        formData,
        {
          signal,

          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

    return normalizeAIResponse(
      response.data
    );
  };

/**
 * -------------------------------------------------------
 * Real SSE AI streaming request.
 * -------------------------------------------------------
 *
 * Handles:
 * - token streaming
 * - chunk rendering
 * - done events
 * - error events
 * - session creation
 * - multimodal uploads
 */
export const streamAIMessage =
  async ({
    socialAccountId,
    message,
    images = [],
    sessionId,
    signal,

    /**
     * SSE callbacks.
     */
    onConnected,
    onToken,
    onDone,
    onError,
  }) => {
    if (!socialAccountId) {
      throw new Error(
        "Social account ID is required."
      );
    }

    const formData =
      buildChatFormData({
        message,
        images,
        sessionId,
      });

    const token =
      localStorage.getItem(
        "token"
      );

    const response =
      await fetch(
        `${
          import.meta.env
            .VITE_API_URL
        }/ai/chat/${socialAccountId}/stream`,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },

          body: formData,

          signal,
        }
      );

    if (!response.ok) {
      throw new Error(
        "Failed to start AI stream."
      );
    }

    const reader =
      response.body.getReader();

    const decoder =
      new TextDecoder();

    let buffer = "";

    /**
     * Stream lifecycle.
     */
    while (true) {
      const {
        done,
        value,
      } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(
        value,
        {
          stream: true,
        }
      );

      /**
       * SSE event parsing.
       */
      const chunks =
        buffer.split("\n\n");

      buffer =
        chunks.pop() || "";

      for (const chunk of chunks) {
        const cleanChunk =
          chunk.trim();

        if (
          !cleanChunk.startsWith(
            "data:"
          )
        ) {
          continue;
        }

        try {
          const json =
            JSON.parse(
              cleanChunk.replace(
                /^data:\s*/,
                ""
              )
            );

          /**
           * SSE event routing.
           */
          switch (
            json.type
          ) {
            case "connected":
              onConnected?.(
                json
              );
              break;

            case "token":
              onToken?.(
                json
              );
              break;

            case "done":
              onDone?.(
                json
              );
              break;

            case "error":
              onError?.(
                json
              );
              break;

            default:
              break;
          }
        } catch (error) {
          console.error(
            "[SSE PARSE ERROR]",
            error
          );
        }
      }
    }
  };