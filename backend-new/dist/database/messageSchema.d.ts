import mongoose, { Document } from "mongoose";
interface IMessage extends Document {
    senderAccountId: string;
    recipientAccountId: string;
    topicId?: string;
    content: string | object;
    createdAt: Date;
    read: boolean;
    status?: "DELIVERED" | "READ" | "FAILED";
}
export declare const Messages: mongoose.Model<IMessage, {}, {}, {}, mongoose.Document<unknown, {}, IMessage, {}, {}> & IMessage & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export {};
//# sourceMappingURL=messageSchema.d.ts.map