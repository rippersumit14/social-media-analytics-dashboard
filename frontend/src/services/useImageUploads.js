import { useEffect, useState } from "react";

/**
 * Supported upload formats.
 */
const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

/**
 * Max upload size.
 *
 * Current:
 * 10MB
 */
const MAX_IMAGE_SIZE =
  10 * 1024 * 1024;

/**
 * Production-grade image upload lifecycle hook.
 *
 * Responsibilities:
 * - image validation
 * - preview lifecycle
 * - duplicate prevention
 * - memory cleanup
 * - upload state management
 */
const useImageUploads = () => {
  /**
   * Stable selected image state.
   */
  const [
    selectedImages,
    setSelectedImages,
  ] = useState([]);

  /**
   * Upload validation errors.
   */
  const [uploadError, setUploadError] =
    useState("");

  /**
   * Validate single image file.
   */
  const validateImage = (file) => {
    /**
     * File type validation.
     */
    if (
      !SUPPORTED_IMAGE_TYPES.includes(
        file.type
      )
    ) {
      return "Unsupported image format.";
    }

    /**
     * File size validation.
     */
    if (
      file.size >
      MAX_IMAGE_SIZE
    ) {
      return "Image size exceeds 10MB limit.";
    }

    return null;
  };

  /**
   * Add new images safely.
   */
  const addImages = (
    incomingFiles = []
  ) => {
    setUploadError("");

    /**
     * Normalize FileList.
     */
    const files =
      Array.from(
        incomingFiles
      );

    if (!files.length) {
      return;
    }

    const validImages = [];

    for (const file of files) {
      /**
       * Validate file safely.
       */
      const validationError =
        validateImage(file);

      if (validationError) {
        setUploadError(
          validationError
        );

        continue;
      }

      /**
       * Prevent duplicate uploads.
       */
      const isDuplicate =
        selectedImages.some(
          (image) =>
            image.file.name ===
              file.name &&
            image.file.size ===
              file.size
        );

      if (isDuplicate) {
        continue;
      }

      /**
       * Stable preview URL.
       */
      const preview =
        URL.createObjectURL(
          file
        );

      validImages.push({
        id: crypto.randomUUID(),

        file,

        preview,

        name: file.name,

        size: file.size,

        type: file.type,
      });
    }

    /**
     * Merge safely.
     */
    setSelectedImages((prev) => [
      ...prev,
      ...validImages,
    ]);
  };

  /**
   * Remove single image safely.
   */
  const removeImage = (
    imageId
  ) => {
    setSelectedImages((prev) => {
      const imageToRemove =
        prev.find(
          (image) =>
            image.id === imageId
        );

      /**
       * Prevent memory leaks.
       */
      if (
        imageToRemove?.preview
      ) {
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
   * Cleanup all uploads safely.
   */
  const clearImages = () => {
    setSelectedImages((prev) => {
      /**
       * Revoke all preview URLs.
       */
      prev.forEach((image) => {
        if (image.preview) {
          URL.revokeObjectURL(
            image.preview
          );
        }
      });

      return [];
    });

    setUploadError("");
  };

  /**
   * Cleanup previews on unmount.
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
     * Upload state.
     */
    selectedImages,

    uploadError,

    /**
     * Upload actions.
     */
    addImages,

    removeImage,

    clearImages,
  };
};

export default useImageUploads;