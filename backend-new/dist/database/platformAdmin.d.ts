import mongoose, { Document } from "mongoose";
export interface IPlatformAdmin extends Document {
    name: string;
    did: string;
    hederaAccountId?: string;
    role: string;
}
export declare const PlatformAdmins: mongoose.Model<IPlatformAdmin, {}, {}, {}, mongoose.Document<unknown, {}, IPlatformAdmin, {}, {}> & IPlatformAdmin & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=platformAdmin.d.ts.map