import express from "express";
import{
    createAnalyticsSnapshot,
    getAnalyticsSnapshotsByAccount,
} from "../controllers/analyticsSnapshotController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();


/**
 * @route   POST /api/analytics-snapshots
 * @desc    Create analytics snapshot
 * @access  Private
 */
router.post("/", protect, createAnalyticsSnapshot);

/**
 * @route   GET /api/analytics-snapshots/:socialAccountId
 * @desc    Get all snapshots for one social account
 * @access  Private
 */
router.get("/:socialAccountId", protect, getAnalyticsSnapshotsByAccount);

export default router;