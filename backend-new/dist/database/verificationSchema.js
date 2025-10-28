import mongoose, { Schema } from "mongoose";
const VerificationRecordSchema = new Schema({
    targetType: {
        type: String,
        enum: ["business", "worker", "issuer"],
        required: true,
    },
    targetDid: { type: String, required: true },
    action: { type: String, enum: ["verify", "revoke"], required: true },
    performedBy: { type: String, required: true },
    messageHash: { type: String, required: true },
    hcsTransactionId: { type: String, required: false },
    hcsHash: { type: String, required: false },
    timestamp: { type: Date, default: Date.now },
});
export const VerificationRecords = mongoose.model("VerificationRecords", VerificationRecordSchema);
//# sourceMappingURL=verificationSchema.js.map