// services/cloudinaryStorageService.js

import streamifier
  from "streamifier";

import cloudinary, {

  getMissingCloudinaryEnvVars,

} from "../config/cloudinary.js";

import AppError
  from "../utils/AppError.js";

import {
  optimizeImage,
} from "./imageOptimizer.js";

/**
 * ---------------------------------------------------
 * Cloudinary Configuration
 * ---------------------------------------------------
 */

const DEFAULT_FOLDER =

  process.env
    .CLOUDINARY_AI_CHAT_FOLDER ||

  "mern-ai-social-saas/ai-chat";

const UPLOAD_TIMEOUT_MS =
  30000;

const MAX_FILE_SIZE =
  5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [

  "image/jpeg",

  "image/png",

  "image/webp",

  "image/jpg",
];

/**
 * ---------------------------------------------------
 * Validate Cloudinary Config
 * ---------------------------------------------------
 */

const assertCloudinaryConfigured =
  () => {

    const missingEnvVars =

      getMissingCloudinaryEnvVars();

    if (
      missingEnvVars.length > 0
    ) {

      const error =
        new AppError(

          "Cloudinary image storage is not configured",

          503
        );

      error.missingEnvVars =
        missingEnvVars;

      throw error;
    }
  };

/**
 * ---------------------------------------------------
 * Validate Uploaded Image
 * ---------------------------------------------------
 */

const validateImageFile =
  (
    file
  ) => {

    if (!file) {

      throw new AppError(
        "No image file provided",
        400
      );
    }

    if (!file.buffer) {

      throw new AppError(
        "Invalid image buffer",
        400
      );
    }

    if (

      !ALLOWED_IMAGE_TYPES.includes(

        file.mimetype
      )
    ) {

      throw new AppError(
        "Unsupported image format",
        400
      );
    }

    if (
      file.size >
      MAX_FILE_SIZE
    ) {

      throw new AppError(
        "Image exceeds maximum upload size",
        400
      );
    }
  };

/**
 * ---------------------------------------------------
 * Promise Timeout Wrapper
 * ---------------------------------------------------
 */

const withTimeout =
  (
    promise,
    timeoutMs
  ) => {

    return Promise.race([

      promise,

      new Promise(
        (_, reject) =>

          setTimeout(

            () =>

              reject(

                new AppError(

                  "Cloudinary upload timeout exceeded",

                  408
                )
              ),

            timeoutMs
          )
      ),
    ]);
  };

/**
 * ---------------------------------------------------
 * Upload Buffer To Cloudinary
 * ---------------------------------------------------
 */

const uploadBufferToCloudinary =
  async ({

    file,

    folder,
  }) => {

    return new Promise(

      (
        resolve,
        reject
      ) => {

        const uploadStream =

          cloudinary.uploader.upload_stream(

            {

              folder,

              resource_type:
                "image",

              transformation: [

                {
                  quality:
                    "auto",
                },

                {
                  fetch_format:
                    "auto",
                },

                {
                  width:
                    1600,

                  crop:
                    "limit",
                },
              ],
            },

            (
              error,
              result
            ) => {

              /**
               * Upload failed
               */

              if (error) {

                return reject(

                  new AppError(

                    "Cloudinary upload failed",

                    500
                  )
                );
              }

              /**
               * Empty response protection
               */

              if (!result) {

                return reject(

                  new AppError(

                    "Cloudinary upload returned empty response",

                    500
                  )
                );
              }

              /**
               * Standardized upload response
               */

              resolve({

                imageUrl:
                  result.secure_url,

                publicId:
                  result.public_id,

                provider:
                  "cloudinary",

                mimeType:
                  file.mimetype,

                originalName:
                  file.originalname,

                size:
                  result.bytes,

                width:
                  result.width,

                height:
                  result.height,

                format:
                  result.format,

                uploadedAt:
                  new Date().toISOString(),
              });
            }
          );

        /**
         * Convert buffer to stream
         */

        streamifier

          .createReadStream(

            file.buffer
          )

          .pipe(uploadStream);
      }
    );
  };

/**
 * ---------------------------------------------------
 * Upload Image To Cloudinary
 * ---------------------------------------------------
 */

export const uploadImageToCloudinary =
  async (

    file,

    folder = DEFAULT_FOLDER
  ) => {

    try {

      /**
       * Validate config
       */

      assertCloudinaryConfigured();

      /**
       * Validate upload
       */

      validateImageFile(
        file
      );

      /**
       * Optimize image
       */

      const optimizedFile =

        await optimizeImage(
          file
        );

      /**
       * Upload optimized image
       */

      const uploadedImage =

        await withTimeout(

          uploadBufferToCloudinary({

            file:
              optimizedFile,

            folder,
          }),

          UPLOAD_TIMEOUT_MS
        );

      return uploadedImage;

    } catch (error) {

      console.error(

        "[CLOUDINARY_UPLOAD_ERROR]",

        {

          message:
            error.message,

          fileName:
            file?.originalname,

          mimeType:
            file?.mimetype,

          stack:

            process.env.NODE_ENV ===
            "development"

              ? error.stack

              : undefined,
        }
      );

      /**
       * Preserve AppError
       */

      if (
        error instanceof AppError
      ) {

        throw error;
      }

      throw new AppError(

        "Failed to upload image",

        500
      );
    }
  };

/**
 * ---------------------------------------------------
 * Delete Image From Cloudinary
 * ---------------------------------------------------
 */

export const deleteImageFromCloudinary =
  async (
    publicId
  ) => {

    try {

      /**
       * Ignore empty ids
       */

      if (!publicId) {
        return null;
      }

      /**
       * Validate config
       */

      assertCloudinaryConfigured();

      /**
       * Delete asset
       */

      const result =

        await withTimeout(

          cloudinary.uploader.destroy(
            publicId
          ),

          UPLOAD_TIMEOUT_MS
        );

      return result;

    } catch (error) {

      console.error(

        "[CLOUDINARY_DELETE_ERROR]",

        {

          publicId,

          message:
            error.message,

          stack:

            process.env.NODE_ENV ===
            "development"

              ? error.stack

              : undefined,
        }
      );

      /**
       * Never break chat flow
       * because cleanup failed
       */

      return null;
    }
  };