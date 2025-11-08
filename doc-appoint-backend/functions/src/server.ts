import express from "express";
import dotenv from "dotenv";
import cors from "cors"; // You might want to uncomment this if needed
import { connectDB } from "./config/db.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import MessageRouter from "./routes/MessageRouter.js";
import GoogleSearchRouter from "./routes/GoogleSearchRouter.js";
import UserSelectionRoutes from "./routes/UserSelectionRoutes.js";
import auth from "./routes/auth.js";
import mongoose from "mongoose";
// import { User } from "./models/User"; // Not directly used in this snippet, so commenting out
import { applySecurityMiddleware } from "./middleware/security.js";


dotenv.config(); // Keep this for local development, but Cloud Functions uses its own env vars
//connectDB(); // Establish your database connection
if (!mongoose.connection.readyState) {
  console.log("⏳ Connecting to MongoDB...");
  connectDB().catch(err => console.error("❌ DB connect error:", err));
}
const app = express();
app.use(express.json());


// If you need CORS, uncomment and configure it, or use `cors({ origin: true })`
app.use(cors()); // Example: Allow all origins for simplicity, adjust as needed

app.use("/api/appointments", appointmentRoutes);
app.use("/api/messages", MessageRouter);
app.use("/api/google", GoogleSearchRouter);
app.use("/api/users", UserSelectionRoutes);
app.use("/api/auth", auth);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Doc Appoint API is running 🚀",
    time: new Date().toISOString(),
  });
});

applySecurityMiddleware(app);
console.log("🔥 Starting Doc Appoint backend...");
console.log("PORT:", process.env.PORT);
console.log("MONGO_URI present:", !!process.env.MONGO_URI);

export default app;