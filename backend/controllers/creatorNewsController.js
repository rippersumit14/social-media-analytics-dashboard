import asyncHandler from "../middlewares/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  getCreatorNews,
  refreshCreatorNews,
} from "../services/creatorNewsService.js";

export const getCreatorNewsController =
  asyncHandler(async (req, res) => {
    const data =
      await getCreatorNews({
        category:
          req.query.category,
        limit:
          req.query.limit,
      });

    return res.status(200).json(
      new ApiResponse({
        success: true,
        statusCode: 200,
        message:
          "Creator news fetched successfully",
        data,
      })
    );
  });

export const refreshCreatorNewsController =
  asyncHandler(async (req, res) => {
    const results =
      await refreshCreatorNews();

    return res.status(200).json(
      new ApiResponse({
        success: true,
        statusCode: 200,
        message:
          "Creator news refresh completed",
        data: {
          results,
        },
      })
    );
  });
