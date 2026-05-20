import mongoose from "mongoose";

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required to start the backend");
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`[DB_READY] MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("[DB_CONNECTION_ERROR]", {
      message: error.message,
    });

    throw error;
  }
};

export default connectDB;
