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
 * Build multipart payload safely.
 * -------------------------------------------------------
 *
 * IMPORTANT:
 * Backend expects:
 * images
 *
 * Browser automatically sets:
 * multipart boundaries.
 *
 * NEVER manually set:
 * Content-Type multipart/form-data
 */
const buildChatFormData = ({
  message,
  images = [],
  sessionId,
}) => {
  const formData =
    new FormData();

  /**
   * User prompt.
   */
  formData.append(
    "message",
    message || ""
  );

  /**
   * Existing session.
   */
  if (sessionId) {
    formData.append(
      "sessionId",
      sessionId
    );
  }

  /**
   * Multiple image uploads.
   *
   * Backend expects:
   * images
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
 *
 * NOTE:
 * Backend route may temporarily
 * not exist during stabilization.
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
 *
 * NOTE:
 * Backend route may temporarily
 * not exist during stabilization.
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

    /**
     * Build upload payload.
     */
    const formData =
      buildChatFormData({
        message,
        images,
        sessionId,
      });

    /**
     * IMPORTANT:
     * Do NOT manually set
     * multipart/form-data headers.
     *
     * Browser handles boundaries.
     */
    const response =
      await api.post(
        `/ai/chat/${socialAccountId}`,
        formData,
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
 * Production-grade SSE streaming.
 * -------------------------------------------------------
 *
 * Handles:
 * - live token streaming
 * - chunk accumulation
 * - malformed chunks
 * - disconnect recovery
 * - abort lifecycle
 * - stream completion
 * - upload coexistence
 * - retry-safe parsing
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
     * Validate auth token.
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
     * Build multipart payload.
     */
    const formData =
      buildChatFormData({
        message,
        images,
        sessionId,
      });

    /**
     * Start SSE request.
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

          /**
           * IMPORTANT:
           * Browser automatically handles
           * multipart boundaries.
           */
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
     * Validate SSE body.
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
         * Abort lifecycle.
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
         * Stream finished.
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
         * Split SSE events safely.
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

          /**
           * Ignore invalid SSE chunks.
           */
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

            /**
             * Ignore empty chunks.
             */
            if (!rawJson) {
              continue;
            }

            /**
             * Parse SSE payload.
             */
            const payload =
              JSON.parse(
                rawJson
              );

            /**
             * Event lifecycle.
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
                /**
                 * IMPORTANT:
                 * Tokens should ONLY
                 * update frontend UI state.
                 *
                 * Do NOT persist
                 * partial tokens.
                 */
                onToken?.(
                  payload
                );
                break;

              case "done":
                /**
                 * IMPORTANT:
                 * ONLY final completed
                 * response should become
                 * persisted assistant message.
                 */
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