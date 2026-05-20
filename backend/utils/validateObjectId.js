import mongoose from "mongoose";

/**
 * Check route params before they reach Mongoose queries.
 *
 * Invalid ObjectIds otherwise become CastError exceptions and turn simple
 * client mistakes into noisy 500 responses.
 */
export const isValidObjectId = (value) => {
  return mongoose.Types.ObjectId.isValid(value);
};
