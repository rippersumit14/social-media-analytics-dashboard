import transporter from "../config/mail.js";

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

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

export const buildContactEmailOptions = ({
  name,
  email,
  category,
  subject,
  message,
}) => {
  const receiver =
    process.env.CONTACT_RECEIVER_EMAIL ||
    process.env.EMAIL_USER;

  return {
    from:
      process.env.EMAIL_FROM ||
      `"Creator Growth AI" <${process.env.EMAIL_USER}>`,

    to: receiver,

    replyTo: email,

    subject:
      `CreatorIQ contact - ${category}: ${subject || "Website inquiry"}`,

    text:
      [
        `Name: ${name}`,
        `Email: ${email}`,
        `Category: ${category}`,
        `Subject: ${subject || "Website inquiry"}`,
        "",
        "Message:",
        message,
      ].join("\n"),

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
        <h2>New CreatorIQ Contact Message</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Category:</strong> ${escapeHtml(category)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(subject || "Website inquiry")}</p>
        <hr />
        <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
      </div>
    `,
  };
};

export const sendContactEmail = async ({
  name,
  email,
  category,
  subject,
  message,
}) => {
  const mailOptions =
    buildContactEmailOptions({
      name,
      email,
      category,
      subject,
      message,
    });

  await transporter.sendMail(mailOptions);

  return {
    delivered: true,
    receiver:
      mailOptions.to,
  };
};
