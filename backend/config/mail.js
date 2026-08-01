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
  } catch (error) {
    logger.warn(
      "Mail server connection failed",
      {
        message:
          "Email delivery is unavailable. Check SMTP provider configuration.",
      }
    );
  }
};

export default transporter;
