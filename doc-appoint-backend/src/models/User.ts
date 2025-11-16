import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  role: "doctor" | "patient" | "admin";
  email?: string;
  phone: string;
  specialization?: string;
  clinicName?: string;
  clinicAddress?: string;
  bookingSlotsType?: "slots" | "number";
  availability?: Array<{
    day: string;
    slots: Array<{ start: string; end: string }>;
  }>;
  meta?: Record<string, any>;
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
  otp?: string;
  otpExpiry?: Date;
  resetCode?: String,
  resetCodeExpires?: number,
  emailVerified: boolean;
  emailVerificationToken?: string;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    role: { type: String, enum: ["doctor", "admin", "patient"], required: true },
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, unique: true, required: true },
    bookingSlotsType: { type: String, enum: ["slots", "number"], default: "slots" },
    specialization: String,
    clinicAddress: String,
    clinicName: String,
    availability: [
      {
        day: { type: String, required: true },
        slots: [{ start: String, end: String }],
      },
    ],
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
    otp: String,
    otpExpiry: Date,
    resetCode: { type: String },
    resetCodeExpires: { type: Number },
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    meta: Schema.Types.Mixed,
  },
  { timestamps: true }
);

userSchema.index({ location: "2dsphere" });
export const User = mongoose.model<IUser>("User", userSchema);