import InstagramAccount
  from "../models/InstagramAccount.js";

import {
  calculateCreatorScore,
} from "../services/creatorScoreService.js";

import logger
  from "../utils/logger.js";

/**
 * --------------------------------------------------
 * Creator Score Job
 * --------------------------------------------------
 *
 * Generates creator scores for all
 * active Instagram accounts.
 *
 * Flow:
 *
 * Active Accounts
 *       ↓
 * Calculate Score
 *       ↓
 * Store Score History
 *
 */

export const runCreatorScoreJob =
  async () => {

    logger.info(
      "Creator Score Job Started"
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

          await calculateCreatorScore(
            account.user
          );

          logger.info(
            `Creator score generated for ${account.username}`
          );

        } catch (error) {

          logger.error(
            `Creator score failed for ${account.username}`,
            {
              error:
                error.message,
            }
          );
        }
      }

      logger.success(
        "Creator Score Job Completed"
      );

    } catch (error) {

      logger.error(
        "Creator Score Job Failed",
        {
          error:
            error.message,
        }
      );
    }
  };

export default
  runCreatorScoreJob;