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

    insights:
      responseData.insights ||
      responseData.data
        ?.insights ||
      null,

    sessions:
      responseData.sessions ||
      responseData.data
        ?.sessions ||
      [],

    messages:
      responseData.messages ||
      responseData.data
        ?.messages ||
      [],

    session:
      responseData.session ||
      responseData.data
        ?.session ||
      null,

    usage:
      responseData.usage ||
      responseData.data
        ?.usage ||
      null,

    data:
      responseData.data ||
      responseData,
  };
};

/**
 * -------------------------------------------------------
 * Create multipart payload safely.
 * -------------------------------------------------------
 */
const buildChatFormData = ({
  message,
  images = [],
  sessionId,
}) => {
  const formData =
    new FormData();

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
 * Get one session messages.
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
 * Rename session.
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
 * Delete session.
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
 * Standard non-streaming AI request.
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
 * Production-grade SSE streaming lifecycle.
 * -------------------------------------------------------
 *
 * Handles:
 * - token streaming
 * - chunk parsing
 * - abort lifecycle
 * - malformed chunks
 * - session creation
 * - auth validation
 * - backend disconnects
 */
export const streamAIMessage =
  async ({
    socialAccountId,
    message,
    images = [],
    sessionId,
    signal,

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

    /**
     * Auth validation.
     */
    const token =
      localStorage.getItem(
        "token"
      );

    if (!token) {
      throw new Error(
        "Authentication token missing."
      );
    }

    /**
     * Build multipart request.
     */
    const formData =
      buildChatFormData({
        message,
        images,
        sessionId,
      });

    /**
     * Start stream.
     */
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

    /**
     * Backend failure.
     */
    if (!response.ok) {
      let errorMessage =
        "Failed to initialize AI stream.";

      try {
        const errorPayload =
          await response.json();

        errorMessage =
          errorPayload.message ||
          errorMessage;
      } catch {
        //
      }

      throw new Error(
        errorMessage
      );
    }

    /**
     * Stream validation.
     */
    if (!response.body) {
      throw new Error(
        "Streaming response body missing."
      );
    }

    /**
     * SSE lifecycle.
     */
    const reader =
      response.body.getReader();

    const decoder =
      new TextDecoder();

    let buffer = "";

    try {
      while (true) {
        /**
         * Abort protection.
         */
        if (
          signal?.aborted
        ) {
          throw new DOMException(
            "Stream aborted",
            "AbortError"
          );
        }

        const {
          done,
          value,
        } =
          await reader.read();

        /**
         * Stream completed.
         */
        if (done) {
          break;
        }

        /**
         * Decode streamed chunk.
         */
        buffer += decoder.decode(
          value,
          {
            stream: true,
          }
        );

        /**
         * Split SSE events.
         */
        const events =
          buffer.split(
            "\n\n"
          );

        /**
         * Preserve incomplete chunk.
         */
        buffer =
          events.pop() || "";

        /**
         * Parse events safely.
         */
        for (const event of events) {
          const trimmedEvent =
            event.trim();

          if (
            !trimmedEvent.startsWith(
              "data:"
            )
          ) {
            continue;
          }

          try {
            /**
             * Remove SSE prefix.
             */
            const rawJson =
              trimmedEvent.replace(
                /^data:\s*/,
                ""
              );

            if (!rawJson) {
              continue;
            }

            const payload =
              JSON.parse(
                rawJson
              );

            /**
             * Event routing.
             */
            switch (
              payload.type
            ) {
              case "connected":
                onConnected?.(
                  payload
                );
                break;

              case "token":
                onToken?.(
                  payload
                );
                break;

              case "done":
                onDone?.(
                  payload
                );
                break;

              case "error":
                onError?.(
                  payload
                );

                throw new Error(
                  payload.message ||
                    "AI stream failed."
                );

              default:
                break;
            }
          } catch (error) {
            /**
             * Ignore malformed SSE chunks.
             */
            console.error(
              "[SSE PARSE ERROR]",
              error
            );
          }
        }
      }
    } catch (error) {
      /**
       * Ignore abort lifecycle.
       */
      if (
        error?.name ===
        "AbortError"
      ) {
        throw error;
      }

      console.error(
        "[STREAM ERROR]",
        error
      );

      throw error;
    } finally {
      /**
       * Cleanup reader safely.
       */
      try {
        reader.releaseLock();
      } catch {
        //
      }
    }
  };