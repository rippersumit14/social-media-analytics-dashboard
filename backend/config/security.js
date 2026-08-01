// config/security.js

import helmet from "helmet";
import cors from "cors";

/**
 * ---------------------------------------------------
 * Helmet Security Middleware
 * ---------------------------------------------------
 *
 * Protects against:
 * - clickjacking
 * - MIME sniffing
 * - XSS
 * - insecure headers
 */

export const helmetConfig =
  helmet({

    /**
     * Disable CSP for development
     *
     * Frontend frameworks + SSE +
     * local development often conflict
     * with strict CSP initially.
     */
    contentSecurityPolicy:
      process.env.NODE_ENV ===
      "production",

    /**
     * Prevent iframe embedding
     */
    frameguard: {
      action: "deny",
    },

    /**
     * Hide x-powered-by
     */
    hidePoweredBy:
      true,

    /**
     * Prevent MIME sniffing
     */
    noSniff: true,

    /**
     * Browser XSS protection
     */
    xssFilter: true,
  });

/**
 * ---------------------------------------------------
 * Allowed Frontend Origins
 * ---------------------------------------------------
 */

const localDevelopmentOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

const configuredOrigins = [

  process.env.FRONTEND_URL,

  ...(process.env.FRONTEND_ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
];

const allowedOrigins =
  new Set([
    ...configuredOrigins.filter(Boolean),
    ...(process.env.NODE_ENV === "production"
      ? []
      : localDevelopmentOrigins),
  ]);

/**
 * ---------------------------------------------------
 * CORS Configuration
 * ---------------------------------------------------
 */

export const corsConfig =
  cors({

    origin: (
      origin,
      callback
    ) => {

      /**
       * Allow:
       * - server requests
       * - postman
       * - mobile apps
       */
      if (!origin) {

        return callback(
          null,
          true
        );
      }

      /**
       * Allow trusted origins
       */
      if (
        allowedOrigins.has(
          origin
        )
      ) {

        return callback(
          null,
          true
        );
      }

      /**
       * Block untrusted origins
       */
      return callback(

        new Error(
          "CORS policy blocked this origin"
        )
      );
    },

    /**
     * Allow credentials
     */
    credentials:
      true,

    /**
     * Allowed HTTP methods
     */
    methods: [

      "GET",

      "POST",

      "PUT",

      "PATCH",

      "DELETE",

      "OPTIONS",
    ],

    /**
     * Allowed request headers
     */
    allowedHeaders: [

      "Content-Type",

      "Authorization",
    ],
  });

/**
 * ---------------------------------------------------
 * JSON Payload Limits
 * ---------------------------------------------------
 */

export const JSON_PAYLOAD_LIMIT =
  "2mb";

/**
 * ---------------------------------------------------
 * URL Encoded Payload Limits
 * ---------------------------------------------------
 */

export const URL_ENCODED_LIMIT =
  "2mb";
