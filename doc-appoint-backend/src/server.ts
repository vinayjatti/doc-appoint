import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db";
import appointmentRoutes  from "./routes/appointmentRoutes";
import MessageRouter from "./routes/MessageRouter";
import GoogleSearchRouter from "./routes/GoogleSearchRouter";
import UserSelectionRoutes from "./routes/UserSelectionRoutes";
import UserAccountManageRoutes from "./routes/UserAccountManageRoutes";
import auth from "./routes/auth";
import { User } from "./models/User";
import { applySecurityMiddleware } from "./middleware/security";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
applySecurityMiddleware(app);
// app.use(
//   cors({
//     origin: "http://localhost:3000",  // your React app URL
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   })
// );
app.use("/api/appointments", appointmentRoutes);
app.use("/api/messages", MessageRouter);
app.use("/api/google", GoogleSearchRouter);
app.use("/api/users",UserSelectionRoutes);
app.use("/api/auth",auth);
app.use("/api/account",UserAccountManageRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));