import mongoose, { Schema, Document } from "mongoose";

export interface IBUSINESS extends Document {
  name: string;
  sector: string;
  orgDID?: string; // Organization DID
  accountId?: string;
  status?: "ACTIVE" | "REVOKED" | "PENDING";
  issuerDID?: string; // DID of issuer admin
  vcDocument?: Record<string, any>;
  createdAt: Date;
}

const BusinessSchema: Schema = new Schema<IBUSINESS>({
  name: { type: String },
  orgDID: { type: String, unique: true },
  accountId: { type: String },
  status: {type: String, enum: ["ACTIVE", "REVOKED", "PENDING"], required: true},
  issuerDID: { type: String},
  sector: {type: String, required: true},
   vcDocument: {
    type: mongoose.Schema.Types.Mixed, // can store any JSON structure (JWT, credential, etc.)
    default: {},
  }, 
  //workers: [{ type: Schema.Types.ObjectId, ref: "Worker" }],
  //createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Businesses = mongoose.model<IBUSINESS>("Businesses", BusinessSchema);
export default Businesses;


