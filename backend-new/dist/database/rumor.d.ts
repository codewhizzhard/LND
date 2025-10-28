import mongoose, { Document } from "mongoose";
export interface IRumor extends Document {
    gossiperDID?: string;
    gossiperAccountId: string;
    defendantDID: string;
    defendantAccountId: string;
    defendantIssuerDID: string;
    metadata?: Record<string, any>;
    status: "RUMOR" | "IN_REVIEW" | "RESOLVED" | "REJECTED";
    traceId: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const Rumors: mongoose.Model<IRumor, {}, {}, {}, mongoose.Document<unknown, {}, IRumor, {}, {}> & IRumor & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=rumor.d.ts.map