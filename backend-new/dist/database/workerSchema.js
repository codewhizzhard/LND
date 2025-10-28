import mongoose, { Schema } from "mongoose";
const WorkerSchema = new Schema({
    name: { type: String, required: true },
    accountDID: { type: String, required: true, unique: true },
    /*  accountId: { type: String, required: true }, */
    orgDID: { type: String, required: true },
    role: {
        type: String,
        enum: ["worker", "admin"],
        default: "worker",
    },
    addedBy: { type: String, required: true },
    status: { type: String, enum: ["ACTIVE", "REVOKED"], required: true },
    createdAt: { type: Date, default: Date.now },
});
export const Workers = mongoose.model("Worker", WorkerSchema);
//# sourceMappingURL=workerSchema.js.map