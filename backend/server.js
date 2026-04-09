/**
 * server.js
 * Entry point of the backend server using ES Modules.
 * Connects to MongoDB and starts the Express application.
 */

// Import dependencies using ES Modules
import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app.js";

// Load environment variables
dotenv.config();

// Define configuration variables
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

/**
 * Function to connect to MongoDB
 */
const connectDB = async () => {
  try {
    if (
      MONGO_URI &&
      (MONGO_URI.startsWith("mongodb://") ||
        MONGO_URI.startsWith("mongodb+srv://"))
    ) {
      await mongoose.connect(MONGO_URI);
      console.log(" MongoDB Connected Successfully");
    } else {
      console.log(
        "MongoDB not connected. Please provide a valid MONGO_URI in the .env file."
      );
    }
  } catch (error) {
    console.error(" MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

/**
 * Function to start the server
 */
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

// Start the application
startServer();