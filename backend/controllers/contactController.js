import asyncHandler from "../middlewares/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";
import { sendContactEmail } from "../services/emailService.js";

export const submitContactController = asyncHandler(
  async (req, res) => {
    try {
      await sendContactEmail(req.body);

      logger.info("Contact message delivered", {
        category:
          req.body.category,
      });

      return res.status(200).json(
        new ApiResponse({
          success: true,
          statusCode: 200,
          message:
            "Contact message sent successfully",
          data: {
            delivered:
              true,
          },
        })
      );
    } catch (error) {
      logger.warn("Contact message delivery failed", {
        category:
          req.body.category,
        providerStatus:
          error.responseCode,
      });

      throw new AppError(
        "Contact delivery is temporarily unavailable. Please use the public support email.",
        503
      );
    }
  }
);
