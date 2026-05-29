import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";

/**
 * Production-grade AI chat input.
 *
 * Handles:
 * - text input
 * - autosizing textarea
 * - uploads
 * - keyboard shortcuts
 * - voice lifecycle
 * - streaming lifecycle
 * - stream cancellation
 */
const ChatInput = ({
  /**
   * Input state.
   */
  input,
  setInput,

  /**
   * AI lifecycle.
   */
  onSend,
  onCancel,

  /**
   * Upload lifecycle.
   */
  onImageChange,

  /**
   * Voice lifecycle.
   */
  onVoiceClick,

  /**
   * UI states.
   */
  disabled = false,

  chatLoading = false,

  isListening = false,

  /**
   * Usage limits.
   */
  isUsageLimitReached = false,

  /**
   * Upload state.
   */
  selectedImages = [],
}) => {
  /**
   * Hidden upload input.
   */
  const fileInputRef =
    useRef(null);

  /**
   * Autosize textarea ref.
   */
  const textareaRef =
    useRef(null);

  /**
   * Stable disabled state.
   */
  const isInputDisabled =
    useMemo(() => {
      return (
        disabled ||
        isUsageLimitReached
      );
    }, [
      disabled,
      isUsageLimitReached,
    ]);

  /**
   * Stable send availability.
   */
  const isSendDisabled =
    useMemo(() => {
      return (
        isInputDisabled ||
        chatLoading ||
        (!input.trim() &&
          selectedImages.length ===
            0)
      );
    }, [
      isInputDisabled,
      chatLoading,
      input,
      selectedImages.length,
    ]);

  /**
   * Stable textarea autosizing.
   */
  useEffect(() => {
    const textarea =
      textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height =
      "auto";

    textarea.style.height = `${Math.min(
      textarea.scrollHeight,
      220
    )}px`;
  }, [input]);

  /**
   * Stable upload trigger.
   */
  const handleUploadClick =
    useCallback(() => {
      if (
        isInputDisabled ||
        chatLoading
      ) {
        return;
      }

      fileInputRef.current?.click();
    }, [
      isInputDisabled,
      chatLoading,
    ]);

  /**
   * Stable send lifecycle.
   */
  const handleSend =
    useCallback(() => {
      if (
        isSendDisabled
      ) {
        return;
      }

      onSend?.();
    }, [
      isSendDisabled,
      onSend,
    ]);

  /**
   * Stable stream cancellation.
   */
  const handleCancel =
    useCallback(() => {
      onCancel?.();
    }, [onCancel]);

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
    useCallback(
      (event) => {
        if (
          event.key ===
            "Enter" &&
          !event.shiftKey
        ) {
          event.preventDefault();

          handleSend();
        }
      },
      [handleSend]
    );

  /**
   * Stable image lifecycle.
   */
  const handleFileChange =
    useCallback(
      (event) => {
        onImageChange?.(
          event
        );

        /**
         * Allow same-image reupload.
         */
        event.target.value = "";
      },
      [onImageChange]
    );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      {/* Usage Limit */}
      {isUsageLimitReached && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Daily AI usage limit
          reached. Please upgrade
          your plan or wait for
          reset.
        </div>
      )}

      {/* Main Input Layout */}
      <div className="flex flex-col gap-3 md:flex-row">
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          aria-label="AI chat input"
          data-testid="chat-input"
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
            isInputDisabled
          }
          placeholder={
            isUsageLimitReached
              ? "Daily limit reached"
              : "Ask AI about analytics, growth, content strategy, or upload images..."
          }
          className="max-h-[220px] min-h-[56px] flex-1 resize-none overflow-y-auto rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none transition-colors focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-70"
        />

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Hidden Upload Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={
              handleFileChange
            }
            disabled={
              isInputDisabled ||
              chatLoading
            }
            className="hidden"
          />

          {/* Upload Button */}
          <button
            data-testid="upload-button"
            type="button"
            onClick={
              handleUploadClick
            }
            disabled={
              isInputDisabled ||
              chatLoading
            }
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Images
          </button>

          {/* Voice Button */}
          <button
            data-testid="voice-button"
            type="button"
            onClick={
              onVoiceClick
            }
            disabled={
              isInputDisabled ||
              chatLoading
            }
            className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              isListening
                ? "border-red-300 bg-red-50 text-red-600"
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {isListening
              ? "Listening..."
              : "Voice"}
          </button>

          {/* Stream Cancel Button */}
          {chatLoading ? (
            <button
              data-testid="stop-stream-button"
              type="button"
              onClick={
                handleCancel
              }
              className="rounded-xl border border-red-200 bg-red-50 px-5 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
            >
              Stop
            </button>
          ) : (
            /**
             * Send Button
             */
            <button
              data-testid="send-button"
              type="button"
              onClick={
                handleSend
              }
              disabled={
                isSendDisabled
              }
              className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Send
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 flex flex-col gap-1 text-xs text-gray-500 md:flex-row md:items-center md:justify-between">
        <p>
          Press Enter to send.
          Shift + Enter for
          newline.
        </p>

        {chatLoading && (
          <p
            className="text-blue-500"
            aria-live="polite"
          >
            AI is generating a
            response...
          </p>
        )}

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

/**
 * Prevent unnecessary rerenders.
 */
export default memo(
  ChatInput
);