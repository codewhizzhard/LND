import mongoose, { Schema } from "mongoose";
const IssuerSchema = new Schema({
    role: { type: String, enum: ["issuer", "arbitrator"] },
    issuerDID: { type: String },
    creatorDID: { type: String, required: true },
    accountId: { type: String, required: true },
    edscaAccountId: { type: String },
    evmAddress: { type: String },
    edscaPublickey: { type: String },
    edscaEncryptedPrivateKey: { type: String },
    edscaSalt: { type: String },
    edscaIv: { type: String },
    status: { type: String, enum: ["ACTIVE", "REVOKED", "PENDING"], required: true },
    data: {
        name: { type: String, required: true },
        sector: { type: String, required: true },
    },
    createdAt: { type: Date, default: Date.now },
});
export const Issuers = mongoose.model("Issuer", IssuerSchema);
//# sourceMappingURL=issuer.js.map