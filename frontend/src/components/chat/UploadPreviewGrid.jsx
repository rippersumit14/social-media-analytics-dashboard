/**
 * Upload preview grid.
 *
 * Displays:
 * - selected images
 * - preview cards
 * - remove actions
 *
 * Used before AI message send.
 */
const UploadPreviewGrid = ({
  selectedImages = [],
  onRemoveImage,
  onClearImages,
  disabled = false,
}) => {
  /**
   * Hide component if no images.
   */
  if (
    !selectedImages.length
  ) {
    return null;
  }

  return (
    <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
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

        {/* Clear all */}
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
            <div
              key={image.id}
              className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
            >
              {/* Image */}
              <img
                src={
                  image.preview
                }
                alt="Upload preview"
                className="h-36 w-full object-cover"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />

              {/* Remove Button */}
              <button
                type="button"
                onClick={() =>
                  onRemoveImage?.(
                    image.id
                  )
                }
                disabled={
                  disabled
                }
                className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                ✕
              </button>

              {/* File Info */}
              <div className="border-t border-gray-100 p-2">
                <p className="truncate text-xs text-gray-600">
                  {
                    image.file
                      ?.name
                  }
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default UploadPreviewGrid;