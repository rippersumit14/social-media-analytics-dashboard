// config/env.js

import dotenv from "dotenv";

import logger from "../utils/logger.js";

/**
 * ---------------------------------------------------
 * Load Environment Variables
 * ---------------------------------------------------
 */

dotenv.config();

/**
 * Environment loaded log
 */
logger.info(
  "Environment variables loaded"
);


