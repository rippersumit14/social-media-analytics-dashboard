import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/**
 * -------------------------------------------------------
 * Production-grade multimodal AI input.
 * -------------------------------------------------------
 *
 * Handles:
 * - text input
 * - autosize textarea
 * - keyboard shortcuts
 * - drag/drop uploads
 * - voice lifecycle
 * - streaming cancel lifecycle
 * - upload orchestration
 * - duplicate send prevention
 */
const ChatInput = ({
  /**
   * Input lifecycle.
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
   * UI lifecycle.
   */
  disabled = false,

  chatLoading = false,

  isListening = false,

  /**
   * Usage lifecycle.
   */
  isUsageLimitReached = false,

  /**
   * Upload state.
   */
  selectedImages = [],
}) => {
  /**
   * -------------------------------------------------------
   * Hidden upload input.
   * -------------------------------------------------------
   */
  const fileInputRef =
    useRef(null);

  /**
   * -------------------------------------------------------
   * Autosize textarea.
   * -------------------------------------------------------
   */
  const textareaRef =
    useRef(null);

  /**
   * -------------------------------------------------------
   * Drag lifecycle.
   * -------------------------------------------------------
   */
  const [isDragging, setIsDragging] =
    useState(false);

  /**
   * -------------------------------------------------------
   * Prevent rapid duplicate sends.
   * -------------------------------------------------------
   */
  const sendLockRef =
    useRef(false);

  /**
   * -------------------------------------------------------
   * Stable disabled state.
   * -------------------------------------------------------
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
   * -------------------------------------------------------
   * Stable send state.
   * -------------------------------------------------------
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
   * -------------------------------------------------------
   * Release send lock.
   * -------------------------------------------------------
   */
  useEffect(() => {
    if (!chatLoading) {
      sendLockRef.current =
        false;
    }
  }, [chatLoading]);

  /**
   * -------------------------------------------------------
   * Stable textarea autosizing.
   * -------------------------------------------------------
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
      240
    )}px`;
  }, [input]);

  /**
   * -------------------------------------------------------
   * Upload trigger lifecycle.
   * -------------------------------------------------------
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
   * -------------------------------------------------------
   * Stable send lifecycle.
   * -------------------------------------------------------
   */
  const handleSend =
    useCallback(() => {
      if (
        isSendDisabled ||
        sendLockRef.current
      ) {
        return;
      }

      /**
       * Prevent rapid Enter spam.
       */
      sendLockRef.current =
        true;

      onSend?.();
    }, [
      isSendDisabled,
      onSend,
    ]);

  /**
   * -------------------------------------------------------
   * Stream cancellation lifecycle.
   * -------------------------------------------------------
   */
  const handleCancel =
    useCallback(() => {
      sendLockRef.current =
        false;

      onCancel?.();
    }, [onCancel]);

  /**
   * -------------------------------------------------------
   * Keyboard lifecycle.
   * -------------------------------------------------------
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
   * -------------------------------------------------------
   * Upload lifecycle.
   * -------------------------------------------------------
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

  /**
   * -------------------------------------------------------
   * Drag lifecycle.
   * -------------------------------------------------------
   */
  const handleDragOver =
    useCallback(
      (event) => {
        event.preventDefault();

        if (
          isInputDisabled
        ) {
          return;
        }

        setIsDragging(
          true
        );
      },
      [isInputDisabled]
    );

  const handleDragLeave =
    useCallback(
      (event) => {
        event.preventDefault();

        setIsDragging(
          false
        );
      },
      []
    );

  /**
   * -------------------------------------------------------
   * Drop upload lifecycle.
   * -------------------------------------------------------
   */
  const handleDrop =
    useCallback(
      (event) => {
        event.preventDefault();

        setIsDragging(
          false
        );

        if (
          isInputDisabled
        ) {
          return;
        }

        const files =
          event.dataTransfer
            ?.files;

        if (
          !files ||
          files.length === 0
        ) {
          return;
        }

        onImageChange?.({
          target: {
            files,
            value: "",
          },
        });
      },
      [
        isInputDisabled,
        onImageChange,
      ]
    );

  return (
    <div
      data-testid="chat-input-wrapper"
      onDragOver={
        handleDragOver
      }
      onDragLeave={
        handleDragLeave
      }
      onDrop={handleDrop}
      className={`rounded-2xl border bg-white p-4 transition-all duration-200 ${
        isDragging
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200"
      }`}
    >
      {/* ------------------------------------------------ */}
      {/* Usage Limit */}
      {/* ------------------------------------------------ */}
      {isUsageLimitReached && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Daily AI usage limit
          reached.
        </div>
      )}

      {/* ------------------------------------------------ */}
      {/* Main Layout */}
      {/* ------------------------------------------------ */}
      <div className="flex flex-col gap-4 md:flex-row">
        {/* ------------------------------------------------ */}
        {/* Textarea */}
        {/* ------------------------------------------------ */}
        <div className="flex-1">
          <textarea
            ref={textareaRef}
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
                ? "Daily usage limit reached"
                : "Ask AI about analytics, growth, OCR insights, or upload images..."
            }
            className="max-h-[240px] min-h-[60px] w-full resize-none overflow-y-auto rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none transition-colors focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-70"
          />

          {/* Drag State */}
          {isDragging && (
            <div className="mt-2 rounded-xl border border-dashed border-blue-400 bg-blue-50 px-4 py-3 text-center text-sm text-blue-600">
              Drop images here
            </div>
          )}
        </div>

        {/* ------------------------------------------------ */}
        {/* Actions */}
        {/* ------------------------------------------------ */}
        <div className="flex flex-wrap items-start gap-2">
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

          {/* Upload */}
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
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Images
          </button>

          {/* Voice */}
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

          {/* Stop Streaming */}
          {chatLoading ? (
            <button
              data-testid="stop-stream-button"
              type="button"
              onClick={
                handleCancel
              }
              className="rounded-xl border border-red-200 bg-red-50 px-5 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
            >
              Stop
            </button>
          ) : (
            /**
             * Send
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
              className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Send
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------ */}
      {/* Footer */}
      {/* ------------------------------------------------ */}
      <div className="mt-4 flex flex-col gap-2 text-xs text-gray-500 md:flex-row md:items-center md:justify-between">
        <p>
          Press Enter to send.
          Shift + Enter for
          newline.
        </p>

        {chatLoading && (
          <p
            aria-live="polite"
            className="text-blue-600"
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

export default memo(
  ChatInput
);