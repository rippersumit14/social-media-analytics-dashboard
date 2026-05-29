import {
  memo,
  useCallback,
  useMemo,
} from "react";

/**
 * -------------------------------------------------------
 * Format file size safely.
 * -------------------------------------------------------
 */
const formatFileSize = (
  bytes = 0
) => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (
    bytes <
    1024 * 1024
  ) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(1)} MB`;
};

/**
 * -------------------------------------------------------
 * Upload lifecycle badge.
 * -------------------------------------------------------
 */
const UploadStatusBadge =
  memo(({ status }) => {
    /**
     * Stable status styles.
     */
    const statusConfig = {
      pending: {
        label: "Ready",
        styles:
          "bg-blue-50 text-blue-600 border-blue-100",
      },

      uploading: {
        label:
          "Uploading",
        styles:
          "bg-amber-50 text-amber-600 border-amber-100",
      },

      processing: {
        label:
          "Analyzing",
        styles:
          "bg-purple-50 text-purple-600 border-purple-100",
      },

      completed: {
        label:
          "Completed",
        styles:
          "bg-green-50 text-green-600 border-green-100",
      },

      error: {
        label: "Error",
        styles:
          "bg-red-50 text-red-600 border-red-100",
      },
    };

    const config =
      statusConfig[
        status
      ] ||
      statusConfig.pending;

    return (
      <span
        className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${config.styles}`}
      >
        {config.label}
      </span>
    );
  });

UploadStatusBadge.displayName =
  "UploadStatusBadge";

/**
 * -------------------------------------------------------
 * Stable upload preview card.
 * -------------------------------------------------------
 *
 * Handles:
 * - OCR previews
 * - multimodal uploads
 * - upload lifecycle rendering
 * - upload processing states
 * - retry-safe rendering
 */
const UploadPreviewCard =
  memo(
    ({
      image,

      disabled,

      onRemoveImage,
    }) => {
      /**
       * Prevent malformed rendering.
       */
      if (
        !image ||
        typeof image !==
          "object"
      ) {
        return null;
      }

      /**
       * Stable remove lifecycle.
       */
      const handleRemove =
        useCallback(() => {
          if (
            disabled
          ) {
            return;
          }

          onRemoveImage?.(
            image.id
          );
        }, [
          disabled,
          image.id,
          onRemoveImage,
        ]);

      /**
       * Stable upload state.
       */
      const isProcessing =
        image.status ===
          "uploading" ||
        image.status ===
          "processing";

      /**
       * Safe preview.
       */
      const previewUrl =
        image.preview ||
        image.imageUrl ||
        "";

      return (
        <div
          data-testid="upload-preview-card"
          className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200"
        >
          {/* ------------------------------------------------ */}
          {/* Preview */}
          {/* ------------------------------------------------ */}
          <div className="relative h-36 overflow-hidden bg-gray-100">
            {previewUrl ? (
              <img
                src={
                  previewUrl
                }
                alt="Upload preview"
                loading="lazy"
                className={`h-full w-full object-cover transition duration-300 ${
                  isProcessing
                    ? "scale-[1.02] opacity-80"
                    : "group-hover:scale-[1.02]"
                }`}

                /**
                 * Prevent broken preview layouts.
                 */
                onError={(
                  event
                ) => {
                  event.target.style.display =
                    "none";
                }}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-gray-400">
                Preview unavailable
              </div>
            )}

            {/* ------------------------------------------------ */}
            {/* Hover Overlay */}
            {/* ------------------------------------------------ */}
            <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />

            {/* ------------------------------------------------ */}
            {/* Processing Overlay */}
            {/* ------------------------------------------------ */}
            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
                <div className="rounded-xl bg-white/90 px-3 py-2 text-xs font-medium text-gray-700 shadow-sm">
                  {
                    image.status ===
                    "uploading"
                      ? "Uploading..."
                      : "AI analyzing..."
                  }
                </div>
              </div>
            )}

            {/* ------------------------------------------------ */}
            {/* Remove Button */}
            {/* ------------------------------------------------ */}
            <button
              data-testid="remove-upload-button"
              type="button"
              onClick={
                handleRemove
              }
              disabled={
                disabled ||
                isProcessing
              }
              className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              ✕
            </button>
          </div>

          {/* ------------------------------------------------ */}
          {/* Metadata */}
          {/* ------------------------------------------------ */}
          <div className="space-y-2 border-t border-gray-100 p-3">
            {/* Filename */}
            <p className="truncate text-xs font-medium text-gray-700">
              {image.file
                ?.name ||
                "Uploaded image"}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between gap-2">
              {/* File Size */}
              <p className="text-[11px] text-gray-400">
                {formatFileSize(
                  image.file
                    ?.size || 0
                )}
              </p>

              {/* Status */}
              <UploadStatusBadge
                status={
                  image.status
                }
              />
            </div>
          </div>
        </div>
      );
    }
  );

UploadPreviewCard.displayName =
  "UploadPreviewCard";

/**
 * -------------------------------------------------------
 * Production-grade upload preview grid.
 * -------------------------------------------------------
 *
 * Handles:
 * - OCR upload visualization
 * - upload lifecycle rendering
 * - multimodal upload previews
 * - upload synchronization
 * - retry-safe rendering
 * - processing-state rendering
 */
const UploadPreviewGrid = ({
  selectedImages = [],

  onRemoveImage,

  onClearImages,

  disabled = false,
}) => {
  /**
   * -------------------------------------------------------
   * Hide empty state.
   * -------------------------------------------------------
   */
  if (
    !Array.isArray(
      selectedImages
    ) ||
    selectedImages.length ===
      0
  ) {
    return null;
  }

  /**
   * -------------------------------------------------------
   * Stable image list.
   * -------------------------------------------------------
   */
  const validImages =
    useMemo(() => {
      return selectedImages.filter(
        (image) =>
          image &&
          typeof image ===
            "object"
      );
    }, [selectedImages]);

  /**
   * -------------------------------------------------------
   * Upload telemetry.
   * -------------------------------------------------------
   */
  const totalSize =
    useMemo(() => {
      return validImages.reduce(
        (
          total,
          image
        ) =>
          total +
          (image.file
            ?.size || 0),
        0
      );
    }, [validImages]);

  /**
   * -------------------------------------------------------
   * Processing detection.
   * -------------------------------------------------------
   */
  const processingCount =
    useMemo(() => {
      return validImages.filter(
        (image) =>
          image.status ===
            "uploading" ||
          image.status ===
            "processing"
      ).length;
    }, [validImages]);

  /**
   * -------------------------------------------------------
   * Stable clear lifecycle.
   * -------------------------------------------------------
   */
  const handleClearAll =
    useCallback(() => {
      if (
        disabled ||
        processingCount >
          0
      ) {
        return;
      }

      onClearImages?.();
    }, [
      disabled,
      processingCount,
      onClearImages,
    ]);

  return (
    <div
      data-testid="upload-preview-grid"
      className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4"
    >
      {/* ------------------------------------------------ */}
      {/* Header */}
      {/* ------------------------------------------------ */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">
            Selected Images
          </h3>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span>
              {
                validImages.length
              }{" "}
              image
              {validImages.length >
              1
                ? "s"
                : ""}
            </span>

            <span>
              •
            </span>

            <span>
              {formatFileSize(
                totalSize
              )}
            </span>

            {processingCount >
              0 && (
              <>
                <span>
                  •
                </span>

                <span className="text-blue-600">
                  {
                    processingCount
                  }{" "}
                  processing
                </span>
              </>
            )}
          </div>
        </div>

        {/* ------------------------------------------------ */}
        {/* Clear All */}
        {/* ------------------------------------------------ */}
        <button
          data-testid="clear-all-uploads-button"
          type="button"
          onClick={
            handleClearAll
          }
          disabled={
            disabled ||
            processingCount >
              0
          }
          className="text-sm font-medium text-red-600 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Clear All
        </button>
      </div>

      {/* ------------------------------------------------ */}
      {/* Upload Grid */}
      {/* ------------------------------------------------ */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {validImages.map(
          (image) => (
            <UploadPreviewCard
              key={
                image.id ||
                image.preview
              }
              image={image}
              disabled={
                disabled
              }
              onRemoveImage={
                onRemoveImage
              }
            />
          )
        )}
      </div>
    </div>
  );
};

export default memo(
  UploadPreviewGrid
);