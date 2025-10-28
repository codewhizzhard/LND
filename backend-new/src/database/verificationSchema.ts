import mongoose, { Schema, Document } from "mongoose";

export interface IVerificationRecord extends Document {
  targetType: "business" | "worker"| "issuer";
  targetDid: string;
  action: "verify" | "revoke";
  performedBy: string; // DID of actor
  hcsTransactionId?: string;
  hcsHash?: string;
  messageHash: string
  timestamp: Date;
}

const VerificationRecordSchema: Schema = new Schema<IVerificationRecord>({
  targetType: {
    type: String,
    enum: ["business", "worker", "issuer"],
    required: true,
  },
  targetDid: { type: String, required: true },
  action: { type: String, enum: ["verify", "revoke"], required: true },
  performedBy: { type: String, required: true },
  messageHash: { type: String, required: true},
  hcsTransactionId: { type: String, required: false },
  hcsHash: { type: String, required: false },
  timestamp: { type: Date, default: Date.now },
});

export const VerificationRecords = mongoose.model<IVerificationRecord>(
  "VerificationRecords",
  VerificationRecordSchema
);
