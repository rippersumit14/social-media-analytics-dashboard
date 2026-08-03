import nodemailer from "nodemailer";
import logger from "../utils/logger.js";

/**
 * --------------------------------------------------
 * Nodemailer Transporter
 * --------------------------------------------------
 *
 * Purpose:
 * Send emails using Gmail SMTP
 *
 * Used For:
 * - Email Verification OTP
 * - Resend OTP
 * - Password Reset (Future)
 */

const transporter = nodemailer.createTransport({
  service: "gmail",
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 15000,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * --------------------------------------------------
 * Verify SMTP Connection
 * --------------------------------------------------
 *
 * Helpful during server startup.
 */

export const verifyMailConnection = async () => {
  try {
    await transporter.verify();

    logger.info(
      "Mail server connected successfully"
    );

    return true;
  } catch (error) {
    logger.warn(
      "Mail server connection failed",
      {
        message:
          "Email delivery is unavailable. Check SMTP provider configuration.",
        code: error.code,
        command: error.command,
        responseCode: error.responseCode,
        reason: error.message,
      }
    );

    return false;
  }
};

export default transporter;
