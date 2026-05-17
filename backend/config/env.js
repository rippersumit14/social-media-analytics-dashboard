/**
 * config/env.js
 *
 * Centralized environment loader.
 *
 * Important:
 * This MUST execute before:
 * - Cloudinary config
 * - Redis config
 * - AI services
 * - Database services
 */

import dotenv from "dotenv";

/**
 * Load environment variables.
 */
dotenv.config();

/**
 * Optional startup debug log.
 */
console.log(
  "[ENV] Environment variables loaded"
);