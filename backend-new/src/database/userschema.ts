
import type { Types } from "mongoose";
import mongoose, { Schema, Document } from "mongoose";

export interface ICreator extends Document {
  _id: Types.ObjectId;
  creatorTopicId?: string;
  //generalTopicId?: string;
  orgDID?: string;
  accountId?: string;
  creatorDID?: string;
  didDocument: any; // optional — if you want to save it
  vcDocument: any;   
  documentVerified: boolean;
  walletId?: string;
  passwordHash: string;
  vcReferences?: string[];
  //{ type: String, enum: ["user", "business", "issuer", "verifier"]
  // mgs STANDARD_REGISTRY, USER, AUDITOR, ADMIN, TENANT_ADMIN"
  role: "user" | "organization";
  info: {
    phoneHash?: string;
    email: string; // ✅ required now
    displayName?: string; // required if role=user
    org?: {
      name?: string; // required if role=organization
      sector?: string;
      type?: "issuer" | "business" 
    };
    [key: string]: any;
  };
  createdAt: Date;
}

const CreatorSchema = new Schema<ICreator>({
  creatorTopicId: { type: String },
 // generalTopicId: { type: String },
  orgDID: {type: String},
  accountId: { type: String },
  creatorDID: { type: String },
  didDocument: {
    type: mongoose.Schema.Types.Mixed, // store full DID JSON document
    default: {},
  },
  vcDocument: {
    type: mongoose.Schema.Types.Mixed, // store full VC JSON (Verifiable Credential)
    default: {},
  },
  documentVerified: {
    type: Boolean,
    default: false
  },
  walletId: { type: String },
  passwordHash: { type: String, required: true },
  vcReferences: { type: [String], default: [] },
  role: {
    type: String,
    enum: ["user", "organization"],
    required: true,
  },
  info: {
    phoneHash: { type: String },
    email: {
      type: String,
      required: true,
      unique: true, // ✅ prevent duplicates
      lowercase: true, // normalize
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"], // basic email pattern
    },
    displayName: { type: String },
    org: {
      name: { type: String },
      sector: { type: String },
      type: {
        type: String,
        enum: ["issuer", "business"],
      },
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Creators = mongoose.model<ICreator>("Creators", CreatorSchema);
export default Creators;