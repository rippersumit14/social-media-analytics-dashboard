/**
 * ----------------------------------------
 * Generate 6 Digit OTP
 * ----------------------------------------
 *
 * Example:
 * 483921
 * 726105
 */

export const generateOTP = () => {
    return Math.floor(
        10000 + Math.random() * 900000
    ).toString();
};

