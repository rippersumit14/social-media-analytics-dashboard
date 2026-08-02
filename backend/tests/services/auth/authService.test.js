import {
  jest,
  beforeEach,
  describe,
  expect,
  it,
} from "@jest/globals";

const deliverVerificationEmail =
  jest.fn();

jest.unstable_mockModule(
  "../../../jobs/emailQueue.js",
  () => ({
    deliverVerificationEmail,
  })
);

jest.unstable_mockModule(
  "../../../utils/generateOTP.js",
  () => ({
    generateOTP: () => "123456",
  })
);

const User =
  (await import(
    "../../../models/User.js"
  )).default;

const EmailVerificationOTP =
  (await import(
    "../../../models/EmailVerificationOTP.js"
  )).default;

const {
  registerUser,
  resendOTP,
  verifyEmail,
  loginUser,
} = await import(
  "../../../services/authService.js"
);

describe("authService OTP reliability", () => {
  beforeEach(() => {
    deliverVerificationEmail.mockReset();
    deliverVerificationEmail.mockResolvedValue({
      delivery: "sent-test",
    });
  });

  it("registers a user, normalizes email, creates OTP, and sends verification mail", async () => {
    const result =
      await registerUser({
        name: "Sumit Pandey",
        email: "SUMIT.TEST@Example.com",
        password: "Password@123",
      });

    const user =
      await User.findById(
        result.user._id
      );

    const otp =
      await EmailVerificationOTP.findOne({
        email: "sumit.test@example.com",
      });

    expect(user.email).toBe(
      "sumit.test@example.com"
    );
    expect(user.isEmailVerified).toBe(false);
    expect(otp.otp).toBe("123456");
    expect(deliverVerificationEmail)
      .toHaveBeenCalledWith(
        expect.objectContaining({
          email:
            "sumit.test@example.com",
          otp:
            "123456",
          purpose:
            "registration",
        })
      );
  });

  it("rolls back a new user when verification email delivery fails", async () => {
    deliverVerificationEmail.mockRejectedValue(
      new Error("SMTP unavailable")
    );

    await expect(
      registerUser({
        name: "Rollback User",
        email: "rollback@example.com",
        password: "Password@123",
      })
    ).rejects.toMatchObject({
      statusCode: 503,
    });

    await expect(
      User.findOne({
        email: "rollback@example.com",
      })
    ).resolves.toBeNull();

    await expect(
      EmailVerificationOTP.findOne({
        email: "rollback@example.com",
      })
    ).resolves.toBeNull();
  });

  it("resends OTP for an existing unverified user", async () => {
    const user =
      await User.create({
        name: "Pending User",
        email: "pending@example.com",
        password: "Password@123",
      });

    const result =
      await resendOTP(
        "PENDING@Example.com"
      );

    const otps =
      await EmailVerificationOTP.find({
        email: "pending@example.com",
      });

    expect(result.message).toContain(
      "Verification OTP sent"
    );
    expect(otps).toHaveLength(1);
    expect(otps[0].otp).toBe("123456");
    expect(otps[0].user.toString())
      .toBe(user._id.toString());
  });

  it("blocks rapid OTP resend requests", async () => {
    const user =
      await User.create({
        name: "Cooldown User",
        email: "cooldown@example.com",
        password: "Password@123",
      });

    await EmailVerificationOTP.create({
      user: user._id,
      email: user.email,
      otp: "111111",
      expiresAt:
        new Date(
          Date.now() + 10 * 60 * 1000
        ),
    });

    await expect(
      resendOTP(
        "cooldown@example.com"
      )
    ).rejects.toMatchObject({
      statusCode: 429,
    });
  });

  it("verifies email and deletes all OTP records for that address", async () => {
    const user =
      await User.create({
        name: "Verified User",
        email: "verified@example.com",
        password: "Password@123",
      });

    await EmailVerificationOTP.create([
      {
        user: user._id,
        email: user.email,
        otp: "123456",
        expiresAt:
          new Date(
            Date.now() + 10 * 60 * 1000
          ),
      },
      {
        user: user._id,
        email: user.email,
        otp: "654321",
        expiresAt:
          new Date(
            Date.now() + 10 * 60 * 1000
          ),
      },
    ]);

    await verifyEmail({
      email: "VERIFIED@Example.com",
      otp: "123456",
    });

    const savedUser =
      await User.findById(user._id);

    const remainingOtps =
      await EmailVerificationOTP.find({
        email: user.email,
      });

    expect(savedUser.isEmailVerified)
      .toBe(true);
    expect(remainingOtps)
      .toHaveLength(0);
  });

  it("rejects login for unverified accounts", async () => {
    await User.create({
      name: "Login Pending",
      email: "login-pending@example.com",
      password: "Password@123",
    });

    await expect(
      loginUser({
        email: "LOGIN-PENDING@example.com",
        password: "Password@123",
      })
    ).rejects.toMatchObject({
      statusCode: 403,
    });
  });
});
