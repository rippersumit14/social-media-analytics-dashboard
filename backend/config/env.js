import dotenv from "dotenv";

/**
 * Load environment variables before any app/config modules are imported.
 *
 * Keeping this import first prevents config modules from reading undefined
 * values during startup.
 */
dotenv.config();
