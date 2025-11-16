import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import { User } from "../models/User";
import bcrypt from "bcryptjs";
import { UserAuth } from "../models/UserAuth";
import { sendWhatsApp } from "../utils/sendWhatsApp";
import { verifyToken } from "../middleware/authMiddleware";
import nodemailer from "nodemailer";

const router = Router();

const sendEmail = async (to: string, text: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Password Reset Verification Code",
    text,
  });
};

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(400).json({ message: "Email not found" });

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetCode = code;
    user.resetCodeExpires = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    await sendEmail(email, `Your password reset code is: ${code}`);

    return res.json({ message: "Verification code sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

/* ------------------------------------------
   2️⃣  Verify OTP Code
------------------------------------------- */
router.post("/verify-code", async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: "Invalid email" });

    if (!user.resetCode || user.resetCode !== code)
      return res.status(400).json({ message: "Invalid verification code" });

    if (user.resetCodeExpires !== undefined && user.resetCodeExpires < Date.now())
      return res.status(400).json({ message: "Code expired" });

    return res.json({ message: "Code verified" });
  } catch (err) {
    res.status(500).json({ message: "Verification error" });
  }
});

/* ------------------------------------------
   3️⃣  Reset Password (Update in UserAuth)
------------------------------------------- */
router.post("/reset-password", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: "User not found" });

    const userAuth = await UserAuth.findOne({ userId: user._id });
    if (!userAuth) return res.status(400).json({ message: "Auth record not found" });

    userAuth.passwordHash = await bcrypt.hash(password, 10);
    await userAuth.save();

    // Clear OTP fields
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to reset password" });
  }
});

/* ------------------------------------------
   4️⃣  SEND EMAIL OTP (Doctor registration)
------------------------------------------- */
router.post("/send-otp-email", async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = new User({
        name,
        email: email.toLowerCase(),
        phone: "",
        role: "doctor",
      });
    }

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send email
    await sendEmail(email, `Your OTP is ${otp}. Valid for 10 minutes`);

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});


export default router;