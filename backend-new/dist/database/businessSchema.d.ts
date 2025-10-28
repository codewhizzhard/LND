import mongoose, { Document } from "mongoose";
export interface IBUSINESS extends Document {
    name: string;
    sector: string;
    orgDID?: string;
    accountId?: string;
    status?: "ACTIVE" | "REVOKED" | "PENDING";
    issuerDID?: string;
    vcDocument?: Record<string, any>;
    createdAt: Date;
}
declare const Businesses: mongoose.Model<IBUSINESS, {}, {}, {}, mongoose.Document<unknown, {}, IBUSINESS, {}, {}> & IBUSINESS & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default Businesses;
//# sourceMappingURL=businessSchema.d.ts.map