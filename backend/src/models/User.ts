import mongoose, { Document, Schema } from "mongoose";

import bcrypt from "bcryptjs";
export interface IUser extends Document {
  name: string;
  role: "doctor" | "patient" | "admin";
  email?: string;
  phone: string;
  password: string;
  specialization: string;
  clinicName: string;
  clinicAddress: string;
  bookingSlotsType: "slots" | "number"
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
  otp?: string;          // ✅ Add this line
  otpExpiry?: Date;      // ✅ Optional expiry field
  emailVerified: boolean;
  emailVerificationToken?: string;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    password: { type: String },
    role: { type: String, enum: ["doctor", "admin"], required: true },
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, unique: true, required: true },
    bookingSlotsType: { type: String, enum: ["slots", "number"], default: "slots" },
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
    otp: String,       // ✅ Add this line
    otpExpiry: Date,     // ✅ Optional expiry field
    passwordHash: String,
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    meta: Schema.Types.Mixed
  },
  { timestamps: true }
);
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password!, salt);
  next();
});

userSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password!);
};

userSchema.index({ location: "2dsphere" });
export const User = mongoose.model<IUser>("User", userSchema);