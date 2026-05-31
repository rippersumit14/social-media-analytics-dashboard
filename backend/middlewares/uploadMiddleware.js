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
 * - direct Cloudinary uploads
 * - OCR processing
 * - image optimization
 * - no disk persistence
 * - deployment-safe architecture
 */

const storage =
  multer.memoryStorage();

/**
 * ---------------------------------------------------
 * Allowed MIME Types
 * ---------------------------------------------------
 */

const ALLOWED_IMAGE_TYPES = [

  "image/jpeg",

  "image/png",

  "image/webp",

  "image/jpg",
];

/**
 * ---------------------------------------------------
 * Upload Limits
 * ---------------------------------------------------
 */

const MAX_IMAGE_SIZE =
  5 * 1024 * 1024;

const MAX_IMAGE_COUNT =
  5;

/**
 * ---------------------------------------------------
 * Validate Uploaded Files
 * ---------------------------------------------------
 */

const imageFileFilter =
  (
    req,
    file,
    cb
  ) => {

    /**
     * Validate MIME type
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

    cb(
      null,
      true
    );
  };

/**
 * ---------------------------------------------------
 * Multer Upload Instance
 * ---------------------------------------------------
 */

const multerUpload =
  multer({

    storage,

    fileFilter:
      imageFileFilter,

    limits: {

      /**
       * Max single image size
       */

      fileSize:
        MAX_IMAGE_SIZE,

      /**
       * Max images per request
       */

      files:
        MAX_IMAGE_COUNT,
    },
  });

/**
 * ---------------------------------------------------
 * Production Upload Middleware
 * ---------------------------------------------------
 *
 * IMPORTANT:
 * Frontend now depends on:
 *
 * formData.append("images", file)
 *
 * Therefore:
 * upload field MUST remain:
 * "images"
 */

export const uploadImages =
  multerUpload.array(

    "images",

    MAX_IMAGE_COUNT
  );

/**
 * ---------------------------------------------------
 * Multer Error Handler
 * ---------------------------------------------------
 */

export const handleUploadErrors =
  (
    error,
    req,
    res,
    next
  ) => {

    /**
     * Multer-specific errors
     */

    if (

      error instanceof multer.MulterError
    ) {

      /**
       * File size exceeded
       */

      if (
        error.code ===
        "LIMIT_FILE_SIZE"
      ) {

        return next(

          new AppError(

            "Image size exceeds 5MB limit.",

            400
          )
        );
      }

      /**
       * Too many files
       */

      if (
        error.code ===
        "LIMIT_FILE_COUNT"
      ) {

        return next(

          new AppError(

            "Maximum 5 images allowed per request.",

            400
          )
        );
      }

      /**
       * Generic upload error
       */

      return next(

        new AppError(

          error.message,

          400
        )
      );
    }

    /**
     * Custom validation errors
     */

    if (error) {

      return next(error);
    }

    next();
  };