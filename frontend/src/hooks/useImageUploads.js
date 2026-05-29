import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/**
 * -------------------------------------------------------
 * Upload constraints.
 * -------------------------------------------------------
 */
const MAX_IMAGES = 10;

const MAX_FILE_SIZE =
  10 * 1024 * 1024;

/**
 * Supported image formats.
 */
const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

/**
 * -------------------------------------------------------
 * Production-grade upload lifecycle hook.
 * -------------------------------------------------------
 *
 * Handles:
 * - upload validation
 * - OCR-safe previews
 * - duplicate prevention
 * - multipart-ready normalization
 * - memory cleanup
 * - upload lifecycle states
 * - retry-safe upload handling
 */
const useImageUploads =
  () => {
    /**
     * ---------------------------------------------------
     * Upload state.
     * ---------------------------------------------------
     */
    const [
      selectedImages,
      setSelectedImages,
    ] = useState([]);

    /**
     * ---------------------------------------------------
     * Upload lifecycle.
     * ---------------------------------------------------
     */
    const [
      uploadError,
      setUploadError,
    ] = useState("");

    const [
      isProcessingUploads,
      setIsProcessingUploads,
    ] = useState(false);

    /**
     * ---------------------------------------------------
     * Prevent duplicate revokes.
     * ---------------------------------------------------
     */
    const revokedUrlsRef =
      useRef(new Set());

    /**
     * ---------------------------------------------------
     * Stable image count.
     * ---------------------------------------------------
     */
    const imageCount =
      useMemo(() => {
        return selectedImages.length;
      }, [selectedImages]);

    /**
     * ---------------------------------------------------
     * Safe preview cleanup.
     * ---------------------------------------------------
     */
    const revokePreview =
      useCallback(
        (previewUrl) => {
          if (
            !previewUrl ||
            revokedUrlsRef.current.has(
              previewUrl
            )
          ) {
            return;
          }

          try {
            URL.revokeObjectURL(
              previewUrl
            );

            revokedUrlsRef.current.add(
              previewUrl
            );
          } catch {
            //
          }
        },
        []
      );

    /**
     * ---------------------------------------------------
     * Validate image safely.
     * ---------------------------------------------------
     */
    const validateFile =
      useCallback(
        (file) => {
          if (!file) {
            return "Invalid image file.";
          }

          /**
           * File type validation.
           */
          if (
            !SUPPORTED_IMAGE_TYPES.includes(
              file.type
            )
          ) {
            return `Unsupported image format: ${file.name}`;
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
     * ---------------------------------------------------
     * Normalize upload safely.
     * ---------------------------------------------------
     */
    const createUploadObject =
      useCallback(
        (file) => {
          const preview =
            URL.createObjectURL(
              file
            );

          return {
            /**
             * Stable IDs.
             */
            _id:
              crypto.randomUUID(),

            id:
              crypto.randomUUID(),

            /**
             * Original file.
             */
            file,

            /**
             * OCR-safe preview.
             */
            preview,

            /**
             * Metadata.
             */
            name:
              file.name,

            size:
              file.size,

            type:
              file.type,

            lastModified:
              file.lastModified,

            /**
             * Upload lifecycle.
             */
            status:
              "pending",

            uploaded:
              false,

            uploadedAt:
              null,

            /**
             * Backend image URL.
             */
            imageUrl:
              null,

            /**
             * OCR metadata.
             */
            extractedText:
              null,

            /**
             * Timestamps.
             */
            createdAt:
              new Date().toISOString(),
          };
        },
        []
      );

    /**
     * ---------------------------------------------------
     * Add uploads safely.
     * ---------------------------------------------------
     */
    const addImages =
      useCallback(
        async (
          incomingFiles = []
        ) => {
          const files =
            Array.from(
              incomingFiles
            );

          if (
            files.length === 0
          ) {
            return;
          }

          setUploadError("");

          setIsProcessingUploads(
            true
          );

          try {
            setSelectedImages(
              (
                previousImages
              ) => {
                /**
                 * Upload limit protection.
                 */
                if (
                  previousImages.length +
                    files.length >
                  MAX_IMAGES
                ) {
                  setUploadError(
                    `Maximum ${MAX_IMAGES} images allowed.`
                  );

                  return previousImages;
                }

                /**
                 * Duplicate protection.
                 */
                const existingKeys =
                  new Set(
                    previousImages.map(
                      (
                        image
                      ) =>
                        `${image.file?.name}-${image.file?.size}-${image.file?.lastModified}`
                    )
                  );

                const nextImages =
                  [];

                for (const file of files) {
                  /**
                   * Validate safely.
                   */
                  const validationError =
                    validateFile(
                      file
                    );

                  if (
                    validationError
                  ) {
                    setUploadError(
                      validationError
                    );

                    continue;
                  }

                  /**
                   * Stable duplicate key.
                   */
                  const duplicateKey =
                    `${file.name}-${file.size}-${file.lastModified}`;

                  if (
                    existingKeys.has(
                      duplicateKey
                    )
                  ) {
                    continue;
                  }

                  existingKeys.add(
                    duplicateKey
                  );

                  /**
                   * Create normalized upload.
                   */
                  nextImages.push(
                    createUploadObject(
                      file
                    )
                  );
                }

                return [
                  ...previousImages,
                  ...nextImages,
                ];
              }
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
          validateFile,
          createUploadObject,
        ]
      );

    /**
     * ---------------------------------------------------
     * Remove upload safely.
     * ---------------------------------------------------
     */
    const removeImage =
      useCallback(
        (imageId) => {
          if (!imageId) {
            return;
          }

          setSelectedImages(
            (previousImages) => {
              const imageToRemove =
                previousImages.find(
                  (
                    image
                  ) =>
                    image.id ===
                      imageId ||
                    image._id ===
                      imageId
                );

              /**
               * Cleanup preview safely.
               */
              revokePreview(
                imageToRemove?.preview
              );

              return previousImages.filter(
                (
                  image
                ) =>
                  image.id !==
                    imageId &&
                  image._id !==
                    imageId
              );
            }
          );
        },
        [revokePreview]
      );

    /**
     * ---------------------------------------------------
     * Update upload status safely.
     * ---------------------------------------------------
     */
    const updateImageStatus =
      useCallback(
        (
          imageId,
          updates = {}
        ) => {
          if (!imageId) {
            return;
          }

          setSelectedImages(
            (
              previousImages
            ) =>
              previousImages.map(
                (
                  image
                ) =>
                  image.id ===
                    imageId ||
                  image._id ===
                    imageId
                    ? {
                        ...image,
                        ...updates,
                      }
                    : image
              )
          );
        },
        []
      );

    /**
     * ---------------------------------------------------
     * Clear uploads safely.
     * ---------------------------------------------------
     */
    const clearImages =
      useCallback(() => {
        setSelectedImages(
          (
            previousImages
          ) => {
            previousImages.forEach(
              (
                image
              ) => {
                revokePreview(
                  image.preview
                );
              }
            );

            return [];
          }
        );

        setUploadError("");

        setIsProcessingUploads(
          false
        );
      }, [revokePreview]);

    /**
     * ---------------------------------------------------
     * Cleanup previews on unmount.
     * ---------------------------------------------------
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
       * Upload state.
       */
      selectedImages,

      uploadError,

      isProcessingUploads,

      imageCount,

      /**
       * Upload actions.
       */
      addImages,

      removeImage,

      clearImages,

      updateImageStatus,

      /**
       * Utilities.
       */
      setUploadError,

      setSelectedImages,
    };
  };

export default useImageUploads;