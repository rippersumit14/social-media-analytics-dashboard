import User from "../models/User.js";
import AppError from "../utils/AppError.js";

const normalizeEmail = (email = "") =>
  email.trim().toLowerCase();

/**
 * Local email/password auth remains available as a fallback.
 * Public verification now comes from Google sign-in, so local signup
 * no longer depends on email-code delivery.
 */
export const registerUser = async ({
  name,
  email,
  password,
}) => {
  const normalizedEmail =
    normalizeEmail(email);

  const existingUser =
    await User.findOne({
      email:
        normalizedEmail,
    });

  if (existingUser) {
    throw new AppError(
      "User already exists with this email",
      409
    );
  }

  const user =
    await User.create({
      name,
      email:
        normalizedEmail,
      password,
      authProvider:
        "local",
      isEmailVerified:
        true,
      emailVerifiedAt:
        new Date(),
    });

  return {
    user,
    message:
      "Account created successfully.",
  };
};

export const loginUser = async ({
  email,
  password,
}) => {
  const normalizedEmail =
    normalizeEmail(email);

  const user =
    await User.findOne({
      email:
        normalizedEmail,
    }).select("+password");

  if (!user) {
    throw new AppError(
      "Invalid email or password",
      401
    );
  }

  if (!user.password) {
    throw new AppError(
      "Use Google sign-in for this account",
      400
    );
  }

  const isPasswordCorrect =
    await user.comparePassword(
      password
    );

  if (!isPasswordCorrect) {
    throw new AppError(
      "Invalid email or password",
      401
    );
  }

  user.lastLoginAt =
    new Date();

  await user.save();

  return user;
};

const verifyGoogleCredential = async (
  credential
) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new AppError(
      "Google authentication is not configured",
      500
    );
  }

  const url =
    new URL("https://oauth2.googleapis.com/tokeninfo");

  url.searchParams.set(
    "id_token",
    credential
  );

  const response =
    await fetch(url);

  const profile =
    await response.json();

  if (!response.ok) {
    throw new AppError(
      "Google sign-in could not be verified",
      401
    );
  }

  if (
    profile.aud !==
    process.env.GOOGLE_CLIENT_ID
  ) {
    throw new AppError(
      "Google sign-in client does not match this application",
      401
    );
  }

  if (profile.email_verified !== "true") {
    throw new AppError(
      "Google account email is not verified",
      403
    );
  }

  return {
    googleId:
      profile.sub,
    email:
      normalizeEmail(profile.email),
    name:
      profile.name ||
      profile.email?.split("@")[0] ||
      "Creator",
    avatar:
      profile.picture || "",
  };
};

export const loginWithGoogle = async ({
  credential,
}) => {
  if (!credential) {
    throw new AppError(
      "Google credential is required",
      400
    );
  }

  const googleProfile =
    await verifyGoogleCredential(
      credential
    );

  let user =
    await User.findOne({
      email:
        googleProfile.email,
    });

  if (user) {
    user.googleId =
      user.googleId ||
      googleProfile.googleId;
    user.authProvider =
      "google";
    user.isEmailVerified =
      true;
    user.emailVerifiedAt =
      user.emailVerifiedAt ||
      new Date();
    user.avatar =
      user.avatar ||
      googleProfile.avatar;
    user.lastLoginAt =
      new Date();

    await user.save();

    return user;
  }

  user =
    await User.create({
      name:
        googleProfile.name,
      email:
        googleProfile.email,
      avatar:
        googleProfile.avatar,
      googleId:
        googleProfile.googleId,
      authProvider:
        "google",
      isEmailVerified:
        true,
      emailVerifiedAt:
        new Date(),
      lastLoginAt:
        new Date(),
    });

  return user;
};

export const getCurrentUser = async (
  userId
) => {
  const user =
    await User.findById(
      userId
    );

  if (!user) {
    throw new AppError(
      "User not found",
      404
    );
  }

  return user;
};

export const updatePassword = async ({
  userId,
  currentPassword,
  newPassword,
}) => {
  const user =
    await User.findById(
      userId
    ).select("+password");

  if (!user) {
    throw new AppError(
      "User not found",
      404
    );
  }

  if (!user.password) {
    throw new AppError(
      "Password updates are only available for email/password accounts",
      400
    );
  }

  const isPasswordCorrect =
    await user.comparePassword(
      currentPassword
    );

  if (!isPasswordCorrect) {
    throw new AppError(
      "Current password is incorrect",
      400
    );
  }

  user.password =
    newPassword;

  await user.save();

  return {
    message:
      "Password updated successfully",
  };
};
