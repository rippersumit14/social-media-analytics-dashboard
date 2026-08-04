const previousEnv = {
  EMAIL_FROM: process.env.EMAIL_FROM,
  CONTACT_RECEIVER_EMAIL:
    process.env.CONTACT_RECEIVER_EMAIL,
};

const { buildContactEmailOptions } =
  await import("../../services/emailService.js");

describe("buildContactEmailOptions", () => {
  beforeEach(() => {
    process.env.EMAIL_FROM =
      "\"CreatorIQ\" <no-reply@example.com>";
    process.env.CONTACT_RECEIVER_EMAIL =
      "support@example.com";
  });

  afterAll(() => {
    process.env.EMAIL_FROM =
      previousEnv.EMAIL_FROM;
    process.env.CONTACT_RECEIVER_EMAIL =
      previousEnv.CONTACT_RECEIVER_EMAIL;
  });

  it("builds a contact email with reply-to and configured receiver", () => {
    const options =
      buildContactEmailOptions({
        name: "Sumit",
        email: "sumit@example.com",
        category: "Feedback",
        subject: "Review request",
        message: "This product is ready for review.",
      });

    expect(options.to).toBe("support@example.com");
    expect(options.replyTo).toBe("sumit@example.com");
    expect(options.subject).toBe(
      "CreatorIQ contact - Feedback: Review request"
    );
    expect(options.text).toContain(
      "This product is ready for review."
    );
  });

  it("escapes HTML in the rendered contact email body", () => {
    const options =
      buildContactEmailOptions({
        name: "<script>",
        email: "sumit@example.com",
        category: "Technical support",
        subject: "<help>",
        message: "<b>Hello</b>",
      });

    expect(options.html).toContain(
      "&lt;script&gt;"
    );
    expect(options.html).toContain(
      "&lt;help&gt;"
    );
    expect(options.html).toContain(
      "&lt;b&gt;Hello&lt;/b&gt;"
    );
  });
});
