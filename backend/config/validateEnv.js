// config/validateEnv.js

import logger from "../utils/logger.js";

/**
 * ---------------------------------------------------
 * Required Environment Variables
 * ---------------------------------------------------
 */

const REQUIRED_ENV_VARS = [

  "PORT",

  "MONGO_URI",

  "JWT_SECRET",

  "GEMINI_API_KEY",

  "CLOUDINARY_CLOUD_NAME",

  "CLOUDINARY_API_KEY",

  "CLOUDINARY_API_SECRET",
];

/**
 * ---------------------------------------------------
 * Validate Environment Variables
 * ---------------------------------------------------
 */

const validateEnv = () => {

  const missingEnvVars = [];

  /**
   * Detect missing variables
   */
  for (const envVar of REQUIRED_ENV_VARS) {

    if (
      !process.env[envVar]
    ) {

      missingEnvVars.push(
        envVar
      );
    }
  }

  /**
   * Stop startup if missing vars exist
   */
  if (
    missingEnvVars.length > 0
  ) {

    logger.error(
      "Missing required environment variables",

      {
        missingEnvVars,
      }
    );

    process.exit(1);
  }

  /**
   * Successful validation
   */
  logger.info(
    "Environment variables validated successfully"
  );
};

export default validateEnv;