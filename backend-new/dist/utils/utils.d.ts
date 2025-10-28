export declare function createDID(accountId: string, network?: string): string;
export declare function generateAssetId(creatorId: string, metadata: Record<string, any>, useSalt?: boolean): string;
export declare function generateEventId(): string;
export declare function generatePin(): string;
export declare function hashData(data: unknown): string;
interface TopicData {
    transactionHash: string;
    transactionId: string;
    status: string;
}
export interface LogVerificationActionParams {
    targetType: "business" | "worker" | "issuer";
    targetDid: string;
    action: "verify" | "revoke";
    performedBy: string;
    topicData: TopicData;
    messageHash: string;
    additionalMessage?: string;
}
export declare const logVerificationAction: ({ targetType, targetDid, action, performedBy, topicData, messageHash, additionalMessage, }: LogVerificationActionParams) => Promise<{
    success: boolean;
    record: import("mongoose").Document<unknown, {}, import("../database/verificationSchema.js").IVerificationRecord, {}, {}> & import("../database/verificationSchema.js").IVerificationRecord & Required<{
        _id: unknown;
    }> & {
        __v: number;
    };
    transaction: {
        transactionHash: string;
        transactionId: string;
    };
    error?: undefined;
} | {
    success: boolean;
    error: any;
    record?: undefined;
    transaction?: undefined;
}>;
export default function sha256hex(obj: any): string;
export {};
//# sourceMappingURL=utils.d.ts.map