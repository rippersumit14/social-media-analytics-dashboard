import PersonalNote from "../models/PersonalNote.js";

import AppError from "../utils/AppError.js";

/**
 * --------------------------------------------------
 * Create Note
 * --------------------------------------------------
 */

export const createNote = async ({
  userId,
  title,
  content,
  category,
}) => {

  return PersonalNote.create({
    user: userId,
    title,
    content,
    category,
  });
};

/**
 * --------------------------------------------------
 * Get User Notes
 * --------------------------------------------------
 */

export const getUserNotes = async (
  userId
) => {

  return PersonalNote.find({
    user: userId,

    isDeleted: false,
  })
    .sort({
      isPinned: -1,

      updatedAt: -1,
    })
    .lean();
};

/**
 * --------------------------------------------------
 * Get Note By Id
 * --------------------------------------------------
 */

export const getNoteById = async (
  noteId,
  userId
) => {

  const note =
    await PersonalNote.findOne({

      _id: noteId,

      user: userId,

      isDeleted: false,
    });

  if (!note) {

    throw new AppError(
      "Note not found",
      404
    );
  }

  return note;
};

/**
 * --------------------------------------------------
 * Update Note
 * --------------------------------------------------
 */

export const updateNote = async ({
  noteId,
  userId,
  title,
  content,
  category,
}) => {

  const note =
    await getNoteById(
      noteId,
      userId
    );

  if (title !== undefined) {

    note.title = title;
  }

  if (content !== undefined) {

    note.content = content;
  }

  if (category !== undefined) {

    note.category = category;
  }

  await note.save();

  return note;
};

/**
 * --------------------------------------------------
 * Delete Note
 * --------------------------------------------------
 *
 * Soft Delete
 */

export const deleteNote = async ({
  noteId,
  userId,
}) => {

  const note =
    await getNoteById(
      noteId,
      userId
    );

  note.isDeleted = true;

  await note.save();

  return note;
};

/**
 * --------------------------------------------------
 * Restore Note
 * --------------------------------------------------
 */

export const restoreNote = async ({
  noteId,
  userId,
}) => {

  const note =
    await PersonalNote.findOne({

      _id: noteId,

      user: userId,
    });

  if (!note) {

    throw new AppError(
      "Note not found",
      404
    );
  }

  note.isDeleted = false;

  await note.save();

  return note;
};

/**
 * --------------------------------------------------
 * Archive Note
 * --------------------------------------------------
 */

export const archiveNote = async ({
  noteId,
  userId,
}) => {

  const note =
    await getNoteById(
      noteId,
      userId
    );

  note.isArchived = true;

  await note.save();

  return note;
};

/**
 * --------------------------------------------------
 * Unarchive Note
 * --------------------------------------------------
 */

export const unarchiveNote = async ({
  noteId,
  userId,
}) => {

  const note =
    await getNoteById(
      noteId,
      userId
    );

  note.isArchived = false;

  await note.save();

  return note;
};

/**
 * --------------------------------------------------
 * Pin Note
 * --------------------------------------------------
 */

export const pinNote = async ({
  noteId,
  userId,
}) => {

  const note =
    await getNoteById(
      noteId,
      userId
    );

  note.isPinned = true;

  await note.save();

  return note;
};

/**
 * --------------------------------------------------
 * Unpin Note
 * --------------------------------------------------
 */

export const unpinNote = async ({
  noteId,
  userId,
}) => {

  const note =
    await getNoteById(
      noteId,
      userId
    );

  note.isPinned = false;

  await note.save();

  return note;
};