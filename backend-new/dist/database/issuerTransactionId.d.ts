import mongoose, { Document } from "mongoose";
export interface ITransactionRecord extends Document {
    transactionId: string;
    accountDID: string;
    accountId: string;
    checked: boolean;
    createdAt: Date;
}
export declare const TransactionRecords: mongoose.Model<ITransactionRecord, {}, {}, {}, mongoose.Document<unknown, {}, ITransactionRecord, {}, {}> & ITransactionRecord & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=issuerTransactionId.d.ts.map