import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";

const DEFAULT_FOLDER =
  process.env.CLOUDINARY_AI_CHAT_FOLDER || "mern-ai-social-saas/ai-chat";

/**
 * Upload image buffer to Cloudinary.
 * multer gives us file.buffer.
 * Cloudinary upload_stream needs a readable stream.
 */
export const uploadImageToCloudinary = async (file) => {
  if (!file?.buffer) {
    const error = new Error("Image file buffer is required");
    error.statusCode = 400;
    throw error;
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: DEFAULT_FOLDER,
        resource_type: "image",
        overwrite: false,
      },
      (error, result) => {
        if (error) {
          const uploadError = new Error("Cloudinary image upload failed");
          uploadError.statusCode = 502;
          uploadError.details = error.message;
          return reject(uploadError);
        }

        resolve({
          imageUrl: result.secure_url,
          publicId: result.public_id,
          provider: "cloudinary",
          mimeType: file.mimetype,
          size: file.size,
          width: result.width,
          height: result.height,
          format: result.format,
        });
      }
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
};

/**
 * Delete image from Cloudinary.
 * Later useful when deleting chat message/session.
 */
export const deleteImageFromCloudinary = async (publicId) => {
  if (!publicId) return null;

  return cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });
};