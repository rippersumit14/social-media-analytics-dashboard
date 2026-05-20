// backend/services/cloudinaryStorageService.js

import streamifier from "streamifier";

import cloudinary, {
  getMissingCloudinaryEnvVars,
} from "../config/cloudinary.js";

/**
 * Default upload folder
 */
const DEFAULT_FOLDER =
  process.env
    .CLOUDINARY_AI_CHAT_FOLDER ||
  "mern-ai-social-saas/ai-chat";

const assertCloudinaryConfigured = () => {
  const missingEnvVars = getMissingCloudinaryEnvVars();

  if (missingEnvVars.length > 0) {
    const error = new Error("Cloudinary image storage is not configured");
    error.statusCode = 503;
    error.missingEnvVars = missingEnvVars;
    throw error;
  }
};

/**
 * Upload image buffer to Cloudinary
 */
export const uploadImageToCloudinary =
  async (
    file,
    folder = DEFAULT_FOLDER
  ) => {
    assertCloudinaryConfigured();

    return new Promise(
      (resolve, reject) => {
        const uploadStream =
          cloudinary.uploader.upload_stream(
            {
              folder,

              resource_type:
                "image",

              /**
               * Optimization
               */
              transformation: [
                {
                  quality: "auto",
                },

                {
                  fetch_format:
                    "auto",
                },

                /**
                 * Resize huge uploads
                 */
                {
                  width: 1600,
                  crop: "limit",
                },
              ],
            },

            (
              error,
              result
            ) => {
              if (error) {
                return reject(
                  error
                );
              }

              resolve({
                imageUrl:
                  result.secure_url,

                publicId:
                  result.public_id,

                provider:
                  "cloudinary",

                mimeType:
                  file.mimetype,

                size:
                  result.bytes,

                width:
                  result.width,

                height:
                  result.height,

                format:
                  result.format,
              });
            }
          );

        /**
         * Convert buffer into stream
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
 * Delete image from Cloudinary
 */
export const deleteImageFromCloudinary =
  async (publicId) => {
    if (!publicId) {
      return null;
    }

    assertCloudinaryConfigured();

    return await cloudinary.uploader.destroy(
      publicId
    );
  };
