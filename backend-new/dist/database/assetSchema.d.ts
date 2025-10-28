import mongoose, { Document } from "mongoose";
export interface IAsset extends Document {
    topicId: string;
    creatorId: string;
    creatorDID?: string;
    accountId: string;
    publicKey: string;
    createdAt: Date;
    latestEventId?: string;
    topicData: Record<string, any>;
    qrCode?: string;
}
export declare const Assets: mongoose.Model<IAsset, {}, {}, {}, mongoose.Document<unknown, {}, IAsset, {}, {}> & IAsset & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=assetSchema.d.ts.map