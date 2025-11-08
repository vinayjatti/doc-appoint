import mongoose from "mongoose";

import * as functions from "firebase-functions";
import { CONFIG } from "./config.js";

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(CONFIG.MONGO_URI as string);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ DB connection failed", error);
    throw new Error("MongoDB connection failed: " + error);
  }
};