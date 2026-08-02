import { Queue, QueueEvents } from "bullmq";
import Redis from "ioredis";

import { sendVerificationEmail } from "../services/emailService.js";
import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";

export const EMAIL_QUEUE_NAME = "email-delivery";
export const SEND_VERIFICATION_EMAIL_JOB = "send-verification-email";

const EMAIL_DELIVERY_TIMEOUT_MS =
  Number(process.env.EMAIL_DELIVERY_TIMEOUT_MS) || 15000;

let emailQueue;
let emailQueueEvents;
let queueConnection;
let eventsConnection;

function createBullConnection() {
  return new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
  });
}

export function isEmailQueueEnabled() {
  return Boolean(
    process.env.REDIS_URL &&
    process.env.NODE_ENV !== "test"
  );
}

export function getEmailQueue() {
  if (!isEmailQueueEnabled()) {
    return null;
  }

  if (!emailQueue) {
    queueConnection = createBullConnection();

    emailQueue = new Queue(
      EMAIL_QUEUE_NAME,
      {
        connection:
          queueConnection,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 1000,
          },
          removeOnComplete: {
            count: 100,
          },
          removeOnFail: {
            count: 100,
          },
        },
      }
    );
  }

  return emailQueue;
}

export function getEmailQueueEvents() {
  if (!isEmailQueueEnabled()) {
    return null;
  }

  if (!emailQueueEvents) {
    eventsConnection = createBullConnection();

    emailQueueEvents =
      new QueueEvents(
        EMAIL_QUEUE_NAME,
        {
          connection:
            eventsConnection,
        }
      );
  }

  return emailQueueEvents;
}

export async function deliverVerificationEmail(payload) {
  if (!isEmailQueueEnabled()) {
    await sendVerificationEmail(payload);
    return {
      delivery:
        "sent-direct",
    };
  }

  try {
    const queue =
      getEmailQueue();

    const queueEvents =
      getEmailQueueEvents();

    await queueEvents.waitUntilReady();

    const job =
      await queue.add(
        SEND_VERIFICATION_EMAIL_JOB,
        {
          email:
            payload.email,
          name:
            payload.name,
          otp:
            payload.otp,
          purpose:
            payload.purpose,
        }
      );

    await job.waitUntilFinished(
      queueEvents,
      EMAIL_DELIVERY_TIMEOUT_MS
    );

    return {
      delivery:
        "sent-queued",
      jobId:
        job.id,
    };
  } catch (error) {
    logger.warn(
      "Queued email delivery failed; attempting direct delivery",
      {
        reason:
          error.message,
        purpose:
          payload.purpose,
      }
    );

    try {
      await sendVerificationEmail(payload);
      return {
        delivery:
          "sent-direct-fallback",
      };
    } catch {
      throw new AppError(
        "Verification email could not be delivered. Please try again later.",
        503
      );
    }
  }
}

export async function closeEmailQueue() {
  await Promise.allSettled([
    emailQueue?.close(),
    emailQueueEvents?.close(),
    queueConnection?.quit(),
    eventsConnection?.quit(),
  ]);

  emailQueue = null;
  emailQueueEvents = null;
  queueConnection = null;
  eventsConnection = null;
}
