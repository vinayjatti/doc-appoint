import mongoose, { Document, Schema } from "mongoose";
export interface IAppointment extends Document {
  doctorId: mongoose.Types.ObjectId;
  patientName: string;
  patientNumber: string;
  appointmentDate: Date;
  slot?: string; // e.g., "10:00 AM - 10:30 AM"
  bookingStatus: "booked" | "completed" | "cancelled";
  paymentStatus: "paid" | "pending" | "failed";
  createdAt: Date;
  updatedAt: Date;
  patientQueueNumber: number; // Optional queue number
}

const AppointmentSchema: Schema = new Schema<IAppointment>(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patientName: {
      type: String,
      required: true,
    },
    patientNumber: {
      type: String,
      required: true,
    },
    patientQueueNumber: {
      type: Number,
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    slot: {
      type: String,
      required: false,
    },
    bookingStatus: {
      type: String,
      enum: ["booked", "completed", "cancelled"],
      default: "booked",
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "pending", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Appointment = mongoose.model<IAppointment>("Appointment", AppointmentSchema);