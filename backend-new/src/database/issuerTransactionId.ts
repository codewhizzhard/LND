import mongoose, { Schema, Document } from "mongoose";

export interface ITransactionRecord extends Document {
  transactionId: string;
  accountDID: string;
  accountId: string;
  checked: boolean;
  createdAt: Date;
}

const TransactionRecordSchema = new Schema<ITransactionRecord>({
  transactionId: { type: String, required: true, unique: true },
  accountDID: {type: String, required: true},
  accountId: {type: String, required: true},
  checked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const TransactionRecords = mongoose.model<ITransactionRecord>(
  "TransactionRecords",
  TransactionRecordSchema
);
