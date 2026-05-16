import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

/**
 * Load environment variables locally
 * This guarantees env availability
 * even if import order changes.
 */
dotenv.config();

/**
 * Validate required Cloudinary variables
 */
const requiredEnvVars = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

/**
 * Configure Cloudinary SDK
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Startup debug logs
 */
console.log("✅ Cloudinary configured successfully");

export default cloudinary;