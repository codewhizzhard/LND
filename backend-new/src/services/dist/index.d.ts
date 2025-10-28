import { type AuthSDK } from "./auth/authentication.js";
import { type TopicSDK } from "./topic/topicCreation.js";
import { type CreatorSDK } from "./account/acct.js";
import { type ContactSDK } from "./contact/contactList.js";
import { type MessageSDK } from "./messages/messages.js";
import { type VerifySDK } from "./verify/verify.js";
import { type VerificationSDK } from "./organization/organization.js";
interface HttpServiceConfig {
    apiKey?: string;
    baseURL?: string;
}
export declare class X {
    private token;
    private http;
    auth: AuthSDK;
    creators: CreatorSDK;
    topic: TopicSDK;
    contacts: ContactSDK;
    messages: MessageSDK;
    verify: VerifySDK;
    org: VerificationSDK;
    prepareTopic: TopicSDK["prepareNonScheduleTopicTransaction"];
    handleTopic: TopicSDK["handleNonScheduleTransaction"];
    handleTopicCreation: TopicSDK["handleTopicCreation"];
    getUserEvents: TopicSDK["getUserEvents"];
    getUserAssets: TopicSDK["getUserAssets"];
    verifyEventsFromDB: VerifySDK["verifyEventsFromDB"];
    verifyEventsOnHedera: VerifySDK["verifyEventsOnHedera"];
    addContact: ContactSDK["addContact"];
    viewAllContacts: ContactSDK["viewAllContacts"];
    getAllMessages: MessageSDK["getAllMessages"];
    orgGetIssuer: VerificationSDK["getIssuer"];
    orgRegisterIssuerEcdsaAccount: VerificationSDK["registerIssuerEcdsaAccount"];
    orgRetrieveIssuerEcdsaAccount: VerificationSDK["retrieveIssuerEcdsaAccount"];
    orgSaveTransactionId: VerificationSDK["saveTransactionId"];
    orgGetBusiness: VerificationSDK["getBusiness"];
    orgGetBusinessesByIssuer: VerificationSDK["getBusinessesByIssuer"];
    orgAddWorker: VerificationSDK["addWorker"];
    orgGetWorkers: VerificationSDK["getWorkers"];
    orgRemoveWorker: VerificationSDK["removeWorker"];
    addOrgType: VerificationSDK["addCreatorType"];
    orgBusinessRumors: VerificationSDK["getBusinessRumors"];
    orgIssuers: VerificationSDK["getIssuers"];
    orgRequestIssuerTrust: VerificationSDK["requestIssuerTrust"];
    orgAccessIssuerTrust: VerificationSDK["accessIssuerTrust"];
    constructor(config?: HttpServiceConfig);
    /** Update token for protected requests */
    setToken(token: string): void;
    /** Clear token (logout) */
    clearToken(): void;
    /** Signup (public) */
    signup: (role: "user" | "organization", password: string, email: string, displayName?: string, orgName?: string, phoneHash?: string, userType?: string) => Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }>;
    /** Login → automatically sets token */
    login: (role: "user" | "organization", identifier: string, password: string, email?: string) => Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }>;
    /** Add Hedera account → updates token */
    registerNewCreator: (publicKey: string, token?: string, info?: any) => Promise<{
        success: boolean;
        data?: any;
        token?: string;
        error?: string;
    }>;
    /** Link existing Hedera account → updates token */
    registerExistingCreator: (accountId: string, publicKey: string, signature: string, challenge: string, info?: any) => Promise<{
        success: boolean;
        data?: any;
        token?: string;
        error?: string;
    }>;
}
export {};
