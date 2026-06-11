import InstagramAccount
  from "../models/InstagramAccount.js";

import {
  createAnalyticsSnapshot,
} from "../services/instagramAnalyticsService.js";

import logger
  from "../utils/logger.js";

/**
 * --------------------------------------------------
 * Analytics Snapshot Job
 * --------------------------------------------------
 *
 * Creates analytics snapshots for
 * all active Instagram accounts.
 *
 * Flow:
 *
 * Active Accounts
 *      ↓
 * Create Snapshot
 *      ↓
 * Store History
 *
 */

export const runAnalyticsSnapshotJob =
  async () => {

    logger.info(
      "Analytics Snapshot Job Started"
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

          await createAnalyticsSnapshot(
            account.user
          );

          logger.info(
            `Snapshot created for ${account.username}`
          );

        } catch (error) {

          logger.error(
            `Snapshot failed for ${account.username}`,
            {
              error:
                error.message,
            }
          );
        }
      }

      logger.success(
        "Analytics Snapshot Job Completed"
      );

    } catch (error) {

      logger.error(
        "Analytics Snapshot Job Failed",
        {
          error:
            error.message,
        }
      );
    }
  };

export default
  runAnalyticsSnapshotJob;