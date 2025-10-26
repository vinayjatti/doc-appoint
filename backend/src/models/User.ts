import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  role: "doctor" | "patient" | "admin";
  email?: string;
  phone: string;
  specialization: string;
  clinicName: string;
  clinicAddress: string;
  availability?: Array<{
    day: string; // e.g., "Monday"
    slots: Array<{
      start: string; // "09:00" (24-hr format)
      end: string;   // "17:00"
    }>;
  }>;
  passwordHash?: string;
  meta?: Record<string, any>;
  location?: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    role: { type: String, enum: ["doctor", "admin"], required: true },
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, unique: true, required: true },
    specialization: { type: String },
    clinicAddress: { type: String },
    clinicName: { type: String },
    availability: [
      {
        day: { type: String, required: true }, // e.g., "Monday"
        slots: [
          {
            start: { type: String, required: true }, // e.g., "09:00"
            end: { type: String, required: true },   // e.g., "17:00"
          },
        ],
      },
    ],
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    passwordHash: String,
    meta: Schema.Types.Mixed
  },
  { timestamps: true }
);

userSchema.index({ location: "2dsphere" });
export const User = mongoose.model<IUser>("User", userSchema);