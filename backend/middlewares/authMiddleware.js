import jwt from "jsonwebtoken";
import User from "../models/User.js";
import logger from "../utils/logger.js";

/**
 * --------------------------------------------------
 * Authentication Middleware
 * --------------------------------------------------
 */

const protect = async (
  req,
  res,
  next
) => {

  try {

    const authHeader =
      req.headers.authorization || "";

    const [scheme, token] =
      authHeader.split(" ");

    if (
      scheme !== "Bearer" ||
      !token
    ) {

      return res.status(401).json({
        success: false,

        message:
          "Not authorized, no token provided",
      });
    }

    if (
      !process.env.JWT_SECRET
    ) {

      logger.error(
        "JWT authentication secret is missing"
      );

      return res.status(500).json({
        success: false,

        message:
          "Authentication is not configured",
      });
    }

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    const user =
      await User.findById(
        decoded.id
      )
        .select("-password");

    if (!user) {

      return res.status(401).json({
        success: false,

        message:
          "Not authorized, user not found",
      });
    }

    req.user = user;

    return next();

  } catch (error) {

    logger.warn(
      "Authentication failed",
      {
        message:
          error.message,
      }
    );

    return res.status(401).json({
      success: false,

      message:
        "Not authorized, invalid token",
    });
  }
};

export default protect;
