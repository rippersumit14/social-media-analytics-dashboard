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
 * - copy buttons
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
   * Message role helpers.
   */
  const isUser =
    message.role === "user";

  const isAssistant =
    message.role ===
    "assistant";

  /**
   * Message UI states.
   */
  const isLoading =
    message.isLoading;

  const isError =
    message.isError;

  /**
   * Safe image array.
   */
  const images =
    Array.isArray(
      message.images
    )
      ? message.images
      : [];

  /**
   * Simple text renderer.
   *
   * Future:
   * markdown rendering
   * can replace this safely.
   */
  const renderContent = (
    content
  ) => {
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
          (
            line,
            index
          ) => (
            <p
              key={index}
              className="text-sm leading-6 whitespace-pre-wrap break-words"
            >
              {line}
            </p>
          )
        )}
      </div>
    );
  };

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
          className={`rounded-2xl px-4 py-3 shadow-sm transition ${
            isUser
              ? "rounded-br-md bg-blue-600 text-white"
              : isError
              ? "rounded-bl-md border border-red-200 bg-red-50 text-red-700"
              : "rounded-bl-md border border-gray-100 bg-white text-gray-800"
          }`}
        >
          {/* Images */}
          {images.length >
            0 && (
            <div className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-3">
              {images.map(
                (
                  image,
                  index
                ) => (
                  <div
                    key={`${message.id}-${index}`}
                    className="overflow-hidden rounded-xl border border-gray-200 bg-gray-100"
                  >
                    <img
                      src={
                        image.imageUrl
                      }
                      alt={`Uploaded ${index}`}
                      loading="lazy"
                      className="max-h-60 w-full object-cover"
                    />
                  </div>
                )
              )}
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
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
          ) : (
            <>
              {/* Message Content */}
              {renderContent(
                message.content
              )}

              {/* Metadata */}
              {isAssistant &&
                !isError &&
                (message.model ||
                  message.latencyMs) && (
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

export default ChatMessage;