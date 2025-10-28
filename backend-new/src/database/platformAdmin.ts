import mongoose, { Schema, Document } from "mongoose";

export interface IPlatformAdmin extends Document {
  name: string;
  did: string;
  hederaAccountId?: string;
  role: string;
}

const PlatformAdminSchema: Schema = new Schema<IPlatformAdmin>({
  name: { type: String, required: true },
  did: { type: String, required: true, unique: true },
  hederaAccountId: { type: String, required: false },
  role: { type: String, default: "platformAdmin" },
});

export const PlatformAdmins = mongoose.model<IPlatformAdmin>(
  "PlatformAdmin",
  PlatformAdminSchema
);
