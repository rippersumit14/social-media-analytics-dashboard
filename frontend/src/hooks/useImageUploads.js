import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * Upload constraints.
 */
const MAX_IMAGES = 6;

const MAX_FILE_SIZE =
  10 * 1024 * 1024;

/**
 * Production-grade image upload hook.
 *
 * Handles:
 * - multiple uploads
 * - preview generation
 * - cleanup lifecycle
 * - validation
 * - duplicate prevention
 * - OCR-ready metadata
 * - memory leak prevention
 */
const useImageUploads =
  () => {
    /**
     * Selected image state.
     *
     * Structure:
     * [
     *   {
     *     id,
     *     file,
     *     preview,
     *     status,
     *     uploadedAt
     *   }
     * ]
     */
    const [
      selectedImages,
      setSelectedImages,
    ] = useState([]);

    /**
     * Upload lifecycle state.
     */
    const [
      uploadError,
      setUploadError,
    ] = useState("");

    /**
     * Upload processing state.
     */
    const [
      isProcessingUploads,
      setIsProcessingUploads,
    ] = useState(false);

    /**
     * Current image count.
     */
    const imageCount =
      useMemo(() => {
        return selectedImages.length;
      }, [selectedImages]);

    /**
     * Cleanup preview URL safely.
     */
    const revokePreview =
      useCallback(
        (previewUrl) => {
          if (
            previewUrl
          ) {
            URL.revokeObjectURL(
              previewUrl
            );
          }
        },
        []
      );

    /**
     * Validate uploaded file.
     */
    const validateFile =
      useCallback(
        (file) => {
          /**
           * Image validation.
           */
          if (
            !file.type.startsWith(
              "image/"
            )
          ) {
            return "Only image files are allowed.";
          }

          /**
           * File size validation.
           */
          if (
            file.size >
            MAX_FILE_SIZE
          ) {
            return `Image "${file.name}" exceeds 10MB limit.`;
          }

          return null;
        },
        []
      );

    /**
     * Duplicate detection.
     */
    const isDuplicateFile =
      useCallback(
        (file) => {
          return selectedImages.some(
            (image) => {
              return (
                image.file
                  ?.name ===
                  file.name &&
                image.file
                  ?.size ===
                  file.size &&
                image.file
                  ?.lastModified ===
                  file.lastModified
              );
            }
          );
        },
        [selectedImages]
      );

    /**
     * Handle image selection.
     */
    const handleImageChange =
      useCallback(
        async (event) => {
          const files =
            Array.from(
              event.target
                .files || []
            );

          if (
            !files.length
          ) {
            return;
          }

          setUploadError(
            ""
          );

          setIsProcessingUploads(
            true
          );

          try {
            /**
             * Max upload limit.
             */
            if (
              imageCount +
                files.length >
              MAX_IMAGES
            ) {
              throw new Error(
                `Maximum ${MAX_IMAGES} images allowed.`
              );
            }

            /**
             * Validate files.
             */
            for (const file of files) {
              const validationError =
                validateFile(
                  file
                );

              if (
                validationError
              ) {
                throw new Error(
                  validationError
                );
              }
            }

            /**
             * Remove duplicate uploads.
             */
            const uniqueFiles =
              files.filter(
                (
                  file
                ) =>
                  !isDuplicateFile(
                    file
                  )
              );

            /**
             * Normalize upload structure.
             */
            const mappedImages =
              uniqueFiles.map(
                (
                  file
                ) => ({
                  id: crypto.randomUUID(),

                  file,

                  /**
                   * Local preview URL.
                   */
                  preview:
                    URL.createObjectURL(
                      file
                    ),

                  /**
                   * Upload lifecycle.
                   */
                  status:
                    "pending",

                  uploadedAt:
                    Date.now(),
                })
              );

            /**
             * Append uploads safely.
             */
            setSelectedImages(
              (
                prev
              ) => [
                ...prev,
                ...mappedImages,
              ]
            );
          } catch (
            error
          ) {
            console.error(
              "[UPLOAD ERROR]",
              error
            );

            setUploadError(
              error.message ||
                "Failed to process uploads."
            );
          } finally {
            setIsProcessingUploads(
              false
            );
          }
        },
        [
          imageCount,
          validateFile,
          isDuplicateFile,
        ]
      );

    /**
     * Remove single image.
     */
    const removeImage =
      useCallback(
        (imageId) => {
          setSelectedImages(
            (prev) => {
              const imageToRemove =
                prev.find(
                  (
                    image
                  ) =>
                    image.id ===
                    imageId
                );

              /**
               * Cleanup preview URL.
               */
              revokePreview(
                imageToRemove?.preview
              );

              return prev.filter(
                (
                  image
                ) =>
                  image.id !==
                  imageId
              );
            }
          );
        },
        [revokePreview]
      );

    /**
     * Clear all uploads.
     */
    const clearImages =
      useCallback(() => {
        selectedImages.forEach(
          (image) => {
            revokePreview(
              image.preview
            );
          }
        );

        setSelectedImages(
          []
        );

        setUploadError(
          ""
        );
      }, [
        selectedImages,
        revokePreview,
      ]);

    /**
     * Cleanup previews on unmount.
     *
     * Prevents memory leaks.
     */
    useEffect(() => {
      return () => {
        selectedImages.forEach(
          (image) => {
            revokePreview(
              image.preview
            );
          }
        );
      };
    }, [
      selectedImages,
      revokePreview,
    ]);

    return {
      /**
       * State.
       */
      selectedImages,

      uploadError,

      isProcessingUploads,

      imageCount,

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