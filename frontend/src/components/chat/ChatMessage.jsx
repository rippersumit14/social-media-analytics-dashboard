import {
  memo,
  useMemo,
} from "react";

/**
 * Stable streaming cursor.
 *
 * ChatGPT-style typing feel.
 */
const StreamingCursor =
  memo(() => {
    return (
      <span className="ml-1 inline-block animate-pulse font-semibold text-gray-400">
        ▋
      </span>
    );
  });

StreamingCursor.displayName =
  "StreamingCursor";

/**
 * Stable text content renderer.
 *
 * Future-ready for:
 * - markdown
 * - syntax highlighting
 * - code blocks
 */
const MessageContent = memo(
  ({
    content,
    isStreaming =
      false,
  }) => {
    if (!content) {
      return null;
    }

    /**
     * Preserve AI formatting.
     *
     * Important for:
     * - markdown
     * - code blocks
     * - spacing
     * - lists
     */
    const lines =
      content.split("\n");

    return (
      <div
        className="space-y-2"
        aria-live={
          isStreaming
            ? "polite"
            : undefined
        }
      >
        {lines.map(
          (line, index) => (
            <p
              key={index}
              className="break-words whitespace-pre-wrap text-sm leading-6"
            >
              {
                line ||
                "\u00A0"
              }

              {/* Live streaming cursor */}
              {isStreaming &&
                index ===
                  lines.length -
                    1 && (
                  <StreamingCursor />
                )}
            </p>
          )
        )}
      </div>
    );
  }
);

MessageContent.displayName =
  "MessageContent";

/**
 * Stable AI loading indicator.
 */
const LoadingIndicator = memo(
  () => {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></span>

          <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]"></span>

          <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]"></span>
        </div>

        <span className="text-sm text-gray-500">
          AI is thinking...
        </span>
      </div>
    );
  }
);

LoadingIndicator.displayName =
  "LoadingIndicator";

/**
 * Stable image gallery renderer.
 */
const MessageImages = memo(
  ({
    images = [],
    messageId,
  }) => {
    if (!images.length) {
      return null;
    }

    return (
      <div className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-3">
        {images.map(
          (
            image,
            index
          ) => (
            <div
              key={`${messageId}-${index}`}
              className="overflow-hidden rounded-xl border border-gray-200 bg-gray-100"
            >
              <img
                src={
                  image.imageUrl
                }
                alt={`Uploaded ${index}`}
                loading="lazy"
                className="max-h-60 w-full object-cover transition"

                /**
                 * Prevent layout corruption
                 * from failed image loads.
                 */
                onError={(
                  event
                ) => {
                  event.target.style.display =
                    "none";
                }}
              />
            </div>
          )
        )}
      </div>
    );
  }
);

MessageImages.displayName =
  "MessageImages";

/**
 * Production-grade chat message bubble.
 *
 * Handles:
 * - user messages
 * - assistant messages
 * - streamed responses
 * - AI loading states
 * - image rendering
 * - metadata rendering
 * - error states
 *
 * Future-ready for:
 * - markdown
 * - code blocks
 * - syntax highlighting
 * - copy actions
 */
const ChatMessage = ({
  message,
}) => {
  /**
   * Safety guard.
   */
  if (!message) {
    return null;
  }

  /**
   * Stable role helpers.
   */
  const isUser =
    message.role === "user";

  const isAssistant =
    message.role ===
    "assistant";

  /**
   * Stable lifecycle states.
   */
  const isLoading =
    Boolean(
      message.isLoading
    );

  const isError = Boolean(
    message.isError
  );

  /**
   * Streaming state.
   *
   * Active during:
   * SSE chunk rendering.
   */
  const isStreaming =
    isAssistant &&
    !isLoading &&
    !isError &&
    Boolean(
      message.isStreaming
    );

  /**
   * Stable images array.
   */
  const images =
    Array.isArray(
      message.images
    )
      ? message.images
      : [];

  /**
   * Stable bubble styles.
   */
  const bubbleStyles =
    useMemo(() => {
      if (isUser) {
        return "rounded-br-md bg-blue-600 text-white";
      }

      if (isError) {
        return "rounded-bl-md border border-red-200 bg-red-50 text-red-700";
      }

      return "rounded-bl-md border border-gray-100 bg-white text-gray-800";
    }, [
      isUser,
      isError,
    ]);

  /**
   * Stable metadata visibility.
   */
  const showMetadata =
    useMemo(() => {
      return (
        isAssistant &&
        !isLoading &&
        !isError &&
        (message.model ||
          message.latencyMs)
      );
    }, [
      isAssistant,
      isLoading,
      isError,
      message.model,
      message.latencyMs,
    ]);

  return (
    <div
      role="article"
      aria-label={`${message.role} message`}
      data-testid={`chat-message-${message.role}`}
      className={`flex ${
        isUser
          ? "justify-end"
          : "justify-start"
      }`}
    >
      <div className="max-w-[88%] md:max-w-[80%]">
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm transition-colors duration-200 ${bubbleStyles}`}
        >
          {/* Images */}
          <MessageImages
            images={images}
            messageId={
              message.id
            }
          />

          {/* AI Loading */}
          {isLoading ? (
            <LoadingIndicator />
          ) : (
            <>
              {/* Streamed Message Content */}
              <MessageContent
                content={
                  message.content
                }
                isStreaming={
                  isStreaming
                }
              />

              {/* AI Metadata */}
              {showMetadata && (
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-50 pt-2 text-xs text-gray-400">
                  {message.model && (
                    <span>
                      {
                        message.model
                      }
                    </span>
                  )}

                  {message.latencyMs && (
                    <span>
                      •{" "}
                      {
                        message.latencyMs
                      }
                      ms
                    </span>
                  )}

                  {/* Streaming Status */}
                  {isStreaming && (
                    <span className="text-blue-500">
                      • streaming
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Prevent unnecessary rerenders.
 */
export default memo(
  ChatMessage
);