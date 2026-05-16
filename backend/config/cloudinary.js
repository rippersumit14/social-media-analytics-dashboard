import { v2 as cloudinary } from "cloudinary";

/**
 * Cloudinary provider configuration.
 * This file only configures Cloudinary.
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;