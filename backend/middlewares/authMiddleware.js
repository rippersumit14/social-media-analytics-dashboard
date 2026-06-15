import jwt from "jsonwebtoken";
import User from "../models/User.js";

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

    console.log(
      "AUTH START"
    );

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

      console.error(
        "[AUTH_CONFIG_ERROR] JWT_SECRET missing"
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

    console.log(
      "TOKEN VERIFIED"
    );

    const user =
      await User.findById(
        decoded.id
      )
        .select("-password");

    console.log(
      "USER QUERY COMPLETED"
    );

    if (!user) {

      return res.status(401).json({
        success: false,

        message:
          "Not authorized, user not found",
      });
    }

    console.log(
      "USER FOUND"
    );

    req.user = user;

    console.log(
      "AUTH NEXT"
    );

    return next();

  } catch (error) {

    console.error(
      "[AUTH_ERROR]",
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