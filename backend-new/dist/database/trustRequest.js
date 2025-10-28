import mongoose, { Schema } from "mongoose";
const TrustRequestSchema = new Schema({
    businessName: { type: String, required: true },
    //businessDID: { type: String, required: true },
    businessAccountId: { type: String, required: true },
    issuerDID: { type: String, required: true },
    //issuerAccountId: { type: String, required: true },
    //sector: { type: String, required: true },
    status: {
        type: String,
        enum: ["PENDING", "APPROVED", "REJECTED"],
        default: "PENDING",
    },
    createdAt: { type: Date, default: Date.now },
}, { timestamps: true });
export const TrustRequests = mongoose.model("TrustRequests", TrustRequestSchema);
//# sourceMappingURL=trustRequest.js.map