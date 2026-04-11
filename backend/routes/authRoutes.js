import express from "express";
import{
    registerUser,
    loginUser,
    getCurrentUser,
} from "../controllers/authContoller.js";
import protect from "../middleware/authMiddleware.js";


const router = express.Router();

/**
 * Public routes
 */
router.post("/register", registerUser);
router.post("/login", loginUser);

//Private route
 
router.get("/me", protect, getCurrentUser);

export default router;
