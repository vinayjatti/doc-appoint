import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import { User } from "../models/User";
import bcrypt from "bcryptjs";
import { UserAuth } from "../models/UserAuth";
import { verifyToken } from "../middleware/authMiddleware";

const router = Router();

/**
 * ------------------------------------------------
 *  CREATE USER (PROVIDER / CUSTOMER / ADMIN)
 * ------------------------------------------------
 */
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
      serviceType,
      specialization,
      businessName,
      businessAddress,
      availability,
    } = req.body;

    if (!name || !phone || !role || !password) {
      return res
        .status(400)
        .json({ message: "Name, phone, role, and password are required" });
    }

    const existingUser = await User.findOne({ $or: [{ phone }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user profile
    const newUser = new User({
      name,
      phone,
      role, // provider | client | admin
      email,
      serviceType,
      specialization,
      locationName: businessName,
      locationAddress: businessAddress,
      bookingSlotsType,
      meta: { businessName },
      availability: Array.isArray(availability) ? availability : [],
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude) || 0, parseFloat(latitude) || 0],
      },
    });

    await newUser.save();

    // Create auth record
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

/**
 * ------------------------------------------------
 *  SEARCH USERS (GENERIC)
 *  Supports: text search + location search + role filters
 * ------------------------------------------------
 */
router.get("/user/search", async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, maxDistance = 5000, role, name, address } =
      req.query;

    const query: any = {};

    // Text search
    if (name) {
      query.name = { $regex: new RegExp(name as string, "i") };
    }

    if (address) {
      query["locationAddress"] = {
        $regex: new RegExp(address as string, "i"),
      };
    }

    // Location search
    if (latitude && longitude) {
      const lat = parseFloat(latitude as string);
      const lon = parseFloat(longitude as string);

      query.location = {
        $near: {
          $geometry: { type: "Point", coordinates: [lon, lat] },
          $maxDistance: Number(maxDistance),
        },
      };
    }

    // Filter by role (provider, client, admin)
    if (role) query.role = role;

    const users = await User.find(query).limit(50);

    if (!users.length) {
      return res.status(404).json({ message: "No matching users found" });
    }

    return res.status(200).json(users);
  } catch (err) {
    console.error("Error searching users:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * ------------------------------------------------
 *  GET USER BY ID
 * ------------------------------------------------
 */
router.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Error fetching user" });
  }
});

/**
 * ------------------------------------------------
 *  FIND BY NAME (GENERIC)
 * ------------------------------------------------
 */
router.get("/", async (req, res) => {
  try {
    const { name } = req.query;
    if (!name)
      return res.status(400).json({ message: "Name is required" });

    const user = await User.findOne({
      name: new RegExp(name as string, "i"),
    });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * ------------------------------------------------
 *  CREATE ADMIN (ONLY ADMIN CAN CREATE ADMIN)
 * ------------------------------------------------
 */
router.post("/admin/create", verifyToken, async (req: any, res: Response) => {
  try {
    const currentUser = req.user as any;

    if (!currentUser || currentUser.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    const { name, phone, email, password, role } = req.body;

    if (!name || !phone || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await User.findOne({ $or: [{ phone }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      name,
      phone,
      email,
      role: role || "admin",
    });
    await newUser.save();

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

/**
 * ------------------------------------------------
 *  UPDATE USER PROFILE (GENERIC)
 * ------------------------------------------------
 */
router.put("/user/update", verifyToken, async (req, res) => {
  try {
    const {
      userId,
      name,
      phone,
      serviceType,
      specialization,
      businessName,
      businessAddress,
    } = req.body;

    if (!name || !phone) {
      return res
        .status(400)
        .json({ message: "Name and phone are required" });
    }

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    // Update
    user.name = name;
    user.phone = phone;
    user.serviceType = serviceType;
    user.specialization = specialization;
    user.locationName = businessName;
    user.locationAddress = businessAddress;

    await user.save();

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;