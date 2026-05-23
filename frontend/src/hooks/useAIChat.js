import {
  useCallback,
  useRef,
  useState,
} from "react";

import {
  sendAIChat,
  streamAIChat,
} from "../services/aiChatService.js";

/**
 * Production-grade AI orchestration hook.
 *
 * Responsibilities:
 * - optimistic rendering
 * - SSE streaming lifecycle
 * - upload-aware AI orchestration
 * - fallback AI lifecycle
 * - metadata synchronization
 * - stale stream prevention
 * - session synchronization
 */
const useAIChat = ({
  token,

  selectedAccount,

  activeSessionId,

  setActiveSessionId,

  setSessionTitle,

  setMessages,

  loadSessions,
}) => {
  /**
   * User input state.
   */
  const [input, setInput] =
    useState("");

  /**
   * AI lifecycle state.
   */
  const [chatLoading, setChatLoading] =
    useState(false);

  const [isUploading, setIsUploading] =
    useState(false);

  const [chatError, setChatError] =
    useState("");

  /**
   * AI metadata state.
   */
  const [modelName, setModelName] =
    useState("");

  const [latencyMs, setLatencyMs] =
    useState(null);

  /**
   * Usage telemetry state.
   */
  const [usageInfo, setUsageInfo] =
    useState(null);

  const [remainingUsage, setRemainingUsage] =
    useState(null);

  /**
   * Active stream protection.
   *
   * Prevents stale stream updates
   * from overwriting newer streams.
   */
  const activeStreamRef =
    useRef(null);

  /**
   * Prevent unbounded memory growth.
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
   * Safely replace assistant message.
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
   * Synchronize backend metadata safely.
   */
  const syncResponseMetadata =
    useCallback(
      (data = {}) => {
        if (
          data.sessionId
        ) {
          setActiveSessionId(
            data.sessionId
          );
        }

        if (
          data.sessionTitle
        ) {
          setSessionTitle(
            data.sessionTitle
          );
        }

        /**
         * AI metadata.
         */
        if (
          data.modelName !==
          undefined
        ) {
          setModelName(
            data.modelName ||
              ""
          );
        }

        if (
          data.latencyMs !==
          undefined
        ) {
          setLatencyMs(
            data.latencyMs ||
              null
          );
        }

        /**
         * Usage telemetry.
         */
        if (
          data.usage !==
          undefined
        ) {
          setUsageInfo(
            data.usage ||
              null
          );
        }

        if (
          data.remainingUsage !==
          undefined
        ) {
          setRemainingUsage(
            data.remainingUsage ??
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
   * Main AI orchestration lifecycle.
   */
  const sendMessage =
    useCallback(
      async ({
        message,

        selectedImages = [],

        clearImages,
      }) => {
        const trimmedMessage =
          message.trim();

        /**
         * Prevent invalid requests.
         */
        if (
          (!trimmedMessage &&
            selectedImages.length ===
              0) ||
          !selectedAccount ||
          !token ||
          chatLoading
        ) {
          return;
        }

        /**
         * Reset lifecycle state.
         */
        setChatError("");

        setChatLoading(
          true
        );

        setIsUploading(
          true
        );

        setInput("");

        /**
         * User-visible fallback content.
         */
        const userVisibleContent =
          trimmedMessage ||
          "Uploaded image(s) for analysis.";

        /**
         * Optimistic user message.
         */
        const optimisticUserMessage =
          {
            id: crypto.randomUUID(),

            role: "user",

            content:
              userVisibleContent,

            images:
              selectedImages.map(
                (
                  image
                ) => ({
                  imageUrl:
                    image.preview,
                })
              ),
          };

        /**
         * Assistant placeholder.
         */
        const assistantMessageId =
          crypto.randomUUID();

        const loadingAssistantMessage =
          {
            id: assistantMessageId,

            role:
              "assistant",

            content: "",

            images: [],

            isLoading: true,
          };

        /**
         * Immediate optimistic UI update.
         */
        setMessages(
          (prev) =>
            limitMessages([
              ...prev,
              optimisticUserMessage,
              loadingAssistantMessage,
            ])
        );

        /**
         * Track active stream instance.
         */
        const currentStreamId =
          crypto.randomUUID();

        activeStreamRef.current =
          currentStreamId;

        /**
         * Shared streamed content buffer.
         */
        let streamedContent =
          "";

        /**
         * Stream-safe stale guard.
         */
        const isStaleStream =
          () =>
            activeStreamRef.current !==
            currentStreamId;

        /**
         * Stream-safe assistant updater.
         */
        const updateAssistantContent =
          (
            content,
            extra = {}
          ) => {
            /**
             * Ignore stale streams.
             */
            if (
              isStaleStream()
            ) {
              return;
            }

            replaceAssistantMessage(
              assistantMessageId,
              (
                currentMessage
              ) => ({
                ...currentMessage,

                content,

                isLoading: false,

                ...extra,
              })
            );
          };

        try {
          /**
           * =========================
           * SSE STREAMING LIFECYCLE
           * =========================
           */
          await streamAIChat({
            accountId:
              selectedAccount._id,

            token,

            message:
              trimmedMessage,

            sessionId:
              activeSessionId,

            images:
              selectedImages.map(
                (
                  image
                ) =>
                  image.file
              ),

            /**
             * Session synchronization.
             */
            onSession: (
              data
            ) => {
              if (
                isStaleStream()
              ) {
                return;
              }

              syncResponseMetadata(
                data
              );
            },

            /**
             * AI metadata synchronization.
             */
            onModel: (
              data
            ) => {
              if (
                isStaleStream()
              ) {
                return;
              }

              setModelName(
                data.modelName ||
                  ""
              );
            },

            /**
             * Live chunk streaming.
             */
            onChunk: (
              data
            ) => {
              if (
                isStaleStream()
              ) {
                return;
              }

              streamedContent +=
                data.chunk ||
                "";

              updateAssistantContent(
                streamedContent
              );
            },

            /**
             * Stream completion.
             */
            onDone: async (
              data
            ) => {
              if (
                isStaleStream()
              ) {
                return;
              }

              /**
               * Final assistant synchronization.
               */
              updateAssistantContent(
                streamedContent,
                {
                  ...(data.assistantMessage ||
                    {}),
                }
              );

              /**
               * Metadata synchronization.
               */
              syncResponseMetadata(
                data
              );

              /**
               * Refresh sidebar sessions.
               */
              await loadSessions(
                selectedAccount._id
              );
            },

            /**
             * Stream event failure.
             */
            onError: (
              data
            ) => {
              throw {
                message:
                  data?.message ||
                  "Streaming failed.",
              };
            },
          });

          /**
           * Cleanup uploads after success.
           */
          clearImages?.();
        } catch (streamError) {
          console.error(
            "[SSE STREAM ERROR]",
            streamError
          );

          /**
           * Ignore stale failures.
           */
          if (
            isStaleStream()
          ) {
            return;
          }

          /**
           * =========================
           * FALLBACK AI LIFECYCLE
           * =========================
           */
          try {
            const response =
              await sendAIChat({
                accountId:
                  selectedAccount._id,

                token,

                message:
                  trimmedMessage,

                sessionId:
                  activeSessionId,

                images:
                  selectedImages.map(
                    (
                      image
                    ) =>
                      image.file
                  ),
              });

            /**
             * Ignore stale fallback responses.
             */
            if (
              isStaleStream()
            ) {
              return;
            }

            /**
             * Replace assistant safely.
             */
            updateAssistantContent(
              response
                .assistantMessage
                ?.content ||
                "",
              {
                ...(response.assistantMessage ||
                  {}),
              }
            );

            /**
             * Synchronize backend metadata.
             */
            syncResponseMetadata(
              response
            );

            /**
             * Refresh sidebar sessions.
             */
            await loadSessions(
              selectedAccount._id
            );

            /**
             * Cleanup uploads.
             */
            clearImages?.();
          } catch (
            fallbackError
          ) {
            console.error(
              "[FALLBACK AI ERROR]",
              fallbackError
            );

            /**
             * Interceptor-normalized error.
             */
            const cleanError =
              fallbackError.message ||
              "Failed to generate AI response.";

            setChatError(
              cleanError
            );

            /**
             * Convert assistant bubble
             * into stable error state.
             */
            updateAssistantContent(
              cleanError,
              {
                isError: true,
              }
            );
          }
        } finally {
          /**
           * Cleanup ONLY current stream.
           *
           * Prevent stale cleanup
           * from clearing newer streams.
           */
          if (
            activeStreamRef.current ===
            currentStreamId
          ) {
            activeStreamRef.current =
              null;
          }

          /**
           * Reset lifecycle state.
           */
          setChatLoading(
            false
          );

          setIsUploading(
            false
          );
        }
      },
      [
        token,
        selectedAccount,
        activeSessionId,
        chatLoading,

        setMessages,
        setActiveSessionId,
        setSessionTitle,

        loadSessions,

        limitMessages,
        replaceAssistantMessage,
        syncResponseMetadata,
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
  };
};

export default useAIChat;