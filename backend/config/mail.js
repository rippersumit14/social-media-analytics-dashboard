import logger from "../utils/logger.js";

const RESEND_EMAILS_API_URL = "https://api.resend.com/emails";

const EMAIL_DELIVERY_TIMEOUT_MS =
  Number(process.env.EMAIL_DELIVERY_TIMEOUT_MS) || 15000;

const getDefaultSender = () =>
  process.env.EMAIL_FROM || "Creator Growth AI <onboarding@resend.dev>";

const normalizeRecipients = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  return value ? [value] : [];
};

const getResendApiKey = () =>
  process.env.RESEND_API_KEY;

const parseResendResponse = async (response) => {
  const responseText = await response.text();

  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return {
      message: responseText,
    };
  }
};

const sendMail = async (mailOptions = {}) => {
  const apiKey = getResendApiKey();

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is required for email delivery");
  }

  const payload = {
    from: mailOptions.from || getDefaultSender(),
    to: normalizeRecipients(mailOptions.to),
    subject: mailOptions.subject,
  };

  if (mailOptions.html) {
    payload.html = mailOptions.html;
  }

  if (mailOptions.text) {
    payload.text = mailOptions.text;
  }

  if (mailOptions.replyTo) {
    payload.reply_to = mailOptions.replyTo;
  }

  if (mailOptions.cc) {
    payload.cc = normalizeRecipients(mailOptions.cc);
  }

  if (mailOptions.bcc) {
    payload.bcc = normalizeRecipients(mailOptions.bcc);
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    EMAIL_DELIVERY_TIMEOUT_MS
  );

  try {
    const response = await fetch(RESEND_EMAILS_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const responseBody =
      await parseResendResponse(response);

    if (!response.ok) {
      const message =
        responseBody?.message ||
        responseBody?.error ||
        "Resend email delivery failed";

      const error =
        new Error(message);

      error.statusCode = response.status;
      error.provider = "resend";
      error.providerResponse = responseBody;

      throw error;
    }

    logger.info("Email sent successfully", {
      provider: "resend",
      messageId: responseBody?.id,
    });

    return {
      provider: "resend",
      messageId: responseBody?.id,
      response: responseBody,
    };
  } catch (error) {
    if (error.name === "AbortError") {
      const timeoutError =
        new Error("Resend email delivery timed out");

      timeoutError.code = "ETIMEDOUT";
      timeoutError.provider = "resend";

      throw timeoutError;
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

const mailClient = {
  sendMail,
};

export const verifyMailConnection = async () => {
  const apiKeyConfigured =
    Boolean(getResendApiKey());

  if (!apiKeyConfigured) {
    logger.warn("Mail provider configuration missing", {
      provider: "resend",
      message:
        "RESEND_API_KEY is required for email delivery.",
    });

    return false;
  }

  logger.info("Mail provider configured successfully", {
    provider: "resend",
    apiTransport: "https",
    fromConfigured: Boolean(process.env.EMAIL_FROM),
  });

  return true;
};

export default mailClient;
