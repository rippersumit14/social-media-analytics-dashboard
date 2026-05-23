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

const allowedOrigins = [

  process.env.FRONTEND_URL,

  "http://localhost:5173",

  "http://localhost:3000",
];

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
        allowedOrigins.includes(
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