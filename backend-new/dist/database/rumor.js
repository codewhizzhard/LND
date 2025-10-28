import mongoose, { Schema } from "mongoose";
const RumorSchema = new Schema({
    /*     complaintId: { type: String, required: true, unique: true }, */
    gossiperDID: { type: String },
    gossiperAccountId: { type: String, required: true },
    defendantDID: { type: String, required: true },
    defendantAccountId: { type: String, required: true },
    defendantIssuerDID: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    status: {
        type: String,
        enum: ["RUMOR", "IN_REVIEW", "RESOLVED", "REJECTED"],
        default: "RUMOR",
    },
    traceId: { type: String, required: true },
}, { timestamps: true } // auto adds createdAt & updatedAt
);
// Auto-generate traceId if missing
export const Rumors = mongoose.model("Rumors", RumorSchema);
//# sourceMappingURL=rumor.js.map