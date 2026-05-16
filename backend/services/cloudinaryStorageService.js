import streamifier from "streamifier";
import sharp from "sharp";

import cloudinary from "../config/cloudinary.js";

const DEFAULT_FOLDER =
  process.env.CLOUDINARY_AI_CHAT_FOLDER ||
  "mern-ai-social-saas/ai-chat";

/**
 * Optimize image before upload.
 *
 * Benefits:
 * - lower bandwidth
 * - lower AI image token cost
 * - faster upload
 * - smaller DB/network payloads
 */
const optimizeImageBuffer = async (buffer) => {
  return sharp(buffer)
    .resize({
      width: 1400,
      withoutEnlargement: true,
    })
    .webp({
      quality: 80,
    })
    .toBuffer();
};

/**
 * Upload single image to Cloudinary.
 */
const uploadSingleImage = async (file) => {
  if (!file?.buffer) {
    const error = new Error("Image buffer is required");

    error.statusCode = 400;

    throw error;
  }

  /**
   * Optimize image before upload.
   */
  const optimizedBuffer = await optimizeImageBuffer(
    file.buffer
  );

  return new Promise((resolve, reject) => {
    const uploadStream =
      cloudinary.uploader.upload_stream(
        {
          folder: DEFAULT_FOLDER,
          resource_type: "image",
          format: "webp",
          overwrite: false,
        },

        (error, result) => {
          if (error) {
            const uploadError = new Error(
              "Cloudinary image upload failed"
            );

            uploadError.statusCode = 502;
            uploadError.details = error.message;

            return reject(uploadError);
          }

          resolve({
            imageUrl: result.secure_url,
            publicId: result.public_id,
            provider: "cloudinary",
            mimeType: "image/webp",
            size: result.bytes,
            width: result.width,
            height: result.height,
            format: result.format,
          });
        }
      );

    streamifier
      .createReadStream(optimizedBuffer)
      .pipe(uploadStream);
  });
};

/**
 * Upload multiple images.
 */
export const uploadImagesToCloudinary = async (
  files = []
) => {
  if (!files.length) return [];

  const uploadPromises = files.map((file) =>
    uploadSingleImage(file)
  );

  return Promise.all(uploadPromises);
};

/**
 * Delete image safely from Cloudinary.
 */
export const deleteImageFromCloudinary = async (
  publicId
) => {
  if (!publicId) return null;

  return cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });
};