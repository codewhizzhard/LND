import mongoose, { Document } from "mongoose";
export interface IVerificationRecord extends Document {
    targetType: "business" | "worker" | "issuer";
    targetDid: string;
    action: "verify" | "revoke";
    performedBy: string;
    hcsTransactionId?: string;
    hcsHash?: string;
    messageHash: string;
    timestamp: Date;
}
export declare const VerificationRecords: mongoose.Model<IVerificationRecord, {}, {}, {}, mongoose.Document<unknown, {}, IVerificationRecord, {}, {}> & IVerificationRecord & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=verificationSchema.d.ts.map