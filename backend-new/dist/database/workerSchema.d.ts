import mongoose, { Document } from "mongoose";
export interface IWorker extends Document {
    name: string;
    accountDID: string;
    orgDID: string;
    role: "worker" | "admin";
    status: "ACTIVE" | "REVOKED";
    addedBy: string;
    createdAt: Date;
}
export declare const Workers: mongoose.Model<IWorker, {}, {}, {}, mongoose.Document<unknown, {}, IWorker, {}, {}> & IWorker & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=workerSchema.d.ts.map