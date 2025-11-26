import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  role: "provider" | "client" | "admin";  // generic roles
  email?: string;
  phone: string;

  // Generic service provider fields
  serviceType?: string;      
  specialization?: string             
  orgName?: string;                 // Replaces orgName
  orgAddress?: string;              // Replaces orgAddress

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

  resetCode?: string;
  resetCodeExpires?: number;

  emailVerified: boolean;
  emailVerificationToken?: string;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },

    // Generic roles
    role: { type: String, enum: ["provider", "admin", "client"], required: true },

    email: { type: String, unique: true, sparse: true },
    phone: { type: String, unique: true, required: true },

    // Generic fields for any service provider
    serviceType: String,  
    specialization: String,          
    orgName: String,          // Replaces orgName
    orgAddress: String,       // Replaces orgAddress

    bookingSlotsType: {
      type: String,
      enum: ["slots", "number"],
      default: "slots",
    },

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

    resetCode: String,
    resetCodeExpires: Number,

    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,

    meta: Schema.Types.Mixed,
  },
  { timestamps: true }
);

userSchema.index({ location: "2dsphere" });

export const User = mongoose.model<IUser>("User", userSchema);