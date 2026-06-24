import express from "express";

import protect from "../middlewares/authMiddleware.js";

import {
  createNoteController,
  getNotesController,
  updateNoteController,
  deleteNoteController,
  restoreNoteController,
  archiveNoteController,
  unarchiveNoteController,
  pinNoteController,
  unpinNoteController,
} from "../controllers/personalNoteController.js";

const router = express.Router();

/**
 * Protected Routes
 */

router.use(protect);

/**
 * CRUD
 */

router
  .route("/")
  .post(createNoteController)
  .get(getNotesController);

router
  .route("/:noteId")
  .patch(updateNoteController)
  .delete(deleteNoteController);

/**
 * Actions
 */

router.patch(
  "/:noteId/restore",
  restoreNoteController
);

router.patch(
  "/:noteId/archive",
  archiveNoteController
);

router.patch(
  "/:noteId/unarchive",
  unarchiveNoteController
);

router.patch(
  "/:noteId/pin",
  pinNoteController
);

router.patch(
  "/:noteId/unpin",
  unpinNoteController
);

export default router;