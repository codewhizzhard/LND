import mongoose, { Document } from "mongoose";
interface IContact extends Document {
    ownerAccountId: string;
    contactAccountId: string;
    addedAt: Date;
    info?: {
        displayName?: string;
        email?: string;
    };
}
export declare const Contacts: mongoose.Model<IContact, {}, {}, {}, mongoose.Document<unknown, {}, IContact, {}, {}> & IContact & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export {};
//# sourceMappingURL=contactsSchema.d.ts.map