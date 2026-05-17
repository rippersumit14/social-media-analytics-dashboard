import { useEffect, useState } from "react";

/**
 * Production-grade image upload hook.
 *
 * Handles:
 * - multiple uploads
 * - preview generation
 * - cleanup
 * - validation
 * - memory leak prevention
 */
const useImageUploads = () => {
  /**
   * Selected image state.
   *
   * Structure:
   * [
   *   {
   *     id,
   *     file,
   *     preview
   *   }
   * ]
   */
  const [selectedImages, setSelectedImages] =
    useState([]);

  /**
   * Upload validation error.
   */
  const [uploadError, setUploadError] =
    useState("");

  /**
   * Handle image selection.
   */
  const handleImageChange = (event) => {
    const files = Array.from(
      event.target.files || []
    );

    if (!files.length) {
      return;
    }

    /**
     * Validate image files.
     */
    const invalidFile = files.find(
      (file) =>
        !file.type.startsWith(
          "image/"
        )
    );

    if (invalidFile) {
      setUploadError(
        "Please upload valid image files."
      );

      return;
    }

    /**
     * Map images into normalized structure.
     */
    const mappedImages = files.map(
      (file) => ({
        id: crypto.randomUUID(),
        file,

        /**
         * Local preview URL.
         */
        preview:
          URL.createObjectURL(file),
      })
    );

    /**
     * Append images.
     */
    setSelectedImages((prev) => [
      ...prev,
      ...mappedImages,
    ]);

    setUploadError("");
  };

  /**
   * Remove single image.
   */
  const removeImage = (imageId) => {
    setSelectedImages((prev) => {
      const imageToRemove =
        prev.find(
          (image) =>
            image.id === imageId
        );

      /**
       * Cleanup preview URL.
       */
      if (imageToRemove?.preview) {
        URL.revokeObjectURL(
          imageToRemove.preview
        );
      }

      return prev.filter(
        (image) =>
          image.id !== imageId
      );
    });
  };

  /**
   * Clear all selected images.
   */
  const clearImages = () => {
    selectedImages.forEach(
      (image) => {
        if (image.preview) {
          URL.revokeObjectURL(
            image.preview
          );
        }
      }
    );

    setSelectedImages([]);
  };

  /**
   * Cleanup previews on unmount.
   *
   * Prevents memory leaks.
   */
  useEffect(() => {
    return () => {
      selectedImages.forEach(
        (image) => {
          if (image.preview) {
            URL.revokeObjectURL(
              image.preview
            );
          }
        }
      );
    };
  }, [selectedImages]);

  return {
    /**
     * State.
     */
    selectedImages,
    uploadError,

    /**
     * Actions.
     */
    handleImageChange,
    removeImage,
    clearImages,

    /**
     * Utilities.
     */
    setUploadError,
    setSelectedImages,
  };
};

export default useImageUploads;