import mongoose, { Schema, Document } from "mongoose";

export interface ITrustRequest extends Document {
  businessName: string;
  //businessDID: string;
  businessAccountId: string;
  issuerDID: string;
  //issuerAccountId: string;
  //sector: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: Date;
}

const TrustRequestSchema = new Schema<ITrustRequest>(
  {
    businessName: { type: String, required: true },
    //businessDID: { type: String, required: true },
    businessAccountId: { type: String, required: true },
    issuerDID: { type: String, required: true },
    //issuerAccountId: { type: String, required: true },
    //sector: { type: String, required: true },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const TrustRequests = mongoose.model<ITrustRequest>(
  "TrustRequests",
  TrustRequestSchema
);
