import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUserAuth extends Document {
  userId: mongoose.Types.ObjectId;
  passwordHash: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userAuthSchema = new Schema<IUserAuth>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

userAuthSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const UserAuth = mongoose.model<IUserAuth>("UserAuth", userAuthSchema);