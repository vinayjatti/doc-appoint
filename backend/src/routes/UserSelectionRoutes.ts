import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import { User } from "../models/User";
import { sendWhatsApp } from "../utils/sendWhatsApp";

const router = Router();

router.post("/user/create", async (req: Request, res: Response) => {
  try {
    const {
      name,
      phone,
      role,
      email,
      longitude,
      latitude,
      specialization,
      clinicName,
      clinicAddress,
      availability, // expecting [{ day: "Monday", slots: [{ start: "09:00", end: "12:00" }] }]
    } = req.body;

    // ✅ Validate required fields
    if (!name || !phone || !role) {
      return res.status(400).json({ message: "Name, phone, and role are required" });
    }

    // ✅ Check for existing user
    const existingUser = await User.findOne({
      $or: [{ phone }, { email }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // ✅ Create new user with availability and location
    const newUser = new User({
      name,
      phone,
      role,
      email,
      specialization,
      clinicName,
      clinicAddress,
      meta: { clinicName },
      availability: Array.isArray(availability) ? availability : [],
      location: {
        type: "Point",
        coordinates: [
          parseFloat(longitude) || 0,
          parseFloat(latitude) || 0,
        ],
      },
    });

    await newUser.save();

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

export default router;