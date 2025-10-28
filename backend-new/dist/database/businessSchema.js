import mongoose, { Schema } from "mongoose";
const BusinessSchema = new Schema({
    name: { type: String },
    orgDID: { type: String, unique: true },
    accountId: { type: String },
    status: { type: String, enum: ["ACTIVE", "REVOKED", "PENDING"], required: true },
    issuerDID: { type: String },
    sector: { type: String, required: true },
    vcDocument: {
        type: mongoose.Schema.Types.Mixed, // can store any JSON structure (JWT, credential, etc.)
        default: {},
    },
    //workers: [{ type: Schema.Types.ObjectId, ref: "Worker" }],
    //createdBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});
const Businesses = mongoose.model("Businesses", BusinessSchema);
export default Businesses;
//# sourceMappingURL=businessSchema.js.map