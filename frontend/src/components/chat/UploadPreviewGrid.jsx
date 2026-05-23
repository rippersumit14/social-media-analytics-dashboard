import {
  memo,
  useCallback,
} from "react";

/**
 * Format file size safely.
 */
const formatFileSize = (
  bytes = 0
) => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
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
 * Stable upload preview card.
 */
const UploadPreviewCard = memo(
  ({
    image,
    disabled,
    onRemoveImage,
  }) => {
    /**
     * Stable remove lifecycle.
     */
    const handleRemove =
      useCallback(() => {
        onRemoveImage?.(
          image.id
        );
      }, [
        image.id,
        onRemoveImage,
      ]);

    return (
      <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition">
        {/* Image */}
        <div className="relative h-36 overflow-hidden bg-gray-100">
          <img
            src={
              image.preview
            }
            alt="Upload preview"
            loading="lazy"
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"

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

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />

          {/* Remove Button */}
          <button
            type="button"
            onClick={
              handleRemove
            }
            disabled={
              disabled
            }
            className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            ✕
          </button>
        </div>

        {/* File Info */}
        <div className="space-y-1 border-t border-gray-100 p-3">
          <p className="truncate text-xs font-medium text-gray-700">
            {
              image.file
                ?.name
            }
          </p>

          <p className="text-[11px] text-gray-400">
            {formatFileSize(
              image.file?.size
            )}
          </p>
        </div>
      </div>
    );
  }
);

UploadPreviewCard.displayName =
  "UploadPreviewCard";

/**
 * Production-grade upload preview grid.
 *
 * Handles:
 * - preview rendering
 * - upload visualization
 * - remove lifecycle
 * - responsive image grid
 */
const UploadPreviewGrid = ({
  selectedImages = [],

  onRemoveImage,

  onClearImages,

  disabled = false,
}) => {
  /**
   * Hide empty upload state.
   */
  if (
    !selectedImages.length
  ) {
    return null;
  }

  return (
    <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">
            Selected Images
          </h3>

          <p className="mt-1 text-xs text-gray-500">
            {
              selectedImages.length
            }{" "}
            image
            {selectedImages.length >
            1
              ? "s"
              : ""}{" "}
            ready for upload
          </p>
        </div>

        {/* Clear All */}
        <button
          type="button"
          onClick={
            onClearImages
          }
          disabled={disabled}
          className="text-sm font-medium text-red-600 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Clear All
        </button>
      </div>

      {/* Preview Grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {selectedImages.map(
          (image) => (
            <UploadPreviewCard
              key={image.id}
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

/**
 * Prevent unnecessary rerenders.
 */
export default memo(
  UploadPreviewGrid
);