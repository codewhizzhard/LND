import mongoose, { Schema, Document } from "mongoose";

interface IMessage extends Document {
  senderAccountId: string;          // Hedera accountId of the sender
  recipientAccountId: string;       // Hedera accountId of the recipient
  topicId?: string;                 // optional, if message is linked to asset/topic
  content: string | object;         // raw text or JSON payload
  createdAt: Date;
  read: boolean;
  status?: "DELIVERED" | "READ" | "FAILED";
}

const MessageSchema = new Schema<IMessage>({
  senderAccountId: { type: String, required: true },     // Hedera accountId
  recipientAccountId: { type: String, required: true },  // Hedera accountId
  topicId: { type: String },
  content: { type: Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
  status: { type: String, enum: ["DELIVERED", "READ", "FAILED"], default: "DELIVERED" }
});

export const Messages = mongoose.model<IMessage>("Messages", MessageSchema);
