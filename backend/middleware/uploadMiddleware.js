import multer from "multer";

/**
 * Store uploaded files temporarily in memory.
 *
 * Why memoryStorage?
 *
 * - images are optimized immediately
 * - uploaded directly to Cloudinary
 * - no local disk usage
 * - simpler deployment architecture
 */
const storage = multer.memoryStorage();

/**
 * Allowed image MIME types.
 *
 * Prevents:
 * - executable uploads
 * - unsupported formats
 * - malicious files
 */
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

/**
 * Validate uploaded image files.
 */
const imageFileFilter = (req, file, cb) => {
  if (
    !ALLOWED_IMAGE_TYPES.includes(file.mimetype)
  ) {
    const error = new Error(
      "Invalid image type. Only JPG, PNG and WEBP are allowed."
    );

    error.statusCode = 400;
    error.errorCode = "INVALID_IMAGE_TYPE";

    return cb(error, false);
  }

  cb(null, true);
};

/**
 * Production upload middleware.
 *
 * Supports:
 * - multiple image uploads
 * - image validation
 * - upload limits
 * - frontend multipart/form-data
 */
export const uploadImages = multer({
  storage,

  /**
   * Validate file types.
   */
  fileFilter: imageFileFilter,

  /**
   * Upload limits.
   */
  limits: {
    /**
     * Max single image size:
     * 5MB
     */
    fileSize: 5 * 1024 * 1024,

    /**
     * Max images per message.
     */
    files: 5,
  },
});