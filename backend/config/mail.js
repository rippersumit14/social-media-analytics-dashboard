import nodemailer from "nodemailer";

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

    console.log(
      "Mail server connected successfully"
    );
  } catch (error) {
    console.error(
      "Mail server connection failed:",
      error.message
    );

    /**
     * Debug Info
     * Remove later if desired.
     */
    console.log(
      "EMAIL_USER:",
      process.env.EMAIL_USER
        ? "Loaded"
        : "Missing"
    );

    console.log(
      "EMAIL_PASSWORD:",
      process.env.EMAIL_PASSWORD
        ? "Loaded"
        : "Missing"
    );
  }
};

export default transporter;