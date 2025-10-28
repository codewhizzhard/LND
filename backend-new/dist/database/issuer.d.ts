import mongoose, { Document } from "mongoose";
export interface IIssuer extends Document {
    role: "issuer" | "arbitrator";
    issuerDID?: string;
    creatorDID: string;
    accountId?: string;
    evmAddress?: string;
    edscaAccountId?: string;
    edscaEncryptedPrivateKey?: string;
    edscaSalt?: string;
    edscaIv?: string;
    edscaPublickey?: string;
    status: "ACTIVE" | "REVOKED" | "PENDING";
    data?: {
        name: string;
        sector: string;
        [key: string]: any;
    };
    createdAt: Date;
}
export declare const Issuers: mongoose.Model<IIssuer, {}, {}, {}, mongoose.Document<unknown, {}, IIssuer, {}, {}> & IIssuer & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=issuer.d.ts.map