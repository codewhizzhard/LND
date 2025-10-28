import type { Types } from "mongoose";
import mongoose, { Document } from "mongoose";
export interface ICreator extends Document {
    _id: Types.ObjectId;
    creatorTopicId?: string;
    orgDID?: string;
    accountId?: string;
    creatorDID?: string;
    didDocument: any;
    vcDocument: any;
    documentVerified: boolean;
    walletId?: string;
    passwordHash: string;
    vcReferences?: string[];
    role: "user" | "organization";
    info: {
        phoneHash?: string;
        email: string;
        displayName?: string;
        org?: {
            name?: string;
            sector?: string;
            type?: "issuer" | "business";
        };
        [key: string]: any;
    };
    createdAt: Date;
}
declare const Creators: mongoose.Model<ICreator, {}, {}, {}, mongoose.Document<unknown, {}, ICreator, {}, {}> & ICreator & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default Creators;
//# sourceMappingURL=userschema.d.ts.map