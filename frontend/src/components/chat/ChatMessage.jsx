import { memo, useMemo } from "react";

/**
 * Stable text content renderer.
 *
 * Future-ready for:
 * - markdown
 * - syntax highlighting
 * - code blocks
 */
const MessageContent = memo(
  ({ content }) => {
    if (!content) {
      return null;
    }

    const lines = content
      .split("\n")
      .map((line) =>
        line.trim()
      )
      .filter(Boolean);

    return (
      <div className="space-y-2">
        {lines.map(
          (line, index) => (
            <p
              key={index}
              className="break-words whitespace-pre-wrap text-sm leading-6"
            >
              {line}
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
          AI is analyzing...
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
  ({ images = [], messageId }) => {
    if (!images.length) {
      return null;
    }

    return (
      <div className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-3">
        {images.map(
          (image, index) => (
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
                className="max-h-60 w-full object-cover"

                /**
                 * Prevent broken layout
                 * on failed image loads.
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
 * Supports:
 * - assistant messages
 * - user messages
 * - image galleries
 * - loading states
 * - error states
 *
 * Future-ready for:
 * - markdown
 * - code blocks
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
   * Stable UI states.
   */
  const isLoading =
    Boolean(
      message.isLoading
    );

  const isError = Boolean(
    message.isError
  );

  /**
   * Stable images array.
   */
  const images = useMemo(() => {
    return Array.isArray(
      message.images
    )
      ? message.images
      : [];
  }, [message.images]);

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
        !isError &&
        (message.model ||
          message.latencyMs)
      );
    }, [
      isAssistant,
      isError,
      message.model,
      message.latencyMs,
    ]);

  return (
    <div
      className={`flex ${
        isUser
          ? "justify-end"
          : "justify-start"
      }`}
    >
      <div className="max-w-[88%] md:max-w-[80%]">
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm transition ${bubbleStyles}`}
        >
          {/* Images */}
          <MessageImages
            images={images}
            messageId={
              message.id
            }
          />

          {/* Loading */}
          {isLoading ? (
            <LoadingIndicator />
          ) : (
            <>
              {/* Message Content */}
              <MessageContent
                content={
                  message.content
                }
              />

              {/* AI Metadata */}
              {showMetadata && (
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-2 text-xs text-gray-400">
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