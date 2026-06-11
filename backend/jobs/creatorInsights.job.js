import InstagramAccount
  from "../models/InstagramAccount.js";

import {
  generateCreatorInsights,
} from "../services/creatorInsightsService.js";

import logger
  from "../utils/logger.js";

/**
 * --------------------------------------------------
 * Creator Insights Job
 * --------------------------------------------------
 *
 * Generates actionable insights
 * for all active Instagram accounts.
 *
 * Flow:
 *
 * Active Accounts
 *       ↓
 * Generate Insights
 *       ↓
 * Save Insights
 *
 */

export const runCreatorInsightsJob =
  async () => {

    logger.info(
      "Creator Insights Job Started"
    );

    try {

      const accounts =
        await InstagramAccount.find({
          isActive: true,
        }).select(
          "_id user username"
        );

      logger.info(
        `Found ${accounts.length} active accounts`
      );

      for (const account of accounts) {

        try {

          const result =
            await generateCreatorInsights(
              account.user
            );

          logger.info(
            `Generated ${result.insightCount} insights for ${account.username}`
          );

        } catch (error) {

          logger.error(
            `Creator insights failed for ${account.username}`,
            {
              error:
                error.message,
            }
          );
        }
      }

      logger.info(
        "Creator Insights Job Completed"
      );

    } catch (error) {

      logger.error(
        "Creator Insights Job Failed",
        {
          error:
            error.message,
        }
      );
    }
  };

export default
  runCreatorInsightsJob;