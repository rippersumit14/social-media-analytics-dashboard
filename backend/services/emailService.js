import transporter from "../config/mail.js";

/**
 * ----------------------------------------
 * Send Email Verification OTP
 * ----------------------------------------
 *
 * Used During:
 * - Registration
 * - Resend OTP
 */

export const sendVerificationEmail = async ({
  email,
  name,
  otp,
}) => {
  const mailOptions = {
    from:
      process.env.EMAIL_FROM ||
      `"Creator Growth AI" <${process.env.EMAIL_USER}>`,

    to: email,

    subject: "Verify Your Email Address",

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        
        <h2>Email Verification</h2>

        <p>Hello ${name},</p>

        <p>
          Thank you for registering with Creator Growth AI.
        </p>

        <p>
          Use the following OTP to verify your email address:
        </p>

        <div
          style="
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 4px;
            margin: 20px 0;
          "
        >
          ${otp}
        </div>

        <p>
          This OTP will expire in 10 minutes.
        </p>

        <p>
          If you did not create this account,
          please ignore this email.
        </p>

        <br />

        <p>
          Regards,
          <br />
          Creator Growth AI Team
        </p>

      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
