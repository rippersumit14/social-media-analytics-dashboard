import {
  memo,
  useMemo,
} from "react";

/**
 * -------------------------------------------------------
 * Streaming cursor renderer.
 * -------------------------------------------------------
 */
const StreamingCursor =
  memo(() => {
    return (
      <span className="ml-1 inline-block animate-pulse text-gray-400">
        ▋
      </span>
    );
  });

StreamingCursor.displayName =
  "StreamingCursor";

/**
 * -------------------------------------------------------
 * AI loading renderer.
 * -------------------------------------------------------
 */
const LoadingIndicator =
  memo(() => {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></span>

          <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:120ms]"></span>

          <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:240ms]"></span>
        </div>

        <span className="text-sm text-gray-500">
          AI is thinking...
        </span>
      </div>
    );
  });

LoadingIndicator.displayName =
  "LoadingIndicator";

/**
 * -------------------------------------------------------
 * Stable multiline renderer.
 * -------------------------------------------------------
 *
 * Handles:
 * - streamed responses
 * - large responses
 * - multiline rendering
 * - progressive token rendering
 */
const MessageContent = memo(
  ({
    content = "",

    isStreaming =
      false,
  }) => {
    if (!content) {
      return null;
    }

    /**
     * Prevent malformed rendering.
     */
    const safeContent =
      String(content);

    /**
     * Prevent huge rendering explosions.
     */
    const lines =
      safeContent
        .slice(0, 50000)
        .split("\n");

    return (
      <div
        aria-live={
          isStreaming
            ? "polite"
            : undefined
        }
        className="space-y-2"
      >
        {lines.map(
          (
            line,
            index
          ) => (
            <p
              key={`${index}-${line.length}`}
              className="break-words whitespace-pre-wrap text-sm leading-7"
            >
              {line ||
                "\u00A0"}

              {/* Streaming Cursor */}
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
 * -------------------------------------------------------
 * Stable image renderer.
 * -------------------------------------------------------
 *
 * Handles:
 * - OCR uploads
 * - multimodal previews
 * - backend image URLs
 * - upload previews
 */
const MessageImages = memo(
  ({
    images = [],

    messageId,
  }) => {
    if (
      !Array.isArray(
        images
      ) ||
      images.length === 0
    ) {
      return null;
    }

    /**
     * Filter invalid images safely.
     */
    const validImages =
      images.filter(
        (image) =>
          image?.imageUrl
      );

    if (
      validImages.length ===
      0
    ) {
      return null;
    }

    return (
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        {validImages.map(
          (
            image,
            index
          ) => (
            <div
              key={`${messageId}-${index}`}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-100"
            >
              <img
                src={
                  image.imageUrl
                }
                alt={`upload-${index}`}
                loading="lazy"
                className="max-h-72 w-full object-cover transition duration-200 hover:scale-[1.01]"

                /**
                 * Prevent broken image layouts.
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
 * -------------------------------------------------------
 * Format timestamp safely.
 * -------------------------------------------------------
 */
const formatTimestamp = (
  value
) => {
  if (!value) {
    return "";
  }

  try {
    return new Date(
      value
    ).toLocaleTimeString(
      [],
      {
        hour: "numeric",
        minute:
          "2-digit",
      }
    );
  } catch {
    return "";
  }
};

/**
 * -------------------------------------------------------
 * Production-grade AI chat message.
 * -------------------------------------------------------
 *
 * Handles:
 * - user messages
 * - assistant messages
 * - SSE streaming
 * - OCR image rendering
 * - multimodal rendering
 * - metadata rendering
 * - loading states
 * - error states
 * - large responses
 */
const ChatMessage = ({
  message,
}) => {
  /**
   * -------------------------------------------------------
   * Prevent malformed rendering.
   * -------------------------------------------------------
   */
  if (
    !message ||
    typeof message !==
      "object"
  ) {
    return null;
  }

  /**
   * -------------------------------------------------------
   * Role lifecycle.
   * -------------------------------------------------------
   */
  const isUser =
    message.role === "user";

  const isAssistant =
    message.role ===
    "assistant";

  /**
   * -------------------------------------------------------
   * Status lifecycle.
   * -------------------------------------------------------
   */
  const isLoading =
    Boolean(
      message.isLoading
    );

  const isError = Boolean(
    message.isError
  );

  const isStreaming =
    Boolean(
      message.isStreaming
    );

  /**
   * -------------------------------------------------------
   * Safe images lifecycle.
   * -------------------------------------------------------
   */
  const images =
    Array.isArray(
      message.images
    )
      ? message.images
      : [];

  /**
   * -------------------------------------------------------
   * Safe content lifecycle.
   * -------------------------------------------------------
   */
  const safeContent =
    typeof message.content ===
    "string"
      ? message.content
      : "";

  /**
   * -------------------------------------------------------
   * Stable bubble styles.
   * -------------------------------------------------------
   */
  const bubbleStyles =
    useMemo(() => {
      if (isUser) {
        return "bg-blue-600 text-white rounded-br-md";
      }

      if (isError) {
        return "bg-red-50 border border-red-200 text-red-700 rounded-bl-md";
      }

      return "bg-white border border-gray-200 text-gray-800 rounded-bl-md";
    }, [
      isUser,
      isError,
    ]);

  /**
   * -------------------------------------------------------
   * Metadata lifecycle.
   * -------------------------------------------------------
   */
  const showMetadata =
    useMemo(() => {
      return (
        isAssistant &&
        !isLoading &&
        (message.model ||
          message.latencyMs ||
          message.createdAt ||
          isStreaming)
      );
    }, [
      isAssistant,
      isLoading,
      message.model,
      message.latencyMs,
      message.createdAt,
      isStreaming,
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
      <div className="max-w-[92%] md:max-w-[80%]">
        {/* ------------------------------------------------ */}
        {/* Role Label */}
        {/* ------------------------------------------------ */}
        <div
          className={`mb-1 px-1 text-[11px] font-medium ${
            isUser
              ? "text-right text-blue-600"
              : isError
                ? "text-red-500"
                : "text-gray-500"
          }`}
        >
          {isUser
            ? "You"
            : isError
              ? "AI Error"
              : "AI Assistant"}
        </div>

        {/* ------------------------------------------------ */}
        {/* Bubble */}
        {/* ------------------------------------------------ */}
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm transition-all duration-200 ${bubbleStyles}`}
        >
          {/* ------------------------------------------------ */}
          {/* Images */}
          {/* ------------------------------------------------ */}
          <MessageImages
            images={images}
            messageId={
              message._id ||
              message.id
            }
          />

          {/* ------------------------------------------------ */}
          {/* Loading */}
          {/* ------------------------------------------------ */}
          {isLoading ? (
            <LoadingIndicator />
          ) : (
            <>
              {/* ------------------------------------------------ */}
              {/* Content */}
              {/* ------------------------------------------------ */}
              <MessageContent
                content={
                  safeContent
                }
                isStreaming={
                  isStreaming
                }
              />

              {/* ------------------------------------------------ */}
              {/* Metadata */}
              {/* ------------------------------------------------ */}
              {showMetadata && (
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-2 text-[11px] text-gray-400">
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

                  {message.createdAt && (
                    <span>
                      •{" "}
                      {formatTimestamp(
                        message.createdAt
                      )}
                    </span>
                  )}

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

export default memo(
  ChatMessage
);