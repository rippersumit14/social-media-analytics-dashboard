import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Protect middleware
 * Verifies JWT token and attaches authenticated user to req.user
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check if authorization header exists and starts with "Bearer "
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // If token is missing, reject request
    if (!token) {
      return res.status(401).json({
        message: "Not authorized, no token provided",
      });
    }

    // Verify token using JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by decoded id and exclude password
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "Not authorized, user not found",
      });
    }

    // Attach user to request object
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Not authorized, invalid token",
      error: error.message,
    });
  }
};

export default protect;