import asyncHandler
  from "../middlewares/asyncHandler.js";

import {
  getDashboardOverview,
} from "../services/dashboardService.js";

/**
 * --------------------------------------------------
 * Dashboard Overview
 * --------------------------------------------------
 */

export const getDashboard =
  asyncHandler(
    async (
      req,
      res
    ) => {

      const data =
        await getDashboardOverview(
          req.user._id
        );

      return res.status(200).json({
        success: true,

        message:
          "Dashboard overview fetched successfully",

        data,
      });
    }
  );