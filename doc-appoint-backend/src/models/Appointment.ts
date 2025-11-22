import mongoose, { Schema, Document } from "mongoose";

export interface IAppointment extends Document {
  providerId: mongoose.Types.ObjectId;        // Replaces doctorId
  clientName: string;                         // Replaces patientName
  clientContact: string;                      // Replaces patientNumber

  appointmentDate: Date;
  slot?: string;

  bookingStatus: "booked" | "completed" | "cancelled";
  paymentStatus: "paid" | "pending" | "failed";

  queueNumber: number;                         // Replaces patientQueueNumber

  createdAt: Date;
  updatedAt: Date;

  serviceId?: string | mongoose.Types.ObjectId; // NEW: generic service
}

const AppointmentSchema: Schema = new Schema<IAppointment>(
  {
    providerId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    clientName: { type: String, required: true },
    clientContact: { type: String, required: true },

    queueNumber: { type: Number, required: true },

    appointmentDate: { type: Date, required: true },
    slot: { type: String },

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

    serviceId: { type: Schema.Types.Mixed }, // optional
  },
  { timestamps: true }
);

export const Appointment = mongoose.model<IAppointment>(
  "Appointment",
  AppointmentSchema
);