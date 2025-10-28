import mongoose, { Schema } from "mongoose";
const ContactSchema = new Schema({
    ownerAccountId: { type: String, required: true }, // Hedera accountId
    contactAccountId: { type: String, required: true }, // Hedera accountId
    addedAt: { type: Date, default: Date.now },
    info: { type: Object }
});
export const Contacts = mongoose.model("Contacts", ContactSchema);
//# sourceMappingURL=contactsSchema.js.map