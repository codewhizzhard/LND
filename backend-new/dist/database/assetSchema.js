import mongoose, { Schema } from "mongoose";
const AssetSchema = new Schema({
    //assetId: { type: String, required: true, unique: true },
    topicId: { type: String, required: true, unique: true },
    //name: { type: String, required: true },
    // metadata: { type: Schema.Types.Mixed },
    creatorId: { type: String, required: true },
    creatorDID: { type: String },
    accountId: { type: String, required: true },
    publicKey: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    latestEventId: { type: String, required: false },
    topicData: { type: Schema.Types.Mixed },
    qrCode: { type: String, required: false },
});
export const Assets = mongoose.model("Assets", AssetSchema);
//# sourceMappingURL=assetSchema.js.map