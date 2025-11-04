import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import { Appointment } from "../models/Appointment";
import { User } from "../models/User";
import { sendWhatsApp } from "../utils/sendWhatsApp";

const router = Router();

/**
 * POST /appointments
 * Create a new appointment
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      doctorId,
      patientName,
      appointmentDate,
      slot,
      bookingStatus,
      paymentStatus,
      patientNumber,
      bookingSlotsType, // ✅ Added to handle logic based on type
    } = req.body;

    if (!doctorId || !patientName || !appointmentDate || !patientNumber) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Convert appointmentDate to date range
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);

    // ✅ Check if appointment already exists (based on type)
    let existing;
    console.log("Booking Slots Type:", bookingSlotsType);
    if (bookingSlotsType !== "number") {
      // Slot-based: must check slot + other identifiers
      existing = await Appointment.findOne({
        doctorId,
        appointmentDate: { $gte: startOfDay, $lte: endOfDay },
        slot,
        patientName,
        patientNumber,
        status: { $ne: "cancelled" },
      });
    } else {
      // Queue-based: only check doctor + patient + date
      existing = await Appointment.findOne({
        doctorId,
        appointmentDate: { $gte: startOfDay, $lte: endOfDay },
        patientName,
        patientNumber,
        status: { $ne: "cancelled" },
      });
    }

    if (existing) {
      return res.status(409).json({
        message:
          bookingSlotsType === "slot"
            ? "This slot is already booked for this patient"
            : "This patient is already registered for the selected date",
      });
    }

    // ✅ Get current max queue number for that doctor/date
    const latestAppointment = await Appointment.findOne({
      doctorId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
    })
      .sort({ patientQueueNumber: -1 })
      .limit(1);

    let nextQueueNumber = 1;
    if (
      latestAppointment &&
      typeof latestAppointment.patientQueueNumber === "number" &&
      !isNaN(latestAppointment.patientQueueNumber)
    ) {
      nextQueueNumber = latestAppointment.patientQueueNumber + 1;
    }

    // ✅ Create new appointment
    const newAppointment = new Appointment({
      doctorId,
      patientName,
      patientNumber,
      appointmentDate,
      slot: bookingSlotsType !== "number" ? slot : undefined  , 
      bookingStatus: bookingStatus || "booked",
      paymentStatus: paymentStatus || "pending",
      patientQueueNumber: nextQueueNumber,
    });

    await newAppointment.save();

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment: newAppointment,
    });
  } catch (err) {
    console.error("Error booking appointment:", err);
    res.status(500).json({ error: "Failed to book appointment" });
  }
});

router.get("/", async (req, res) => {
  const { doctorId, date } = req.query;

  if (!doctorId || !date || typeof date !== "string") {
      return res.status(400).json({ message: "doctorId and date are required" });
    }

  const start = new Date(date as string);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date as string);
  end.setHours(23, 59, 59, 999);

  const appointments = await Appointment.find({
    doctorId,
    appointmentDate: { $gte: start, $lte: end },
  });
  res.json({ appointments });
});

router.get("/doctor/:id", async (req: Request, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid doctor ID" });
  }

  const doctorId = new mongoose.Types.ObjectId(req.params.id);
  const list = await Appointment.find({ doctor: doctorId })
    .populate("patient", "name phone")
    .sort({ startTime: 1 });
  res.json(list);
});



router.get("/booked-slots", async (req, res) => {
  const { doctorId, date } = req.query;

  if (!doctorId || !date) {
    return res.status(400).json({ error: "doctorId and date are required" });
  }

  try {
    // Parse date and create range for the full day
    const startOfDay = new Date(date as string);
    const endOfDay = new Date(date as string);
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch appointments for that doctor and date range
    const bookings = await Appointment.find({
      doctorId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
    });

    // Extract booked slots
    const slots = bookings.map((b) => b.slot);

    res.json({ slots });
  } catch (err) {
    console.error("Error fetching booked slots:", err);
    res.status(500).json({ error: "Failed to fetch booked slots" });
  }
});

// Book a new appointment
router.post("/book", async (req, res) => {
  try {
    const { doctorId, userId, date, slot } = req.body;

    const exists = await Appointment.findOne({ doctorId, date, slot });
    if (exists) return res.status(400).json({ message: "Slot already booked" });

    const newAppointment = new Appointment({ doctorId, userId, date, slot });
    await newAppointment.save();

    res.status(200).json({ message: "Appointment booked successfully" });
  } catch (err) {
    res.status(500).json({ error: "Booking failed" });
  }
});

router.get("/:doctorId", async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    const query: any = { doctorId };
    if (date) {
      const start = new Date(date as string);
      const end = new Date(date as string);
      end.setHours(23, 59, 59, 999);
      query.appointmentDate = { $gte: start, $lte: end };
    }

    const appointments = await Appointment.find(query);
    res.status(200).json(appointments);
  } catch (err) {
    console.error("Error fetching appointments:", err);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});



/**
 * PATCH /appointments/:id/status
 * Update appointment or payment status
 */
router.patch("/:id/status", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { $set: { status, paymentStatus } },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json(appointment);
  } catch (err) {
    console.error("Error updating appointment:", err);
    res.status(500).json({ error: "Failed to update appointment" });
  }
});

router.put("/bulk-update", async (req, res) => {
  try {
    const { updates } = req.body; // array of { appointmentId, bookingStatus, paymentStatus }
    for (const update of updates) {
      await Appointment.findByIdAndUpdate(update.appointmentId, {
        bookingStatus: update.bookingStatus,
        paymentStatus: update.paymentStatus,
      });
    }
    res.json({ message: "Appointments updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Bulk update failed", error: err});
  }
});


export default router;
