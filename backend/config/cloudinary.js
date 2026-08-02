import { v2 as cloudinary } from "cloudinary";
import logger from "../utils/logger.js";

const requiredEnvVars = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

export const getMissingCloudinaryEnvVars = () => {
  return requiredEnvVars.filter((key) => !process.env[key]);
};

const missingEnvVars = getMissingCloudinaryEnvVars();

if (missingEnvVars.length === 0) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  logger.info("Cloudinary configured", {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
} else {
  logger.warn("Cloudinary not configured", {
    missingEnvVars,
  });
}

export default cloudinary;
