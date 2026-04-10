//This utility creates a signed JWT using your JWT_SECRET.

import jwt from "jsonwebtoken";

/**
 * Generate JWT token for authenticated user.
 * @param {string} id - MongoDB user ID
 * @returns {string} signed JWT token
 */

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};

export default generateToken;
