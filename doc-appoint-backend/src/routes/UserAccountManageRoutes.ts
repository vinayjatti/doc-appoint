import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import { User } from "../models/User";
import bcrypt from "bcryptjs";
import { UserAuth } from "../models/UserAuth";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

const router = Router();

/* ------------------------------------------
   EMAIL SENDER UTILITY
------------------------------------------- */
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
    subject: "Verification Code",
    text,
  });
};

/* ------------------------------------------
   1️⃣  Forgot Password
------------------------------------------- */
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
    user.resetCodeExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail(email, `Your verification code is: ${code}`);

    return res.json({ message: "Verification code sent" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
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

    if (!user.otp || user.otp !== code)
      return res.status(400).json({ message: "Invalid verification code" });

    if (user.otpExpiry && user.otpExpiry.getTime() < Date.now())
      return res.status(400).json({ message: "Code expired" });

    const token = jwt.sign(
          { id: user._id, email: user.email, role: user.role },
          process.env.JWT_SECRET || "defaultsecret",
          { expiresIn: "1d" }
        );
    
        // ✅ Send token + doctor ID
        return res.status(200).json({
          message: "Login successful",
          token,
          providerId: user._id,
          providerName: user.name,
          providerEmail: user.email,
          bookingSlotsType: user.bookingSlotsType,
          role: user.role,
        });

  } catch (err) {
    res.status(500).json({ message: "Verification error" });
  }
});

/* ------------------------------------------
   3️⃣  Reset Password
------------------------------------------- */
router.post("/reset-password", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: "User not found" });

    const userAuth = await UserAuth.findOne({ userId: user._id });
    if (!userAuth) return res.status(400).json({ message: "Auth not found" });

    userAuth.passwordHash = await bcrypt.hash(password, 10);
    await userAuth.save();

    user.resetCode = undefined;
    user.resetCodeExpires = undefined;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to reset" });
  }
});

/* ------------------------------------------
   4️⃣  SEND OTP FOR REGISTRATION (GENERIC PROVIDER)
------------------------------------------- */
router.post("/send-otp-email", async (req, res) => {
  try {
    const { email, name, role = "provider" } = req.body;

    if (!email)
      return res.status(400).json({ message: "Email is required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = new User({
        name,
        email: email.toLowerCase(),
        phone: "",
        role, // provider / customer / admin
      });
    }

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    await sendEmail(email, `Your OTP is ${otp}. Valid for 10 minutes`);

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

export default router;