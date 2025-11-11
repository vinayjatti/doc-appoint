import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import { User } from "../models/User";
import bcrypt from "bcryptjs";
import { UserAuth } from "../models/UserAuth";
import { sendWhatsApp } from "../utils/sendWhatsApp";
import { verifyToken } from "../middleware/authMiddleware";

const router = Router();

router.post("/user/create", async (req: Request, res: Response) => {
  try {
    const {
      name,
      phone,
      password,
      role,
      email,
      longitude,
      latitude,
      bookingSlotsType,
      specialization,
      clinicName,
      clinicAddress,
      availability,
    } = req.body;

    if (!name || !phone || !role || !password) {
      return res.status(400).json({ message: "Name, phone, role, and password are required" });
    }

    const existingUser = await User.findOne({ $or: [{ phone }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user profile first
    const newUser = new User({
      name,
      phone,
      role,
      email,
      specialization,
      clinicName,
      clinicAddress,
      bookingSlotsType,
      meta: { clinicName },
      availability: Array.isArray(availability) ? availability : [],
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude) || 0, parseFloat(latitude) || 0],
      },
    });
    await newUser.save();

    // Create auth record separately
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await new UserAuth({
      userId: newUser._id,
      passwordHash,
    }).save();

    return res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (err) {
    console.error("Error creating user:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}); 

router.get("/user/search", async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, maxDistance = 5000, role, name, address } = req.query;

    const query: any = {};

    // 🔍 Text-based search (name or address)
    if (name) {
      query.name = { $regex: new RegExp(name as string, "i") };
    }

    if (address) {
      query["clinicAddress"] = { $regex: new RegExp(address as string, "i") };
    }

    // 📍 Location-based search
    if (latitude && longitude) {
      const lat = parseFloat(latitude as string);
      const lon = parseFloat(longitude as string);

      query.location = {
        $near: {
          $geometry: { type: "Point", coordinates: [lon, lat] },
          $maxDistance: Number(maxDistance), // in meters
        },
      };
    }

    // 👩‍⚕️ Optional: filter by user role
    if (role) query.role = role;

    const users = await User.find(query).limit(50);

    if (!users.length) {
      return res.status(404).json({ message: "No matching doctors found" });
    }

    return res.status(200).json(users);
  } catch (err) {
    console.error("Error searching doctors:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/user/:id", async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: "Error fetching doctor" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ message: "Name is required" });

    // Case-insensitive *partial* match
    const doctor = await User.findOne({ name: new RegExp(name as string, "i") });

    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json({ doctor });
  } catch (err) {
    console.error("Error fetching doctor:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/admin/create", verifyToken, async (req: any, res: Response) => {
  try {
    const currentUser = req.user as any;

    // check that the logged-in user is an admin
    if (!currentUser || currentUser.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    const { name, phone, email, password, role } = req.body;

    if (!name || !phone || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // check if user already exists
    const existingUser = await User.findOne({ $or: [{ phone }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // create user document
    const newUser = new User({
      name,
      phone,
      email,
      role: role || "user", // default to admin
    });
    await newUser.save();

    // hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    await new UserAuth({ userId: newUser._id, passwordHash }).save();

    return res.status(201).json({
      message: "Admin created successfully",
      user: newUser,
    });
  } catch (err) {
    console.error("Error creating admin:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/user/update", verifyToken, async (req, res) => {
  try {
    const {doctorId, name, phone, specialization, clinicName, clinicAddress } = req.body;

    // Validate required fields
    if (!name || !phone || !specialization || !clinicName || !clinicAddress ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findById(doctorId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update user details
    user.name = name;
    user.phone = phone;
    user.specialization = specialization;
    user.clinicName = clinicName;
    user.clinicAddress = clinicAddress;

    await user.save();

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});


export default router;