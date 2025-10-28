import mongoose, { Schema, Document } from "mongoose";

export interface IIssuer extends Document {
  role: "issuer" | "arbitrator"
  issuerDID?: string; // platform DID
  creatorDID: string; // verified issuer DID
  accountId?: string;
  evmAddress?: string;
  edscaAccountId?: string;
  edscaEncryptedPrivateKey?: string;
  edscaSalt?: string;
  edscaIv?: string;
  edscaPublickey?: string;
  status: "ACTIVE" | "REVOKED" | "PENDING";
  data?: {
    name: string;
    sector: string;
    [key: string]: any;
  };
  createdAt: Date;
}

const IssuerSchema = new Schema<IIssuer>({
  role: {type: String, enum: ["issuer", "arbitrator"]},
  issuerDID: { type: String },
  creatorDID: { type: String, required: true },
  accountId: { type: String, required: true },
  edscaAccountId: { type: String },
  evmAddress: { type: String },
  edscaPublickey: { type: String },
  edscaEncryptedPrivateKey: { type: String },
  edscaSalt: { type: String },
  edscaIv: { type: String },
  status: { type: String, enum: ["ACTIVE", "REVOKED", "PENDING"], required: true },
  data: {
    name: { type: String, required: true },
    sector: { type: String, required: true },
  },
  createdAt: { type: Date, default: Date.now },
});

export const Issuers = mongoose.model<IIssuer>("Issuer", IssuerSchema);
