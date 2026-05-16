import multer from "multer";

/**
 * Store uploaded files in memory.
 *
 * We process/compress them before
 * uploading to Cloudinary.
 */
const storage = multer.memoryStorage();

/**
 * Allowed image MIME types.
 */
const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

/**
 * Validate uploaded image types.
 */
const imageFileFilter = (req, file, cb) => {
  if (!allowedImageTypes.includes(file.mimetype)) {
    const error = new Error(
      "Invalid image type. Only JPG, PNG and WEBP are allowed."
    );

    error.statusCode = 400;

    return cb(error, false);
  }

  cb(null, true);
};

/**
 * Multer upload middleware.
 *
 * Supports:
 * - multiple image uploads
 * - max 5 images
 * - max 5MB each
 */
export const uploadImages = multer({
  storage,
  fileFilter: imageFileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
  },
});