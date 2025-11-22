import express from "express";
import twilio from "twilio";
import crypto from "crypto";
import { User } from "../models/User";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserAuth } from "../models/UserAuth";

const router = express.Router();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const numberFrom = process.env.TWILIO_PHONE_NUMBER;

// ✅ Validate credentials before creating client
if (!accountSid || !authToken) {
  throw new Error(
    "❌ Missing Twilio credentials. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env"
  );
}

const client = twilio(accountSid, authToken);

router.post("/send-otp", async (req, res) => {
  try {
    const { identifier } = req.body; // can be email or phone number
    if (!identifier) return res.status(400).json({ message: "Email or mobile number required" });

    // find doctor by email or phone
    const doctor = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
      role: "doctor",
    });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    // generate OTP and expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // valid 5 mins

    doctor.otp = otp;
    doctor.otpExpiry = otpExpiry;
    await doctor.save();

    // send via Twilio SMS (or you can email)
    if (/^\d+$/.test(identifier)) {
      console.log(`Send SMS OTP to ${identifier} from ${numberFrom}: ${otp}`);
      await client.messages.create({
        from: numberFrom,
        to: `+91${identifier}`,
        body: `Your login OTP for Doctor Portal is ${otp}`,
      });
    } else {
      console.log(`Send email OTP: ${otp}`); // replace with nodemailer if needed
    }

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending OTP" });
  }
});

router.post("/verify-otp", async (req, res) => {
  const { identifier, otp } = req.body;
  const doctor = await User.findOne({
    $or: [{ email: identifier }, { phone: identifier }],
    role: "doctor",
  });
  if (!doctor) return res.status(404).json({ message: "Doctor not found" });

  if (!doctor.otp || doctor.otp !== otp || (doctor.otpExpiry && doctor.otpExpiry.getTime() < Date.now())) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  // Clear OTP after verification
  doctor.otp = undefined;
  doctor.otpExpiry = undefined;
  await doctor.save();

  // You can use JWT token
  const token = crypto.randomBytes(32).toString("hex");
  res.json({ message: "Login successful", doctorId: doctor._id, token });
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password, specialization, clinicName, clinicAddress } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const emailVerificationToken = crypto.randomBytes(32).toString("hex");

    const provider = new User({
      name,
      email,
      phone,
      password,
      role: "provider",
      specialization,
      clinicName,
      clinicAddress,
      emailVerificationToken,
    });
    await provider.save();

    // ✉️ Send verification email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const verifyLink = `http://localhost:4000/auth/verify-email?token=${emailVerificationToken}`;
    await transporter.sendMail({
      to: email,
      subject: "Verify your email",
      html: `<p>Hello ${name},</p>
             <p>Please verify your email by clicking below:</p>
             <a href="${verifyLink}">${verifyLink}</a>`,
    });

    res.json({ message: "Doctor registered. Please verify your email." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed" });
  }
});


// 🔹 Verify OTP and Register Doctor
router.post("/verify-otp-email", async (req, res) => {
  try {
    const { email, otp, formData } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (!user.otpExpiry || user.otpExpiry < new Date())
      return res.status(400).json({ message: "OTP expired" });

    // Clear OTP after verification
    user.otp = undefined;
    user.otpExpiry = undefined;

    // Update doctor details
    Object.assign(user, formData);
    await user.save();

    res.json({ message: "Doctor registration successful!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "OTP verification failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    // Find doctor
    const provider = await User.findOne({ email });
    if (!provider)
      return res.status(401).json({ message: "Invalid email or password" });

    const userAuth = await UserAuth.findOne({ userId: provider._id });
    if (!userAuth) return res.status(401).json({ message: "Authentication data missing" });

    // Check password
    const isMatch = await bcrypt.compare(password, userAuth.passwordHash);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    // ✅ Generate JWT Token
    const token = jwt.sign(
      { id: provider._id, email: provider.email, role: provider.role },
      process.env.JWT_SECRET || "defaultsecret",
      { expiresIn: "1d" }
    );

    // ✅ Send token + doctor ID
    res.status(200).json({
      message: "Login successful",
      token,
      providerId: provider._id,
      providerName: provider.name,
      doctorEmail: provider.email,
      bookingSlotsType: provider.bookingSlotsType,
      role: provider.role,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});



export default router;