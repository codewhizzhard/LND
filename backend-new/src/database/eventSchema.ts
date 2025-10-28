import mongoose, { Schema, Document } from "mongoose";

export enum EventType {
  CREATED = "CREATED",
  UPDATED = "UPDATED",
  TRANSFER = "TRANSFER",
  CUSTOM = "CUSTOM"
}

export interface ICid {
  cid: string;
  type?: string;
  reference?: string | null;
  createdAt?: Date;
}

export interface IEvent extends Document {
  eventId: string;
  topicId: string;
  creatorId: string;
  creatorDID?: string;
  accountId: string;
  publicKey?: string;
  eventType: EventType;
  payload?: Record<string, any>;
  cids: ICid[];
  traceId: string;
  visibility: "public" | "private";
  createdAt: Date;
  latestCreatedAt?: number;
  messageHash: string;
  msgTransactionHash: string;
  msgTransactionId: string;
  consensusTimestamp: string;
  verified: boolean;
}

// ✅ Reusable CID schema
const CidSchema = new mongoose.Schema<ICid>(
  {
    cid: { type: String, required: true },
    type: { type: String, default: "ipfs" },
    reference: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);
// ✅ Helper function to generate trace IDs
function generateTraceId(metadata: any): string {
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

  let prefix = "TRACE"; // default for generic or note-type messages

  // ✅ Complaints
  if (metadata?.action === "rumor") {
    prefix = "RUM";
  }
  // ✅ Goods — batch (expiry or price)
  else if (metadata?.sector === "goods" && (metadata?.expiry || metadata?.price)) {
    prefix = "BATCH";
  }
  // ✅ Services
  else if (metadata?.sector === "services") {
    prefix = "SRV";
  }
  // ✅ Media-only posts (images without text)
  else if (metadata?.images?.length && !metadata?.message) {
    prefix = "MEDIA";
  }

  return `${prefix}-${y}${m}${d}-${random}`;
}

// ✅ Main Event schema
const EventSchema = new mongoose.Schema<IEvent>({
  eventId: { type: String, required: true, unique: true },
  topicId: { type: String, required: true },
  creatorId: { type: String, required: true },
  creatorDID: { type: String },
  accountId: { type: String, required: true },
  publicKey: { type: String },
  eventType: { type: String, enum: Object.values(EventType), required: true },
  payload: { type: Schema.Types.Mixed, default: {} },
  cids: { type: [CidSchema], default: [] },
  traceId: { type: String, required: true },
  visibility: {type: String, enum: ["public", "private"]},
  createdAt: { type: Date, default: Date.now },
  latestCreatedAt: { type: Number },
  messageHash: { type: String, required: true },
  msgTransactionHash: { type: String, unique: true },
  msgTransactionId: { type: String, unique: true },
  consensusTimestamp: { type: String },
  verified: { type: Boolean, default: false },
});

// ✅ Auto-generate traceId before saving if not provided
EventSchema.pre("validate", function (next) {
  if (!this.traceId) {
    this.traceId = generateTraceId(this.payload || {});
  }
  next();
});

export const Events = mongoose.model<IEvent>("Events", EventSchema);
