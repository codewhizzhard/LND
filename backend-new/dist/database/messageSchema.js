import mongoose, { Schema } from "mongoose";
const MessageSchema = new Schema({
    senderAccountId: { type: String, required: true }, // Hedera accountId
    recipientAccountId: { type: String, required: true }, // Hedera accountId
    topicId: { type: String },
    content: { type: Schema.Types.Mixed, required: true },
    createdAt: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
    status: { type: String, enum: ["DELIVERED", "READ", "FAILED"], default: "DELIVERED" }
});
export const Messages = mongoose.model("Messages", MessageSchema);
//# sourceMappingURL=messageSchema.js.map