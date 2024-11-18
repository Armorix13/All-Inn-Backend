import mongoose from "mongoose";
import { IUser } from "../types/types";
import { userRole } from "../types/enum";

const userSchema = new mongoose.Schema<IUser>(
  {
    fullName: { type: String },
    email: { type: String },
    phone: { type: String },
    country: { type: String },
    national_number: { type: Number },
    businessName: { type: String },
    organization_number: { type: Number },
    address: { type: String },
    password: { type: String },
    otp: { type: String },
    jti: { type: String },
    profileImage: { type: String },
    role: {
      type: Number,
      enum: [userRole.USER, userRole.BUSINESS], // 1 = User, 2 = Business
    },
    deviceType: { type: String },
    deviceToken: { type: String },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    language: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);
