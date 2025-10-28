import mongoose, { Document } from "mongoose";
export interface ITrustRequest extends Document {
    businessName: string;
    businessAccountId: string;
    issuerDID: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    createdAt: Date;
}
export declare const TrustRequests: mongoose.Model<ITrustRequest, {}, {}, {}, mongoose.Document<unknown, {}, ITrustRequest, {}, {}> & ITrustRequest & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=trustRequest.d.ts.map