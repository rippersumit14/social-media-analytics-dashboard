// config/validateEnv.js

import logger
  from "../utils/logger.js";

/**
 * ---------------------------------------------------
 * Required Core Environment Variables
 * ---------------------------------------------------
 */

const REQUIRED_ENV_VARS = [

  "PORT",

  "MONGO_URI",

  "JWT_SECRET",

  "CLOUDINARY_CLOUD_NAME",

  "CLOUDINARY_API_KEY",

  "CLOUDINARY_API_SECRET",
];

const PRODUCTION_ENV_VARS = [

  "FRONTEND_URL",

  "REDIS_URL",

  "RESEND_API_KEY",

  "EMAIL_FROM",

  "CONTACT_RECEIVER_EMAIL",

  "GOOGLE_CLIENT_ID",

  "INSTAGRAM_APP_ID",

  "INSTAGRAM_APP_SECRET",

  "INSTAGRAM_REDIRECT_URI",
];

/**
 * ---------------------------------------------------
 * AI Provider Environment Variables
 * ---------------------------------------------------
 *
 * At least ONE provider required
 */

const AI_PROVIDER_ENV_VARS = [

  "GROQ_API_KEY",

  "GEMINI_API_KEY",

  "OPENROUTER_API_KEY",

  "TOGETHER_API_KEY",
];

/**
 * ---------------------------------------------------
 * Validate Environment Variables
 * ---------------------------------------------------
 */

const validateEnv =
  () => {

    const missingEnvVars = [];

    /**
     * ---------------------------------------------------
     * Validate Required Core Variables
     * ---------------------------------------------------
     */

    for (
      const envVar
      of REQUIRED_ENV_VARS
    ) {

      if (
        !process.env[envVar]
      ) {

        missingEnvVars.push(
          envVar
        );
      }
    }

    if (
      process.env.NODE_ENV ===
      "production"
    ) {

      for (
        const envVar
        of PRODUCTION_ENV_VARS
      ) {

        if (
          !process.env[envVar]
        ) {

          missingEnvVars.push(
            envVar
          );
        }
      }
    }

    /**
     * ---------------------------------------------------
     * Validate AI Providers
     * ---------------------------------------------------
     */

    const availableAIProviders =

      AI_PROVIDER_ENV_VARS.filter(

        (envVar) =>

          Boolean(
            process.env[envVar]
          )
      );

    /**
     * Require at least ONE AI provider
     */

    if (
      availableAIProviders.length === 0
    ) {

      missingEnvVars.push(
        "At least one AI provider API key is required"
      );
    }

    /**
     * ---------------------------------------------------
     * Startup Failure
     * ---------------------------------------------------
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
     * ---------------------------------------------------
     * Successful Validation
     * ---------------------------------------------------
     */

    logger.success(

      "Environment variables validated successfully",

      {

        availableAIProviders:
          availableAIProviders.length,
      }
    );
  };

export default validateEnv;
