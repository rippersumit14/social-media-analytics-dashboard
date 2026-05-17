import { v2 as cloudinary } from "cloudinary";

/**
 * Validate required Cloudinary environment variables.
 *
 * Prevents silent production failures.
 */
const requiredEnvVars = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

/**
 * Check missing env variables.
 */
const missingEnvVars = requiredEnvVars.filter(
  (key) => !process.env[key]
);

if (missingEnvVars.length > 0) {
  console.error(
    "[CLOUDINARY_CONFIG_ERROR] Missing environment variables:",
    missingEnvVars
  );

  throw new Error(
    "Cloudinary configuration is incomplete"
  );
}

/**
 * Configure Cloudinary provider.
 */
cloudinary.config({
  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME,

  api_key:
    process.env.CLOUDINARY_API_KEY,

  api_secret:
    process.env.CLOUDINARY_API_SECRET,

  secure: true,
});

/**
 * Startup confirmation log.
 *
 * Helpful during deployment debugging.
 */
console.log(
  "[CLOUDINARY_READY]",
  {
    cloudName:
      process.env.CLOUDINARY_CLOUD_NAME,
  }
);

export default cloudinary;