import  jwt  from "jsonwebtoken";

/**
 * 
 * Generate authentication token
 * 
 * Purpose:
 * Creates a signed JWT for authenticated users.
 * 
 * Payload:
 * {
 *    id: user._id
 * }
 * 
 * security:
 * Only the user ID is stored inside the token
 * Sensitive information should never be embeded
 */

const generateToken = (userId) => {
  const jwtSecret = process.env.JWT_SECRET;

  const jwtExpiresIn = 
    process.env.JWT_EXPIRES_IN || "7d";

  if(!jwtSecret) {
    throw new Error(
      "JWT_SECRET is required to generate authentication tokens"
    );
  }

  return jwt.sign(
    {
      id: userId,
    },
    jwtSecret,
    {
      expiresIn: jwtExpiresIn,
    }
  );
};

export default generateToken;

