import { useRef } from "react";

/**
 * Production-grade chat input.
 *
 * Handles:
 * - text input
 * - image uploads
 * - send actions
 * - keyboard shortcuts
 * - voice trigger
 */
const ChatInput = ({
  /**
   * Input state.
   */
  input,
  setInput,

  /**
   * Send action.
   */
  onSend,

  /**
   * Upload actions.
   */
  onImageChange,

  /**
   * Voice actions.
   */
  onVoiceClick,

  /**
   * UI states.
   */
  disabled = false,

  chatLoading = false,

  isListening = false,

  /**
   * Usage limit.
   */
  isUsageLimitReached = false,

  /**
   * Upload state.
   */
  selectedImages = [],
}) => {
  /**
   * Hidden file input ref.
   */
  const fileInputRef =
    useRef(null);

  /**
   * Trigger image upload picker.
   */
  const handleUploadClick =
    () => {
      if (
        disabled ||
        chatLoading
      ) {
        return;
      }

      fileInputRef.current?.click();
    };

  /**
   * Send message handler.
   */
  const handleSend =
    () => {
      if (
        disabled ||
        chatLoading
      ) {
        return;
      }

      onSend?.();
    };

  /**
   * Keyboard shortcuts.
   *
   * Enter:
   * send message
   *
   * Shift + Enter:
   * newline
   */
  const handleKeyDown =
    (event) => {
      if (
        event.key ===
          "Enter" &&
        !event.shiftKey
      ) {
        event.preventDefault();

        handleSend();
      }
    };

  /**
   * Disable send conditions.
   */
  const isSendDisabled =
    disabled ||
    chatLoading ||
    isUsageLimitReached ||
    (!input.trim() &&
      selectedImages.length ===
        0);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      {/* Usage Limit */}
      {isUsageLimitReached && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Daily AI usage limit reached.
          Please upgrade your plan or
          wait for reset.
        </div>
      )}

      {/* Main Input Layout */}
      <div className="flex flex-col gap-3 md:flex-row">
        {/* Textarea */}
        <textarea
          rows={2}
          value={input}
          onChange={(event) =>
            setInput(
              event.target.value
            )
          }
          onKeyDown={
            handleKeyDown
          }
          disabled={
            disabled ||
            chatLoading ||
            isUsageLimitReached
          }
          placeholder={
            isUsageLimitReached
              ? "Daily limit reached"
              : "Ask AI about analytics, growth, content strategy, or upload images..."
          }
          className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-70"
        />

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Hidden Upload Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={
              onImageChange
            }
            disabled={
              disabled ||
              chatLoading ||
              isUsageLimitReached
            }
            className="hidden"
          />

          {/* Upload Button */}
          <button
            type="button"
            onClick={
              handleUploadClick
            }
            disabled={
              disabled ||
              chatLoading ||
              isUsageLimitReached
            }
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Images
          </button>

          {/* Voice Button */}
          <button
            type="button"
            onClick={
              onVoiceClick
            }
            disabled={
              disabled ||
              chatLoading ||
              isUsageLimitReached
            }
            className={`rounded-xl border px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
              isListening
                ? "border-red-300 bg-red-50 text-red-600"
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {isListening
              ? "Listening..."
              : "Voice"}
          </button>

          {/* Send Button */}
          <button
            type="button"
            onClick={
              handleSend
            }
            disabled={
              isSendDisabled
            }
            className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {chatLoading
              ? "Sending..."
              : "Send"}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 flex flex-col gap-1 text-xs text-gray-500 md:flex-row md:items-center md:justify-between">
        <p>
          Press Enter to send.
          Shift + Enter for newline.
        </p>

        {selectedImages.length >
          0 && (
          <p>
            {
              selectedImages.length
            }{" "}
            image
            {selectedImages.length >
            1
              ? "s"
              : ""}{" "}
            selected
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatInput;