import mongoose, { Schema } from "mongoose";
const TransactionRecordSchema = new Schema({
    transactionId: { type: String, required: true, unique: true },
    accountDID: { type: String, required: true },
    accountId: { type: String, required: true },
    checked: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});
export const TransactionRecords = mongoose.model("TransactionRecords", TransactionRecordSchema);
//# sourceMappingURL=issuerTransactionId.js.map