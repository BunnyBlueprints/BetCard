import mongoose from "mongoose";
import { env } from "./env.js";

const connectDB = async () => {
  if (!env.mongoUri) {
    console.error("MongoDB connection failed: MONGO_URI is not set");
    process.exit(1);
  }

  try {
    await mongoose.connect(env.mongoUri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    if (error?.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
};

export default connectDB;
