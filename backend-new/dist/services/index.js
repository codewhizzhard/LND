import { createHttpsAgent } from "../utils/https.js";
import { createAuth } from "./auth/authentication.js";
import { createTopic } from "./topic/topicCreation.js";
import { createCreator } from "./account/acct.js";
import { createContact } from "./contact/contactList.js";
import { createMessages } from "./messages/messages.js";
import { createVerify } from "./verify/verify.js";
import { createVerification } from "./organization/organization.js";
export class X {
    token = null;
    http;
    auth;
    creators;
    topic;
    contacts;
    messages;
    verify;
    org; // ✅ Added verification property
    // Shortcuts
    prepareTopic;
    handleTopic;
    handleTopicCreation;
    getUserEvents;
    getUserAssets;
    verifyEventsFromDB;
    verifyEventsOnHedera;
    addContact;
    viewAllContacts;
    getAllMessages;
    // ✅ Verification shortcuts
    orgGetIssuer;
    orgRegisterIssuerEcdsaAccount;
    orgRetrieveIssuerEcdsaAccount;
    orgSaveTransactionId;
    orgGetBusiness;
    orgGetBusinessesByIssuer;
    orgAddWorker;
    orgGetWorkers;
    orgRemoveWorker;
    addOrgType;
    orgBusinessRumors;
    orgIssuers;
    orgRequestIssuerTrust;
    orgAccessIssuerTrust;
    constructor(config = {}) {
        const baseURL = config.baseURL || "http://localhost:3001";
        const apiKey = config.apiKey || "";
        this.http = createHttpsAgent(apiKey, baseURL);
        // Restore persisted token (if exists)
        const savedToken = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
        if (savedToken) {
            this.setToken(savedToken);
        }
        // Initialize modules
        this.auth = createAuth(this.http);
        this.creators = createCreator(this.http);
        this.topic = createTopic(this.http);
        this.contacts = createContact(this.http);
        this.messages = createMessages(this.http);
        this.verify = createVerify(this.http);
        // ✅ Init verification
        this.org = createVerification(this.http);
        // Assign shortcuts (direct)
        this.prepareTopic = this.topic.prepareNonScheduleTopicTransaction;
        this.handleTopic = this.topic.handleNonScheduleTransaction;
        this.handleTopicCreation = this.topic.handleTopicCreation;
        this.getUserEvents = this.topic.getUserEvents;
        this.getUserAssets = this.topic.getUserAssets;
        this.verifyEventsFromDB = this.verify.verifyEventsFromDB;
        this.verifyEventsOnHedera = this.verify.verifyEventsOnHedera;
        this.addContact = this.contacts.addContact;
        this.viewAllContacts = this.contacts.viewAllContacts;
        this.getAllMessages = this.messages.getAllMessages;
        // ✅ Assign verification shortcuts
        this.orgGetIssuer = this.org.getIssuer;
        this.orgRegisterIssuerEcdsaAccount = this.org.registerIssuerEcdsaAccount;
        this.orgRetrieveIssuerEcdsaAccount = this.org.retrieveIssuerEcdsaAccount;
        this.orgSaveTransactionId = this.org.saveTransactionId;
        this.orgGetBusiness = this.org.getBusiness;
        this.orgGetBusinessesByIssuer = this.org.getBusinessesByIssuer;
        this.orgAddWorker = this.org.addWorker;
        this.orgGetWorkers = this.org.getWorkers;
        this.orgRemoveWorker = this.org.removeWorker;
        this.addOrgType = this.org.addCreatorType;
        // new
        this.orgBusinessRumors = this.org.getBusinessRumors;
        this.orgIssuers = this.org.getIssuers;
        this.orgRequestIssuerTrust = this.org.requestIssuerTrust;
        this.orgAccessIssuerTrust = this.org.accessIssuerTrust;
    }
    /** Update token for protected requests */
    setToken(token) {
        this.token = token;
        this.http.setToken(token);
        if (typeof window !== "undefined") {
            localStorage.setItem("accessToken", token);
        }
    }
    /** Clear token (logout) */
    clearToken() {
        this.token = null;
        this.http.setToken("");
        if (typeof window !== "undefined") {
            localStorage.removeItem("accessToken");
        }
    }
    /** Signup (public) */
    signup = async (role, password, email, displayName, orgName, phoneHash, userType) => {
        return await this.auth.signup(role, password, email, displayName, orgName, phoneHash, userType);
    };
    /** Login → automatically sets token */
    login = async (role, identifier, password, email) => {
        const result = await this.auth.login(role, identifier, password, email);
        if (result.success && result.data?.token) {
            this.setToken(result.data.token);
        }
        return result;
    };
    /** Add Hedera account → updates token */
    registerNewCreator = async (publicKey, token, info) => {
        const response = await this.creators.registerNewCreator(publicKey, token, info);
        if (response.success && response.data?.token) {
            this.setToken(response.data.token);
        }
        return response;
    };
    /** Link existing Hedera account → updates token */
    registerExistingCreator = async (accountId, publicKey, signature, challenge, info) => {
        const response = await this.creators.registerExistingCreator(accountId, publicKey, signature, challenge, info);
        if (response.success && response.data?.token) {
            this.setToken(response.data.token);
        }
        return response;
    };
}
//# sourceMappingURL=index.js.map