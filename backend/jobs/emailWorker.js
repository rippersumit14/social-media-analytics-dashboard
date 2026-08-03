import { Worker } from "bullmq";

import {
  createRedisConnection,
} from "../config/redisConnection.js";
import {
  EMAIL_QUEUE_NAME,
  SEND_VERIFICATION_EMAIL_JOB,
  isEmailQueueEnabled,
} from "./emailQueue.js";
import { sendVerificationEmail } from "../services/emailService.js";
import logger from "../utils/logger.js";

let emailWorker;
let workerConnection;

function createWorkerConnection() {
  return createRedisConnection({
    connectionName:
      "creator-growth-email-worker",
    maxRetriesPerRequest: null,
  });
}

export function startEmailWorker() {
  if (!isEmailQueueEnabled()) {
    logger.info(
      "Email queue disabled; direct email delivery will be used"
    );
    return null;
  }

  if (emailWorker) {
    return emailWorker;
  }

  workerConnection =
    createWorkerConnection();

  emailWorker =
    new Worker(
      EMAIL_QUEUE_NAME,
      async (job) => {
        if (
          job.name !==
          SEND_VERIFICATION_EMAIL_JOB
        ) {
          throw new Error(
            "Unsupported email job"
          );
        }

        await sendVerificationEmail(
          job.data
        );

        return {
          delivered:
            true,
        };
      },
      {
        connection:
          workerConnection,
        concurrency:
          Number(
            process.env.EMAIL_QUEUE_CONCURRENCY
          ) || 3,
      }
    );

  emailWorker.on(
    "completed",
    (job) => {
      logger.info(
        "Email job completed",
        {
          jobId:
            job.id,
          name:
            job.name,
        }
      );
    }
  );

  emailWorker.on(
    "failed",
    (job, error) => {
      logger.warn(
        "Email job failed",
        {
          jobId:
            job?.id,
          name:
            job?.name,
          reason:
            error.message,
        }
      );
    }
  );

  logger.info(
    "Email worker started",
    {
      queue:
        EMAIL_QUEUE_NAME,
      concurrency:
        Number(
          process.env.EMAIL_QUEUE_CONCURRENCY
        ) || 3,
    }
  );

  return emailWorker;
}

export async function closeEmailWorker() {
  await Promise.allSettled([
    emailWorker?.close(),
    workerConnection?.quit(),
  ]);

  emailWorker = null;
  workerConnection = null;
}
