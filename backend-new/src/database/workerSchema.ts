import mongoose, { Schema, Document } from "mongoose";

export interface IWorker extends Document {
  name: string;
  accountDID: string;
  /* accountId: string; */
  orgDID: string;
  role: "worker" | "admin";
  status: "ACTIVE" | "REVOKED";
  addedBy: string; // DID of orgAdmin
  createdAt: Date;
}

const WorkerSchema: Schema = new Schema<IWorker>({
  name: { type: String, required: true },
  accountDID: { type: String, required: true, unique: true },
 /*  accountId: { type: String, required: true }, */
  orgDID: { type: String, required: true },
  role: {
    type: String,
    enum: ["worker", "admin"],
    default: "worker",
  },
  addedBy: { type: String, required: true },
  status: {type: String, enum: ["ACTIVE", "REVOKED"], required: true},
  createdAt: { type: Date, default: Date.now },
});

export const Workers = mongoose.model<IWorker>("Worker", WorkerSchema);
