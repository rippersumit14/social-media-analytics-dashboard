import cron from "node-cron";

import logger
  from "../utils/logger.js";

import runAnalyticsSnapshotJob
  from "./analyticsSnapshot.job.js";

import runCreatorScoreJob
  from "./creatorScore.job.js";

import runCreatorInsightsJob
  from "./creatorInsights.job.js";

import runCreatorNewsJob
  from "./creatorNews.job.js";

/**
 * --------------------------------------------------
 * Automation Runner
 * --------------------------------------------------
 *
 * Central scheduler for all
 * backend automation jobs.
 *
 * Execution Order:
 *
 * Analytics Snapshot
 *        ↓
 * Creator Score
 *        ↓
 * Creator Insights
 *
 * Future:
 *
 * Media Sync
 * Recommendations
 * Email Reports
 *
 */

/**
 * --------------------------------------------------
 * Run Full Pipeline
 * --------------------------------------------------
 */

const runAutomationPipeline =
  async () => {

    logger.info(
      "\n================================="
    );

    logger.info(
      "AUTOMATION PIPELINE STARTED"
    );

    logger.info(
      "=================================\n"
    );

    try {

      /**
       * Analytics Snapshot
       */

      await runAnalyticsSnapshotJob();

      /**
       * Creator Score
       */

      await runCreatorScoreJob();

      /**
       * Creator Insights
       */

      await runCreatorInsightsJob();

      logger.info(
        "\n================================="
      );

      logger.info(
        "AUTOMATION PIPELINE COMPLETED"
      );

      logger.info(
        "=================================\n"
      );

    } catch (error) {

      logger.error(
        "AUTOMATION PIPELINE FAILED",
        {
          error:
            error.message,
        }
      );
    }
  };

/**
 * --------------------------------------------------
 * Start Cron Jobs
 * --------------------------------------------------
 */

export const startAutomationRunner =
  () => {

    logger.info(
      "Automation Runner Started"
    );

    /**
     * Every 6 Hours
     */

    cron.schedule(
      "0 */6 * * *",
      async () => {

        logger.info(
          "Scheduled Automation Triggered"
        );

        await runAutomationPipeline();
      }
    );

    /**
     * Daily creator market update
     */

    cron.schedule(
      process.env.CREATOR_NEWS_REFRESH_CRON ||
        "15 8 * * *",
      async () => {
        try {
          await runCreatorNewsJob();
        } catch (error) {
          logger.warn(
            "Scheduled creator news refresh failed",
            {
              message:
                error.message,
            }
          );
        }
      }
    );

    logger.info(
      "Automation Schedule Registered"
    );
  };

export default
  startAutomationRunner;
