import mongoose, { Schema, Document } from "mongoose";

export interface IAsset extends Document {
  //assetId: string;        // Hedera tokenId
  topicId: string;        // Hedera topicId
  //name: string;
 // metadata?: Record<string, any>;
  creatorId: string;      // your app userId
  creatorDID?: string;
  accountId: string;
  publicKey: string;
  createdAt: Date;
  latestEventId?: string;
  topicData: Record<string, any>;
  qrCode?: string; 
}

const AssetSchema: Schema = new Schema<IAsset>({
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

export const Assets = mongoose.model<IAsset>("Assets", AssetSchema);
