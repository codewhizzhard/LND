/**
 * Verifies a Hedera signature using the account's public key.
 * @param accountId - The user's Hedera account ID
 * @param publicKey - The user's public key derived from private key
 * @param challenge - The original challenge message
 * @param signatureHex - Signature in hex format
 */
export declare function verifyHederaSignature(publicKey: string, challenge: string, signatureHex: string): boolean;
interface RegisterCreatorData {
    creatorId: string;
    accountId: string;
    publicKey: string;
    info?: Record<string, unknown>;
    phoneHash?: string;
}
export declare function registerCreator(data: RegisterCreatorData): Promise<{
    success: boolean;
    creator: import("mongoose").Document<unknown, {}, import("../../database/userschema.js").ICreator, {}, {}> & import("../../database/userschema.js").ICreator & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    };
    error?: undefined;
} | {
    success: boolean;
    error: any;
    creator?: undefined;
}>;
export declare function generateToken(user: any): string;
export {};
//# sourceMappingURL=creatorFlow.d.ts.map