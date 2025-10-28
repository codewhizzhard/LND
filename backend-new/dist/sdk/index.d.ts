import { TopicId, AccountId, ContractId } from "@hashgraph/sdk";
import { IBUSINESS } from "../database/businessSchema.js";
export declare const createAssetTopic: (memo: string) => Promise<{
    txResponse: import("@hashgraph/sdk").TransactionResponse;
    topicId: TopicId | null;
}>;
type TopicMessagePayload = {
    topicId?: string;
    message: any;
};
export declare function sendEventToAsset(data: TopicMessagePayload): Promise<{
    transactionHash: string;
    transactionId: string;
    status: string;
}>;
export declare function getAssetEvent(topicId?: TopicId): Promise<void>;
export declare function getEventInfo(number: number, topicId?: TopicId): Promise<{
    success: boolean;
    status: number;
    error: string;
} | undefined>;
export declare function createAccount(publicKey: string): Promise<{
    success: boolean;
    accountId: string;
    publicKey: string;
    error?: undefined;
} | {
    success: boolean;
    error: any;
    accountId?: undefined;
    publicKey?: undefined;
}>;
export declare function buildTopicCreateTransaction(userPublicKey: string, userAccountId: string, memo?: string): Promise<Uint8Array>;
export declare function executeUserSignedTopicAndMint(signedTopicTxBytesBase64: string, signedMintTxBytesBase64?: string): Promise<{
    success: boolean;
    topicId: string | null;
    tokenId: string | null;
    mintStatus: string | null;
    topicReceipt: import("@hashgraph/sdk").TransactionReceipt;
    error?: undefined;
} | {
    success: boolean;
    error: any;
    topicId?: undefined;
    tokenId?: undefined;
    mintStatus?: undefined;
    topicReceipt?: undefined;
}>;
/**
 * Verify a specific Hedera Consensus Service message against its stored hash.
 *
 * @param topicId - Hedera topicId (e.g. "0.0.12345")
 * @param expectedHash - SHA-256 hash you stored when publishing
 * @param consensusTimestamp - Consensus timestamp of the message
 * @param mirrorUrl - Mirror Node base URL (default: testnet)
 */
export declare function verifyPublishedMessage(topicId: string, expectedHash: string, consensusTimestamp: string, mirrorUrl?: string): Promise<boolean>;
/**
 * Try to fetch consensus info immediately after sending to Hedera.
 * Returns the consensusTimestamp if found, otherwise null.
 */
export declare function tryImmediateConsensusCheck(transactionId: string, retries?: number, delayMs?: number): Promise<Date | null>;
/**
 * Verify unverified events by checking their transaction receipts
 */
export declare function verifyPendingEvents(): Promise<void>;
export declare function invitePlatformUser(accessToken: string, email: string, type: string): Promise<boolean>;
export declare function inviteUser(email: string, type: string): Promise<boolean>;
export declare function getId(accessToken: string, email: string, username: string): Promise<string>;
export declare function mgsLogin(password: string, userId: string, email: string): Promise<string>;
type DIDProfile = {
    did: string;
    didDocument: any;
    VcDocument: any;
};
export declare function profile(access: string, username: string): Promise<DIDProfile | null>;
export declare const getProfileData: (email: string, username: string, password: string) => Promise<DIDProfile | null>;
export declare function submitMessageToPrivateTopic(message: string): Promise<{
    transactionHash: string;
    transactionId: string;
    status: string;
    success?: undefined;
    error?: undefined;
} | {
    success: boolean;
    error: any;
    transactionHash?: undefined;
    transactionId?: undefined;
    status?: undefined;
}>;
export declare function mintAndTransferNFT(recipientId: AccountId): Promise<{
    success: boolean;
    TOKEN_ID: string;
    serial: number;
    status: string;
    error?: undefined;
} | {
    success: boolean;
    error: any;
    TOKEN_ID?: undefined;
    serial?: undefined;
    status?: undefined;
}>;
export declare function generateEdscaAccount(publicKey: string): Promise<{
    success: boolean;
    accountId: string;
    error?: undefined;
} | {
    success: boolean;
    error: any;
    accountId?: undefined;
}>;
/**
 * Deploys a smart contract on Hedera using the ContractCreateFlow API.
 *
 * @param client - Initialized Hedera Client (with operator)
 * @param bytecodePath - Path to compiled contract bytecode (.bin)
 * @param maintenanceWallet - Address to pass to constructor (string)
 */
export declare function deployIssuerBondManager(): Promise<{
    success: boolean;
    error: string;
    contractId?: undefined;
    contractAddress?: undefined;
} | {
    success: boolean;
    contractId: ContractId;
    contractAddress: string;
    error?: undefined;
}>;
export declare function issueVcJwtForBusiness(issuerDid: string, business: IBUSINESS): Promise<{
    vcJwt: string;
    messageHash: string;
}>;
export {};
/**string
 * Creates the Standard Registry Certification Policy on the Guardian backend.
 */
//# sourceMappingURL=index.d.ts.map