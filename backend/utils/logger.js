import winston from "winston";
import chalk from "chalk";

/**
 * ---------------------------------------------------
 * Custom Log Colors
 * ---------------------------------------------------
 */

const logColors = {

  info:
    chalk.cyan.bold,

  warn:
    chalk.yellow.bold,

  error:
    chalk.red.bold,

  debug:
    chalk.magenta.bold,

  success:
    chalk.green.bold,

  ai:
    chalk.blue.bold,

  db:
    chalk.greenBright.bold,

  sse:
    chalk.hex("#ff8800").bold,
};

/**
 * ---------------------------------------------------
 * Build Formatted Timestamp
 * ---------------------------------------------------
 */

const buildTimestamp =
  () => {

    return new Date()
      .toLocaleTimeString();
  };

/**
 * ---------------------------------------------------
 * Custom Console Formatter
 * ---------------------------------------------------
 */

const consoleFormat =
  winston.format.printf(

    ({
      level,
      message,
      timestamp,
      ...meta
    }) => {

      /**
       * Uppercase level
       */
      const upperLevel =
        level.toUpperCase();

      /**
       * Select colors
       */
      const levelColor =
        logColors[level]
        || chalk.white.bold;

      /**
       * Build metadata
       */
      const metadata =
        Object.keys(meta)
          .length > 0

          ? `\n${chalk.gray(
              JSON.stringify(
                meta,
                null,
                2
              )
            )}`

          : "";

      return (
        `${chalk.gray(
          `[${timestamp}]`
        )} ` +

        `${levelColor(
          upperLevel.padEnd(7)
        )} ` +

        `${chalk.white(
          message
        )}` +

        metadata
      );
    }
  );

/**
 * ---------------------------------------------------
 * Winston Logger Instance
 * ---------------------------------------------------
 */

const logger =
  winston.createLogger({

    level:
      process.env.NODE_ENV ===
      "development"

        ? "debug"

        : "info",

    format:
      winston.format.combine(

        winston.format.timestamp({

          format:
            buildTimestamp,
        }),

        consoleFormat
      ),

    transports: [

      /**
       * Console logger
       */
      new winston.transports.Console(),
    ],
  });

/**
 * ---------------------------------------------------
 * Custom Helper Logs
 * ---------------------------------------------------
 */

/**
 * AI Logs
 */
logger.ai =
  (
    message,
    meta = {}
  ) => {

    logger.info(
      chalk.blue.bold(
        "[AI]"
      ) +
        " " +
        message,

      meta
    );
  };

/**
 * Database Logs
 */
logger.db =
  (
    message,
    meta = {}
  ) => {

    logger.info(
      chalk.green.bold(
        "[DB]"
      ) +
        " " +
        message,

      meta
    );
  };

/**
 * SSE Logs
 */
logger.sse =
  (
    message,
    meta = {}
  ) => {

    logger.info(
      chalk.hex("#ff8800").bold(
        "[SSE]"
      ) +
        " " +
        message,

      meta
    );
  };

/**
 * Success Logs
 */
logger.success =
  (
    message,
    meta = {}
  ) => {

    logger.info(
      chalk.green.bold(
        "[SUCCESS]"
      ) +
        " " +
        message,

      meta
    );
  };

export default logger;