import jwt from "jsonwebtoken";

/**
 * Generate JWT token for authenticated user.
 *
 * JWT_SECRET is required here because issuing a token without a stable secret
 * would make every protected route impossible to trust.
 *
 * @param {string} id - MongoDB user ID
 * @returns {string} signed JWT token
 */
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required to generate auth tokens");
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export default generateToken;
