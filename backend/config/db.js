/**
 * Handles MongoDB connection using Mongoose.
 */

import mongoose from "mongoose";

const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`MongoDb Connected: ${conn.connection.host}`);
    } catch(error){
        console.error("MongoDb connection Failed:", error.message);
        process.exit(1);
    }
};

export default connectDB;
