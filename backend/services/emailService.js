import transporter from "../config/mail.js";

const DEFAULT_EMAIL_FROM =
  "Creator Growth AI <onboarding@resend.dev>";

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export const buildContactEmailOptions = ({
  name,
  email,
  category,
  subject,
  message,
}) => {
  const receiver =
    process.env.CONTACT_RECEIVER_EMAIL ||
    process.env.EMAIL_FROM;

  return {
    from:
      process.env.EMAIL_FROM ||
      DEFAULT_EMAIL_FROM,

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
