import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  streamAIMessage,
} from "../services/aiChatService.js";

/**
 * -------------------------------------------------------
 * Production-grade AI orchestration hook.
 * -------------------------------------------------------
 *
 * Handles:
 * - real SSE streaming
 * - optimistic rendering
 * - token streaming updates
 * - upload orchestration
 * - session synchronization
 * - streaming lifecycle
 * - abort lifecycle
 * - stale request protection
 * - usage synchronization
 */
const useAIChat = ({
  activeSessionId,

  setActiveSessionId,

  setSessionTitle,

  setMessages,

  loadSessions,
}) => {
  /**
   * -------------------------------------------------------
   * Input lifecycle.
   * -------------------------------------------------------
   */
  const [input, setInput] =
    useState("");

  /**
   * -------------------------------------------------------
   * Chat lifecycle.
   * -------------------------------------------------------
   */
  const [chatLoading, setChatLoading] =
    useState(false);

  const [isUploading, setIsUploading] =
    useState(false);

  const [chatError, setChatError] =
    useState("");

  /**
   * -------------------------------------------------------
   * AI metadata lifecycle.
   * -------------------------------------------------------
   */
  const [modelName, setModelName] =
    useState("");

  const [latencyMs, setLatencyMs] =
    useState(null);

  /**
   * -------------------------------------------------------
   * Usage lifecycle.
   * -------------------------------------------------------
   */
  const [usageInfo, setUsageInfo] =
    useState(null);

  const [remainingUsage, setRemainingUsage] =
    useState(null);

  /**
   * -------------------------------------------------------
   * Abort lifecycle.
   * -------------------------------------------------------
   */
  const abortControllerRef =
    useRef(null);

  /**
   * -------------------------------------------------------
   * Active request protection.
   * -------------------------------------------------------
   */
  const activeRequestRef =
    useRef(null);

  /**
   * -------------------------------------------------------
   * Prevent unbounded memory growth.
   * -------------------------------------------------------
   */
  const limitMessages =
    useCallback(
      (
        messages,
        max = 100
      ) => {
        if (
          messages.length <=
          max
        ) {
          return messages;
        }

        return messages.slice(
          messages.length - max
        );
      },
      []
    );

  /**
   * -------------------------------------------------------
   * Replace assistant message safely.
   * -------------------------------------------------------
   */
  const replaceAssistantMessage =
    useCallback(
      (
        assistantMessageId,
        updater
      ) => {
        setMessages((prev) =>
          prev.map((message) =>
            message.id ===
            assistantMessageId
              ? updater(
                  message
                )
              : message
          )
        );
      },
      [setMessages]
    );

  /**
   * -------------------------------------------------------
   * Synchronize backend metadata.
   * -------------------------------------------------------
   */
  const syncMetadata =
    useCallback(
      (payload = {}) => {
        /**
         * Session lifecycle.
         */
        if (
          payload.sessionId
        ) {
          setActiveSessionId(
            payload.sessionId
          );
        }

        if (
          payload.sessionTitle
        ) {
          setSessionTitle(
            payload.sessionTitle
          );
        }

        /**
         * AI metadata.
         */
        if (
          payload.modelName !==
          undefined
        ) {
          setModelName(
            payload.modelName ||
              ""
          );
        }

        if (
          payload.latencyMs !==
          undefined
        ) {
          setLatencyMs(
            payload.latencyMs ||
              null
          );
        }

        /**
         * Usage metadata.
         */
        if (
          payload.usage !==
          undefined
        ) {
          setUsageInfo(
            payload.usage ||
              null
          );
        }

        if (
          payload.remainingUsage !==
          undefined
        ) {
          setRemainingUsage(
            payload.remainingUsage ??
              null
          );
        }
      },
      [
        setActiveSessionId,
        setSessionTitle,
      ]
    );

  /**
   * -------------------------------------------------------
   * Cancel active AI stream safely.
   * -------------------------------------------------------
   */
  const cancelStream =
    useCallback(() => {
      abortControllerRef.current?.abort();

      abortControllerRef.current =
        null;

      activeRequestRef.current =
        null;

      setChatLoading(false);

      setIsUploading(false);
    }, []);

  /**
   * -------------------------------------------------------
   * Cleanup on unmount.
   * -------------------------------------------------------
   */
  useEffect(() => {
    return () => {
      cancelStream();
    };
  }, [cancelStream]);

  /**
   * -------------------------------------------------------
   * Main AI streaming lifecycle.
   * -------------------------------------------------------
   */
  const sendMessage =
    useCallback(
      async ({
        socialAccountId,

        message,

        selectedImages = [],

        clearImages,
      }) => {
        const trimmedMessage =
          message?.trim() || "";

        /**
         * Prevent invalid requests.
         */
        if (
          (!trimmedMessage &&
            selectedImages.length ===
              0) ||
          !socialAccountId ||
          chatLoading
        ) {
          return;
        }

        /**
         * Cancel previous request.
         */
        cancelStream();

        /**
         * Fresh abort controller.
         */
        const controller =
          new AbortController();

        abortControllerRef.current =
          controller;

        /**
         * Request tracking.
         */
        const requestId =
          crypto.randomUUID();

        activeRequestRef.current =
          requestId;

        /**
         * Reset lifecycle.
         */
        setChatError("");

        setChatLoading(true);

        setIsUploading(true);

        setInput("");

        /**
         * Optimistic user message.
         */
        const optimisticUserMessage =
          {
            id: crypto.randomUUID(),

            role: "user",

            content:
              trimmedMessage ||
              "Uploaded image(s) for analysis.",

            images:
              selectedImages.map(
                (
                  image
                ) => ({
                  imageUrl:
                    image.preview,
                })
              ),

            createdAt:
              new Date().toISOString(),
          };

        /**
         * Streaming assistant placeholder.
         */
        const assistantMessageId =
          crypto.randomUUID();

        const assistantPlaceholder =
          {
            id: assistantMessageId,

            role:
              "assistant",

            content: "",

            isLoading: true,

            isStreaming: true,

            createdAt:
              new Date().toISOString(),
          };

        /**
         * Immediate optimistic rendering.
         */
        setMessages((prev) =>
          limitMessages([
            ...prev,
            optimisticUserMessage,
            assistantPlaceholder,
          ])
        );

        try {
          /**
           * Stream AI response.
           */
          await streamAIMessage({
            socialAccountId,

            message:
              trimmedMessage,

            sessionId:
              activeSessionId,

            images:
              selectedImages,

            signal:
              controller.signal,

            /**
             * SSE connection established.
             */
            onConnected:
              (
                payload
              ) => {
                syncMetadata(
                  payload
                );
              },

            /**
             * Live token streaming.
             */
            onToken:
              (
                payload
              ) => {
                /**
                 * Ignore stale streams.
                 */
                if (
                  activeRequestRef.current !==
                  requestId
                ) {
                  return;
                }

                replaceAssistantMessage(
                  assistantMessageId,
                  (
                    currentMessage
                  ) => ({
                    ...currentMessage,

                    content:
                      currentMessage.content +
                      (
                        payload.content ||
                        ""
                      ),

                    isLoading:
                      false,

                    isStreaming:
                      true,
                  })
                );
              },

            /**
             * Streaming completed.
             */
            onDone:
              async (
                payload
              ) => {
                /**
                 * Ignore stale streams.
                 */
                if (
                  activeRequestRef.current !==
                  requestId
                ) {
                  return;
                }

                replaceAssistantMessage(
                  assistantMessageId,
                  (
                    currentMessage
                  ) => ({
                    ...currentMessage,

                    content:
                      payload.fullResponse ||
                      currentMessage.content,

                    isLoading:
                      false,

                    isStreaming:
                      false,
                  })
                );

                /**
                 * Synchronize metadata.
                 */
                syncMetadata(
                  payload
                );

                /**
                 * Refresh sessions.
                 */
                await loadSessions(
                  socialAccountId
                );

                /**
                 * Cleanup uploads.
                 */
                clearImages?.();
              },

            /**
             * Stream error.
             */
            onError:
              (
                payload
              ) => {
                throw new Error(
                  payload.message ||
                    "Streaming failed."
                );
              },
          });
        } catch (error) {
          /**
           * Ignore abort lifecycle.
           */
          if (
            error?.name ===
              "AbortError" ||
            error?.cancelled
          ) {
            return;
          }

          console.error(
            "[AI STREAM ERROR]",
            error
          );

          /**
           * Ignore stale failures.
           */
          if (
            activeRequestRef.current !==
            requestId
          ) {
            return;
          }

          const cleanError =
            error.message ||
            "Failed to generate AI response.";

          setChatError(
            cleanError
          );

          /**
           * Convert placeholder
           * into stable error state.
           */
          replaceAssistantMessage(
            assistantMessageId,
            (
              currentMessage
            ) => ({
              ...currentMessage,

              content:
                cleanError,

              isLoading:
                false,

              isStreaming:
                false,

              isError: true,
            })
          );
        } finally {
          /**
           * Cleanup current request.
           */
          if (
            activeRequestRef.current ===
            requestId
          ) {
            activeRequestRef.current =
              null;

            abortControllerRef.current =
              null;
          }

          setChatLoading(
            false
          );

          setIsUploading(
            false
          );
        }
      },
      [
        activeSessionId,
        chatLoading,

        setMessages,

        setActiveSessionId,
        setSessionTitle,

        loadSessions,

        limitMessages,

        replaceAssistantMessage,

        syncMetadata,

        cancelStream,
      ]
    );

  return {
    /**
     * State.
     */
    input,

    setInput,

    chatLoading,

    isUploading,

    chatError,

    modelName,

    latencyMs,

    usageInfo,

    remainingUsage,

    /**
     * Actions.
     */
    sendMessage,

    cancelStream,
  };
};

export default useAIChat;