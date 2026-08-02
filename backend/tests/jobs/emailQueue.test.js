import {
  jest,
  beforeEach,
  describe,
  expect,
  it,
} from "@jest/globals";

const sendVerificationEmail =
  jest.fn();

jest.unstable_mockModule(
  "../../services/emailService.js",
  () => ({
    sendVerificationEmail,
  })
);

const {
  deliverVerificationEmail,
  isEmailQueueEnabled,
} = await import(
  "../../jobs/emailQueue.js"
);

describe("emailQueue", () => {
  beforeEach(() => {
    sendVerificationEmail.mockReset();
    sendVerificationEmail.mockResolvedValue();
  });

  it("uses direct email delivery when queues are disabled for tests", async () => {
    expect(isEmailQueueEnabled())
      .toBe(false);

    await expect(
      deliverVerificationEmail({
        email: "user@example.com",
        name: "Test User",
        otp: "123456",
        purpose: "test",
      })
    ).resolves.toEqual({
      delivery: "sent-direct",
    });

    expect(sendVerificationEmail)
      .toHaveBeenCalledWith(
        expect.objectContaining({
          email: "user@example.com",
          otp: "123456",
        })
      );
  });
});
