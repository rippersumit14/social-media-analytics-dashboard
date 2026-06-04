import User from "../models/User.js";
import AppError from "../utils/AppError.js";

/**
 * --------------------------------------------------
 * Register User
 * --------------------------------------------------
 */

export const registerUser = async ({
  name,
  email,
  password,
}) => {
  const existingUser = await User.findOne({
    email,
  });

  if (existingUser) {
    throw new AppError(
      "User already exists with this email",
      409
    );
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  return user;  
};

/**
 * --------------------------------------------------
 * Login User
 * --------------------------------------------------
 */

export const loginUser = async ({
  email,
  password,
}) => {
  const user = await User.findOne({
    email,
  }).select("+password");

  if (!user) {
    throw new AppError(
      "Invalid email or password",
      401
    );
  }

  const isPasswordCorrect =
    await user.matchPassword(password);

  if (!isPasswordCorrect) {
    throw new AppError(
      "Invalid email or password",
      401
    );
  }

  return user;
};

/**
 * --------------------------------------------------
 * Get Current User
 * --------------------------------------------------
 */

export const getCurrentUser = async (
  userId
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(
      "User not found",
      404
    );
  }

  return user;
};

/**
 * --------------------------------------------------
 * Update Password
 * --------------------------------------------------
 */

export const updatePassword = async ({
  userId,
  currentPassword,
  newPassword,
}) => {
  const user = await User.findById(
    userId
  ).select("+password");

  if (!user) {
    throw new AppError(
      "User not found",
      404
    );
  }

  const isPasswordCorrect =
    await user.matchPassword(
      currentPassword
    );

  if (!isPasswordCorrect) {
    throw new AppError(
      "Current password is incorrect",
      400
    );
  }

  user.password = newPassword;

  await user.save();

  return user;
};