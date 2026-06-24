import asyncHandler from "../middlewares/asyncHandler.js";

import ApiResponse from "../utils/ApiResponse.js";

import {
  createNote,
  getUserNotes,
  updateNote,
  deleteNote,
  restoreNote,
  archiveNote,
  unarchiveNote,
  pinNote,
  unpinNote,
} from "../services/personalNoteService.js";

/**
 * --------------------------------------------------
 * Create Note
 * --------------------------------------------------
 */

export const createNoteController =
  asyncHandler(async (req, res) => {

    const note =
      await createNote({

        userId:
          req.user._id,

        ...req.body,
      });

    return res.status(201).json(

      new ApiResponse({

        success: true,

        statusCode: 201,

        message:
          "Note created successfully",

        data: {
          note,
        },
      })
    );
  });

/**
 * --------------------------------------------------
 * Get Notes
 * --------------------------------------------------
 */

export const getNotesController =
  asyncHandler(async (req, res) => {

    const notes =
      await getUserNotes(
        req.user._id
      );

    return res.status(200).json(

      new ApiResponse({

        success: true,

        statusCode: 200,

        message:
          "Notes fetched successfully",

        data: {
          notes,
        },
      })
    );
  });

/**
 * --------------------------------------------------
 * Update Note
 * --------------------------------------------------
 */

export const updateNoteController =
  asyncHandler(async (req, res) => {

    const note =
      await updateNote({

        noteId:
          req.params.noteId,

        userId:
          req.user._id,

        ...req.body,
      });

    return res.status(200).json(

      new ApiResponse({

        success: true,

        statusCode: 200,

        message:
          "Note updated successfully",

        data: {
          note,
        },
      })
    );
  });

/**
 * --------------------------------------------------
 * Delete Note
 * --------------------------------------------------
 */

export const deleteNoteController =
  asyncHandler(async (req, res) => {

    const note =
      await deleteNote({

        noteId:
          req.params.noteId,

        userId:
          req.user._id,
      });

    return res.status(200).json(

      new ApiResponse({

        success: true,

        statusCode: 200,

        message:
          "Note deleted successfully",

        data: {
          note,
        },
      })
    );
  });

/**
 * --------------------------------------------------
 * Restore Note
 * --------------------------------------------------
 */

export const restoreNoteController =
  asyncHandler(async (req, res) => {

    const note =
      await restoreNote({

        noteId:
          req.params.noteId,

        userId:
          req.user._id,
      });

    return res.status(200).json(

      new ApiResponse({

        success: true,

        statusCode: 200,

        message:
          "Note restored successfully",

        data: {
          note,
        },
      })
    );
  });

/**
 * --------------------------------------------------
 * Archive Note
 * --------------------------------------------------
 */

export const archiveNoteController =
  asyncHandler(async (req, res) => {

    const note =
      await archiveNote({

        noteId:
          req.params.noteId,

        userId:
          req.user._id,
      });

    return res.status(200).json(

      new ApiResponse({

        success: true,

        statusCode: 200,

        message:
          "Note archived successfully",

        data: {
          note,
        },
      })
    );
  });

/**
 * --------------------------------------------------
 * Unarchive Note
 * --------------------------------------------------
 */

export const unarchiveNoteController =
  asyncHandler(async (req, res) => {

    const note =
      await unarchiveNote({

        noteId:
          req.params.noteId,

        userId:
          req.user._id,
      });

    return res.status(200).json(

      new ApiResponse({

        success: true,

        statusCode: 200,

        message:
          "Note unarchived successfully",

        data: {
          note,
        },
      })
    );
  });

/**
 * --------------------------------------------------
 * Pin Note
 * --------------------------------------------------
 */

export const pinNoteController =
  asyncHandler(async (req, res) => {

    const note =
      await pinNote({

        noteId:
          req.params.noteId,

        userId:
          req.user._id,
      });

    return res.status(200).json(

      new ApiResponse({

        success: true,

        statusCode: 200,

        message:
          "Note pinned successfully",

        data: {
          note,
        },
      })
    );
  });

/**
 * --------------------------------------------------
 * Unpin Note
 * --------------------------------------------------
 */

export const unpinNoteController =
  asyncHandler(async (req, res) => {

    const note =
      await unpinNote({

        noteId:
          req.params.noteId,

        userId:
          req.user._id,
      });

    return res.status(200).json(

      new ApiResponse({

        success: true,

        statusCode: 200,

        message:
          "Note unpinned successfully",

        data: {
          note,
        },
      })
    );
  });