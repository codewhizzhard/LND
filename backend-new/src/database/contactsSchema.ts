import mongoose, { Schema, Document } from "mongoose";

interface IContact extends Document {
  ownerAccountId: string;        // Hedera accountId of the owner (sender)
  contactAccountId: string;      // Hedera accountId of the contact (recipient)
  addedAt: Date;
  info?: { displayName?: string; email?: string };
}

const ContactSchema: Schema = new Schema<IContact>({
  ownerAccountId: { type: String, required: true },   // Hedera accountId
  contactAccountId: { type: String, required: true }, // Hedera accountId
  addedAt: { type: Date, default: Date.now },
  info: { type: Object }
});

export const Contacts = mongoose.model<IContact>("Contacts", ContactSchema);
