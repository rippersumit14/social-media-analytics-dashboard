import express from "express";

import validateRequest from "../middlewares/validateRequest.js";
import { contactRateLimiter } from "../middlewares/rateLimiter.js";
import { submitContactController } from "../controllers/contactController.js";
import { contactSchema } from "../validators/contactValidators.js";

const router = express.Router();

router.post(
  "/",
  contactRateLimiter,
  validateRequest(contactSchema),
  submitContactController
);

export default router;
