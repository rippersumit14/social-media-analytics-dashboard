// middlewares/uploadMiddleware.js

import multer from "multer";

import AppError from "../utils/AppError.js";

/**
 * ---------------------------------------------------
 * Multer Memory Storage
 * ---------------------------------------------------
 *
 * Why memory storage?
 *
 * - images immediately processed
 * - direct Cloudinary uploads
 * - no local disk persistence
 * - cleaner deployment architecture
 */

const storage = multer.memoryStorage();

/**
 * ---------------------------------------------------
 * Allowed Image MIME Types
 * ---------------------------------------------------
 *
 * Prevents:
 * - malicious uploads
 * - unsupported formats
 * - executable files
 */

const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

/**
 * ---------------------------------------------------
 * Validate Uploaded Image Files
 * ---------------------------------------------------
 */

const imageFileFilter = (
    req,
    file,
    cb
) => {

    /**
     * Reject unsupported image types
     */
    if (
        !ALLOWED_IMAGE_TYPES.includes(
            file.mimetype
        )
    ) {

        return cb(

            new AppError(
                "Invalid image type. Only JPG, PNG and WEBP are allowed.",
                400
            ),

            false
        );
    }

    /**
     * Accept valid image
     */
    cb(null, true);
};

/**
 * ---------------------------------------------------
 * Production Upload Middleware
 * ---------------------------------------------------
 *
 * Supports:
 * - multiple image uploads
 * - file validation
 * - upload limits
 * - multipart/form-data
 */

export const uploadImages = multer({

    storage,

    /**
     * File type validation
     */
    fileFilter:
        imageFileFilter,

    /**
     * Upload limits
     */
    limits: {

        /**
         * Max single image size
         *
         * 5MB
         */
        fileSize:
            5 * 1024 * 1024,

        /**
         * Max images per request
         */
        files: 5,
    },
});