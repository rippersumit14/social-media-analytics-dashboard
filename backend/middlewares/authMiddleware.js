import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Verify JWT auth and attach the authenticated user to req.user.
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        message: "Not authorized, no token provided",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("[AUTH_CONFIG_ERROR] JWT_SECRET is missing");

      return res.status(500).json({
        message: "Authentication is not configured",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "Not authorized, user not found",
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error("[AUTH_ERROR]", {
      message: error.message,
    });

    return res.status(401).json({
      message: "Not authorized, invalid token",
    });
  }
};

export default protect;
