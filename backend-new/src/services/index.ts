import { createHttpsAgent } from "../utils/https.js";
import { createAuth, type AuthSDK  } from "./auth/authentication.js";
import { createTopic, type TopicSDK } from "./topic/topicCreation.js";
import { createCreator, type CreatorSDK } from "./account/acct.js";
import { createContact, type ContactSDK } from "./contact/contactList.js";
import { createMessages, type MessageSDK } from "./messages/messages.js";
import { type VerifySDK, createVerify } from "./verify/verify.js";
import { createVerification, type VerificationSDK } from "./organization/organization.js";

interface HttpServiceConfig {
  apiKey?: string;
  baseURL?: string;
}

export class X {
  private token: string | null = null;
  private http: ReturnType<typeof createHttpsAgent>;

  public auth: AuthSDK;
  public creators: CreatorSDK;
  public topic: TopicSDK;
  public contacts: ContactSDK;
  public messages: MessageSDK;
  public verify: VerifySDK;
  public org: VerificationSDK; // ✅ Added verification property

  // Shortcuts
  public prepareTopic!: TopicSDK["prepareNonScheduleTopicTransaction"];
  public handleTopic!: TopicSDK["handleNonScheduleTransaction"];
  public handleTopicCreation!: TopicSDK["handleTopicCreation"];
  public getUserEvents!: TopicSDK["getUserEvents"];
  public getUserAssets!: TopicSDK["getUserAssets"];
  public verifyEventsFromDB!: VerifySDK["verifyEventsFromDB"];
  public verifyEventsOnHedera!: VerifySDK["verifyEventsOnHedera"];
  public addContact!: ContactSDK["addContact"];
  public viewAllContacts!: ContactSDK["viewAllContacts"];
  public getAllMessages!: MessageSDK["getAllMessages"];

  // ✅ Verification shortcuts
  public orgGetIssuer!: VerificationSDK["getIssuer"];
  public orgRegisterIssuerEcdsaAccount!: VerificationSDK["registerIssuerEcdsaAccount"];
  public orgRetrieveIssuerEcdsaAccount!: VerificationSDK["retrieveIssuerEcdsaAccount"];
  public orgSaveTransactionId!: VerificationSDK["saveTransactionId"];
  public orgGetBusiness!: VerificationSDK["getBusiness"];
  public orgGetBusinessesByIssuer!: VerificationSDK["getBusinessesByIssuer"];
  public orgAddWorker!: VerificationSDK["addWorker"];
  public orgGetWorkers!: VerificationSDK["getWorkers"];
  public orgRemoveWorker!: VerificationSDK["removeWorker"];
  public addOrgType!: VerificationSDK["addCreatorType"];
  public orgBusinessRumors!: VerificationSDK["getBusinessRumors"];
  public orgIssuers!: VerificationSDK["getIssuers"];
  public orgRequestIssuerTrust!: VerificationSDK["requestIssuerTrust"];
  public orgAccessIssuerTrust!: VerificationSDK["accessIssuerTrust"];

  constructor(config: HttpServiceConfig = {}) {
    const baseURL = config.baseURL || "http://localhost:3001";
    const apiKey = config.apiKey || "";
    this.http = createHttpsAgent(apiKey, baseURL);

    // Restore persisted token (if exists)
    const savedToken =
      typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
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
    this.addOrgType = this.org.addCreatorType
    // new
    this.orgBusinessRumors = this.org.getBusinessRumors
    this.orgIssuers = this.org.getIssuers
    this.orgRequestIssuerTrust = this.org.requestIssuerTrust
    this.orgAccessIssuerTrust = this.org.accessIssuerTrust
  }

  /** Update token for protected requests */
  setToken(token: string) {
    this.token = token;
    (this.http as any).setToken(token);
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", token);
    }
  }

  /** Clear token (logout) */
  clearToken() {
    this.token = null;
    (this.http as any).setToken("");
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
    }
  }

  /** Signup (public) */
  signup = async (
    role: "user" | "organization",
    password: string,
    email: string,
    displayName?: string,
    orgName?: string,
    phoneHash?: string,
    userType?: string
  ) => {
    return await this.auth.signup(
      role,
      password,
      email,
      displayName,
      orgName,
      phoneHash,
      userType
    );
  };

  /** Login → automatically sets token */
  login = async (
    role: "user" | "organization",
    identifier: string,
    password: string,
    email?: string
  ) => {
    const result = await this.auth.login(role, identifier, password, email);
    if (result.success && result.data?.token) {
      this.setToken(result.data.token);
    }
    return result;
  };

  /** Add Hedera account → updates token */
  registerNewCreator = async (
    publicKey: string,
    token?: string,
    info?: any
  ) => {
    const response = await this.creators.registerNewCreator(
      publicKey,
      token,
      info
    );
    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }
    return response;
  };

  /** Link existing Hedera account → updates token */
  registerExistingCreator = async (
    accountId: string,
    publicKey: string,
    signature: string,
    challenge: string,
    info?: any
  ) => {
    const response = await this.creators.registerExistingCreator(
      accountId,
      publicKey,
      signature,
      challenge,
      info
    );
    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }
    return response;
  };
}
