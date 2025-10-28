import mongoose, { Document } from "mongoose";
export declare enum EventType {
    CREATED = "CREATED",
    UPDATED = "UPDATED",
    TRANSFER = "TRANSFER",
    CUSTOM = "CUSTOM"
}
export interface ICid {
    cid: string;
    type?: string;
    reference?: string | null;
    createdAt?: Date;
}
export interface IEvent extends Document {
    eventId: string;
    topicId: string;
    creatorId: string;
    creatorDID?: string;
    accountId: string;
    publicKey?: string;
    eventType: EventType;
    payload?: Record<string, any>;
    cids: ICid[];
    traceId: string;
    visibility: "public" | "private";
    createdAt: Date;
    latestCreatedAt?: number;
    messageHash: string;
    msgTransactionHash: string;
    msgTransactionId: string;
    consensusTimestamp: string;
    verified: boolean;
}
export declare const Events: mongoose.Model<IEvent, {}, {}, {}, mongoose.Document<unknown, {}, IEvent, {}, {}> & IEvent & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=eventSchema.d.ts.map