import { Client, PrivateKey, FileCreateTransaction, Hbar, TransferTransaction, TopicCreateTransaction, TopicMessageSubmitTransaction, TopicMessageQuery, TopicMessage, TopicInfoQuery, AccountCreateTransaction, TopicId, PublicKey, Transaction, AccountId, TransactionId, TransactionReceiptQuery, TransactionRecordQuery, TokenType, TokenSupplyType, TokenCreateTransaction, TokenMintTransaction, AccountBalanceQuery, ContractCreateFlow, ContractFunctionParameters, ContractCallQuery, ContractId } from "@hashgraph/sdk";
import dotenv from "dotenv";
import { DidDocumentBase, HcsDid, HcsIdentityNetworkBuilder, HcsVcDocumentBase } from "@hashgraph/did-sdk-js";
import axios from "axios";
import crypto from "crypto";
import { Events } from "../database/eventSchema.js";
import { getMaxListeners } from "events";
import { access } from "fs";
import { VerificationRecords } from "../database/verificationSchema.js";
import fs from "fs";
import path from "path";
import { uploadJsonToPinata } from "./nftStorage/index.js";
import { createVerifiableCredentialJwt } from "did-jwt-vc";
import { EdDSASigner } from "did-jwt";
import sha256hex from "../utils/utils.js";
import { IBUSINESS } from "../database/businessSchema.js";

dotenv.config();
// BACKEND TESTNET ACCOUNT PAYS FOR NOW USER'S WILL PAY IN PRODUCTION FOR EVERYTHING EXCEPT REGISTRATION




const OPERATOR_ID = process.env.OPERATOR_ID! 
const OPERATOR_KEY = process.env.OPERATOR_KEY!;
const TOPIC_ID = process.env.TOPIC_ID!;
const VERIFICATION_TOPIC_ID = process.env.VERIFICATION_TOPIC_ID!;
const TENANT_ID = process.env.MGS_TENANT_ID!
const REFRESH_TOKEN = process.env.MGS_REFRESH_TOKEN
const GUARDIAN_BASE_URL = process.env.GUARDIAN_BASE_URL;
const ADMIN_ID = TopicId.fromString(TOPIC_ID);
const TOKEN_ID = process.env.TOKEN_ID!
const maintenanceWallet = process.env.MAINTENANCE_ADDRESS!
const NFT_URI = process.env.NFT_URI!


// Parse ED25519 key
const operatorKey = PrivateKey.fromStringED25519(OPERATOR_KEY);
const OPERATOR_PUBLIC_KEY = operatorKey.publicKey;

// Configure testnet client
const client = Client.forTestnet();
client.setOperator(AccountId.fromString(OPERATOR_ID), operatorKey);




export const createAssetTopic = async (memo: string) => {
    if (!memo) throw new Error("Memo is required to create topic");

    const transaction = new TopicCreateTransaction()
    .setTopicMemo(memo)      
    .setAutoRenewPeriod(8000000); 
    
    //setAutoRenewalAccount(userid)

    // paid by the backend testnet for now, but it will be user's account in production
    const txResponse = await transaction.execute(client);
    console.log(`Create asset Transaction ID: ${txResponse}`);
    //Request the receipt of the transaction
    const receipt = await txResponse.getReceipt(client);
    const topicId = receipt.topicId
    return {txResponse, topicId}
    console.log(`Topic ID: ${receipt.topicId}`);

//Get the topic ID

}

/* interface TopicMessageData {
    originalCreatorId?: string;
    originalCreatedAt?: string;
    stage: number,
    timestamp: string,
    [key: string]: any
    
} */
/* 
    assetId?: string,
    eventId?: string */
    //data: Event, topicId?: string

    // write the data that will be sent to here logic in the backend
    type TopicMessagePayload = {
      topicId?: string;   // optional, fallback to ADMIN_ID if missing
      message: any;       // JSON serializable
    };

export async function sendEventToAsset(data:  TopicMessagePayload) {
  
    let submitMsgTx
    
    const message = JSON.stringify(data);
    
    /* if topicId is provided that points to message being sent to individual Asset topic while if not, it points to sending to the Creators topic(topic for user registration)*/
    // public topic for asset events
    if (data.topicId) {
        submitMsgTx =  new TopicMessageSubmitTransaction({
        topicId: data.topicId,
        message,})
    } else {
        //private topic for creator registration
        submitMsgTx = await new TopicMessageSubmitTransaction({
        topicId: ADMIN_ID,
        message,
        })
        .freezeWith(client)
        .sign(operatorKey);

    }
    const submitMsgTxSubmit = await submitMsgTx.execute(client);
    const transactionHash = Buffer.from(submitMsgTxSubmit.transactionHash).toString("hex")
    const transactionId = submitMsgTxSubmit.transactionId.toString()
    // Get the receipt of the transaction
    const getReceipt = await submitMsgTxSubmit.getReceipt(client);

    // Get the status of the transaction
    const transactionStatus = getReceipt.status;
    const status =  transactionStatus.toString()
    console.log("event:", transactionHash,status, transactionId)

    return { transactionHash, transactionId, status}

  
}
  //anchorCreatorSubmission({creatorId: "302e0254010030050603", createdAt: new Date().toISOString()})




export async function getAssetEvent(topicId?: TopicId) {
    const topic = topicId || ADMIN_ID
    new TopicMessageQuery()
        .setTopicId(topic)
        .setStartTime(0)
        .subscribe(
            client,
            // errorHandler
            (message: TopicMessage | null, error: Error | null) => {
                if (error) {
                    console.error("Error receiving topic message:", error);
                    return;
                }

                if (message) {
                    // Correct way to handle Uint8Array
                    const msgBuffer = Buffer.from(
                        message.contents.buffer,
                        message.contents.byteOffset,
                        message.contents.byteLength
                    );
                    console.log("Received message:", msgBuffer.toString("utf8"));
                }
            },
            // listener
            (message: TopicMessage) => {
                const msgBuffer = Buffer.from(
                    message.contents.buffer,
                    message.contents.byteOffset,
                    message.contents.byteLength
                );
                console.log("Listener received message:", msgBuffer.toString("utf8"));
            }
        );
}


export async function getEventInfo(number: number, topicId?: TopicId) {
    const sequenceNumber = number
    const topic = topicId || ADMIN_ID
    const url = `https://testnet.mirrornode.hedera.com/api/v1/topics/${topic}/messages/${sequenceNumber}`;
    const res = await fetch(url)
    if (!res.ok) {
        return {success: false, status: res?.status,  error: `Error fetching topic info: ${res.statusText}`};
    }
    const data = await res.json();
    console.log("Fetching topic info from URL:", data);
}

// creating an account for DID for users for both edsca or ed
// check alias type
export async function createAccount(publicKey: string) {
  try {
    if (!publicKey) {
      return { success: false, error: "Public key is required to create account" };
    }

    // Convert string → PublicKey object
    const pubKeyObj = PublicKey.fromString(publicKey);

    // Create transaction
      const transaction = new AccountCreateTransaction()
      .setInitialBalance(new Hbar(10))
      .setKeyWithoutAlias(pubKeyObj)
      

    const txResponse = await transaction.execute(client);
    

    // Get receipt
    const receipt = await txResponse.getReceipt(client);
    const newAccountId = receipt.accountId;

    if (!newAccountId) {
      return { success: false, error: "Failed to create account" };
    }

    return {
      success: true,
      accountId: newAccountId.toString(), // safer as string
      publicKey
    };
  } catch (err: any) {
    console.error("Account creation error:", err);
    return { success: false, error: err.message || "Unknown error" };
  }
}


// submiting a signed transaction

/// initiate transaction to be renewed by user and seriliazing it to the frontend


export async function buildTopicCreateTransaction(
  userPublicKey: string,
  userAccountId: string,
  memo: string = "User-owned topic with auto-renew"
): Promise<Uint8Array> {
  // Build transaction
  console.log("userPublickey:", userPublicKey)

        //The node account ID to submit the transaction to. You can add more than 1 node account ID to the list
      const nodeId = [];
      nodeId.push(new AccountId(2));

  const transaction = new TopicCreateTransaction()
    .setAdminKey(PublicKey.fromString(userPublicKey))
    .setAutoRenewAccountId(AccountId.fromString(userAccountId))
    .setTopicMemo(memo);

  // Freeze with client (no signing yet)
  const frozenTx = await transaction.freezeWith(client);

  // Return serialized bytes
  return frozenTx.toBytes();
}


/// non schedule

export async function executeUserSignedTopicAndMint(
  signedTopicTxBytesBase64: string,
  signedMintTxBytesBase64?: string,
) {
  try {
    if (!signedTopicTxBytesBase64) {
      return { success: false, error: "Missing signed topic transaction" };
      
    }

    // Reconstruct the user-signed topic transaction
    const topicTx = TopicCreateTransaction.fromBytes(
      Uint8Array.from(Buffer.from(signedTopicTxBytesBase64, "base64"))
    );

    // Execute user-signed topic transaction
    const topicResp = await topicTx.execute(client);
    const topicReceipt = await topicResp.getReceipt(client);
    const topicId = topicReceipt.topicId?.toString() || null;

    let tokenId: string | null = null;
    let mintStatus: string | null = null;

    // If user chose to mint immediately
    if (signedMintTxBytesBase64) {
      const mintTx = Transaction.fromBytes(
        Uint8Array.from(Buffer.from(signedMintTxBytesBase64, "base64"))
      );

      // Execute user-signed mint transaction
      const mintResp = await mintTx.execute(client);
      const mintReceipt = await mintResp.getReceipt(client);

      tokenId = mintReceipt.tokenId?.toString() || null;
      mintStatus = mintReceipt.status.toString();
    }

    return {
      success: true,
      topicId,
      tokenId,
      mintStatus,
      topicReceipt,
    };
  } catch (err: any) {
    console.error("executeUserSignedTopicAndMint error:", err);
    return { success: false, error: err.message || "Unknown error" };
  }
}


/**
 * Verify a specific Hedera Consensus Service message against its stored hash.
 *
 * @param topicId - Hedera topicId (e.g. "0.0.12345")
 * @param expectedHash - SHA-256 hash you stored when publishing
 * @param consensusTimestamp - Consensus timestamp of the message
 * @param mirrorUrl - Mirror Node base URL (default: testnet)
 */
export async function verifyPublishedMessage(
  topicId: string,
  expectedHash: string,
  consensusTimestamp: string,
  mirrorUrl: string = "https://testnet.mirrornode.hedera.com"
): Promise<boolean> {
  try {
    const url = `${mirrorUrl}/api/v1/topics/${topicId}/messages/${consensusTimestamp}`;
    const res = await axios.get(url);

    const mirrorMessage = res.data;
    if (!mirrorMessage?.message) {
      console.warn(`No message found for ${topicId} at ${consensusTimestamp}`);
      return false;
    }

    // Decode base64 → utf8
    const decoded = Buffer.from(mirrorMessage.message, "base64").toString("utf8");

    // Hash it again
    const actualHash = crypto.createHash("sha256").update(decoded).digest("hex");

    return actualHash === expectedHash;
  } catch (err) {
    console.error(`Error verifying message for ${topicId} at ${consensusTimestamp}:`, err);
    return false;
  }
}

/**
 * Try to fetch consensus info immediately after sending to Hedera.
 * Returns the consensusTimestamp if found, otherwise null.
 */
export async function tryImmediateConsensusCheck(transactionId: string, retries = 5, delayMs = 2000) {
  try {
    const txId = TransactionId.fromString(transactionId);

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const record = await new TransactionRecordQuery()
          .setTransactionId(txId)
          .execute(client);

        if (record?.receipt?.status?.toString() === "SUCCESS") {
          const consensusTime = record.consensusTimestamp?.toDate();
          console.log(`✅ Consensus reached immediately for ${transactionId} at ${consensusTime}`);
          return consensusTime;
        }

        console.log(
          `⌛ Attempt ${attempt}: Transaction not yet in consensus (status: ${record.receipt.status})`
        );
      } catch (err: any) {
        // Mirror nodes might not have the record yet — ignore and retry
        if (err.message?.includes("RECORD_NOT_FOUND")) {
          console.log(`⚠️ Attempt ${attempt}: record not found yet`);
        } else {
          console.log(`⚠️ Attempt ${attempt}: ${err.message}`);
        }
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    console.log(`❌ No consensus record found for ${transactionId} after ${retries} attempts`);
    return null;
  } catch (err) {
    console.error("❌ Immediate consensus check failed:", err);
    return null;
  }
}


/**
 * Verify unverified events by checking their transaction receipts
 */
export async function verifyPendingEvents() {
  // 🔍 Fetch all events that are not yet verified
  const pendingEvents = await Events.find({ verified: false });

  if (!pendingEvents.length) {
    console.log("✅ No pending events to verify");
    return;
  }

  console.log(`⏳ Verifying ${pendingEvents.length} pending events...`);

  for (const ev of pendingEvents) {
    try {
      if (!ev.msgTransactionId) continue;

      const txId = TransactionId.fromString(ev.msgTransactionId);
      

      // 📝 Query for the full transaction record
      const record = await new TransactionRecordQuery()
        .setTransactionId(txId.toString())
        .execute(client);

      console.log("records:", record.receipt)

      if (record.receipt.status.toString() !== "SUCCESS") {
        console.log(
          `⚠️ Event ${ev.eventId} still not successful (status: ${record.receipt.status})`
        );
        continue;
      }

      const consensusTimestamp = record.consensusTimestamp?.toDate();

      await Events.updateOne(
        { eventId: ev.eventId },
        {
          consensusTimestamp,
          verified: true,
        }
      );

      console.log(
        `🎉 Event ${ev.eventId} verified @ ${consensusTimestamp}`
      );
    } catch (err) {
      console.error(
        `❌ Error verifying event ${ev.eventId}:`,
        (err as Error).message
      );
    }
  }
}



async function transferHbar(senderAccountId: string, senderPrivateKey: PrivateKey, receiverAccountId: string) {
  try {
    // ✅ Configure client (Testnet
    // ✅ Build transaction
    const transferTx = new TransferTransaction()
      .addHbarTransfer(senderAccountId, new Hbar(-10)) // Sender pays 10 HBAR
      .addHbarTransfer(receiverAccountId, new Hbar(10)) // Receiver gets 10 HBAR
      .freezeWith(client);

    // ✅ Sign transaction
    const signedTx = await transferTx.sign(senderPrivateKey);

    // ✅ Submit transaction
    const txResponse = await signedTx.execute(client);

    // ✅ Get receipt
    const receipt = await txResponse.getReceipt(client);

    console.log("✅ Transaction successful!");
    console.log("Consensus status:", receipt.status.toString());
    console.log("Transaction ID:", txResponse.transactionId.toString());

    return { success: true, status: receipt.status.toString(), transactionId: txResponse.transactionId.toString() };
  } catch (error: any) {
    console.error("❌ Hedera transfer failed:", error.message || error);
    return { success: false, error: error.message || "Unknown error during transfer" };
  }
}
 //transferHbar("0.0.6747561", operatorKey, "0.0.7135806") 
// Example: get all policies for your 
//permissions/Users
let refreshToken: string
async function loginTenantAdmin() {
  try {
    const loginBody = {
      username: "LND",
      email: "topeadeolu5@gmail.com",
      password: "1!Protected",
    };

    const res = await axios.post(`${GUARDIAN_BASE_URL}/accounts/login`, loginBody, {
      headers: { "Content-Type": "application/json" },
    });

    // Depending on your MGS environment, this might be:
    // res.data.refreshToken  or res.data.data.refreshToken
    refreshToken = res.data.refreshToken || res.data.data?.refreshToken;
   

    if (!refreshToken) {
      throw new Error("No refresh token returned from login");
    }

    console.log("🔐 Login successful. Refresh token acquired.", refreshToken);
    return refreshToken;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error("❌ Login failed:", err.response?.data || err.message);
    } else {
      console.error("❌ Unexpected error:", err);
    }
    throw err;
  }
}

   //loginTenantAdmin()




async function getAccessToken(token?: string): Promise<string> {
  const tokenvalue = token ? token : REFRESH_TOKEN
  try {
    const res = await axios.post(
      `${GUARDIAN_BASE_URL}/accounts/access-token`,
      { refreshToken:  tokenvalue },
      { headers: { "Content-Type": "application/json" } }
    );
    //console.log("✅ Access token retrieved successfully", );
    return res.data.accessToken;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error("❌ Failed to get access token:", err.response?.data || err.message);
    } else if (err instanceof Error) {
      console.error("❌ Unexpected error:", err.message);
    } else {
      console.error("❌ Unknown error:", err);
    }
    throw err;
  }
}

export async function invitePlatformUser(accessToken: string, email: string, type: string): Promise<boolean> {
  try {

    const userInvite = {
      email,
      role: type, // or "STANDARD_REGISTRY" or user, etc.
      tenantId: TENANT_ID,
      returnInviteCode: false,
    };

    const res = await axios.post(
      `${GUARDIAN_BASE_URL}/tenants/invite`,
      userInvite,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "x-tenant-id": TENANT_ID,
        },
      }
    );

    // ✅ Return success flag instead of console.log
    return !!res.data?.success;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const message = err.response?.data?.message || err.message;
      throw new Error(`Guardian invite failed: ${message}`);
    } else if (err instanceof Error) {
      throw new Error(`Guardian invite failed: ${err.message}`);
    } else {
      throw new Error("Guardian invite failed: Unknown error");
    }
  }
}


export async function inviteUser(email: string, type: string): Promise<boolean>  {
  try {
    const accessToken = await getAccessToken();
    const success = await invitePlatformUser(accessToken, email, type);
    return success
  } catch (err) {
    console.error("🚨 Process failed:", err);
    return false
  }
}


export async function getId(accessToken: string, email: string, username: string): Promise<string> {
   try {
    const data = {
        email,
        username
    }
     const res = await axios.post(
      `${GUARDIAN_BASE_URL}/tenants/${TENANT_ID}/users`,
      data,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "x-tenant-id": TENANT_ID,
        },
      }
    );
    //console.log("ff:", res.data.users?.[0]?.id)
    return res.data.users?.[0]?.id
  } catch (err) {
    console.error("🚨 Process failed:", err);
    return ""
  }
}


export async function mgsLogin(password: string, userId: string, email: string): Promise<string> {
  //console.log("all:", accessToken, password, userId, email)
   try { 
    const data = {
        email,
        password,
        userId
    }
     const res = await axios.post(
      `${GUARDIAN_BASE_URL}/accounts/loginByEmail`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          "x-tenant-id": TENANT_ID,
        },
      }
    );
    //console.log("gg:", res.data.login.refreshToken)
    return res.data.login.refreshToken
    //return res.data.login.did
  } catch (err) {
    console.error("🚨 Process failed:", err);
    return ""
  }
}

type DIDProfile = {
  did: string;
  didDocument: any;
  VcDocument: any;
};

export async function profile(access: string, username: string): Promise<DIDProfile | null> {
 try { 
      const res = await axios.get(
      `${GUARDIAN_BASE_URL}/profiles/${username}`,
      {
        headers: {
          Authorization: `Bearer ${access}`,
          "Content-Type": "application/json",
          "x-tenant-id": TENANT_ID,
        },
      }
    );
    return {did: res.data.did, didDocument: res.data?.didDocument, VcDocument: res.data?.vcDocument}
  } catch (err) {
    console.error("🚨 Process failed:", err);
    return null
  }
}

export const getProfileData = async (
  email: string,
  username: string,
  password: string
): Promise<DIDProfile | null> => {
  try {
    const accessToken = await getAccessToken();
    const id = await getId(accessToken, email, username);
    if (!id || id.length < 5) return null;

    const token = await mgsLogin(password, id, email);
    const access = await getAccessToken(token);
    const data = await profile(access, username);
    console.log("data", data)
    return data;
  } catch (err) {
    console.error("🚨 Failed to get DID:", err);
    return null;
  }
};




export async function submitMessageToPrivateTopic(
  message: string,
) {
  const submitKey = operatorKey
  try {
    // Freeze and sign with submit key (for private topics)
    const submitMsgTx = await new TopicMessageSubmitTransaction({
      topicId: VERIFICATION_TOPIC_ID,
      message,
    })
      .freezeWith(client)
      .sign(submitKey)

    const submitMsgTxSubmit = await submitMsgTx.execute(client);

    const transactionHash = Buffer.from(submitMsgTxSubmit.transactionHash).toString("hex");
    const transactionId = submitMsgTxSubmit.transactionId.toString();

    const receipt = await submitMsgTxSubmit.getReceipt(client);
    const status = receipt.status.toString();

    console.log(
      `✅ Message submitted to topic ${VERIFICATION_TOPIC_ID}. Status: ${status}`
    );
    if (status !== "SUCCESS") {
       return {
      success: false,
      error: "failed to write verification logs on hedera"
    }; 
    }
    return {
      transactionHash,
      transactionId,
      status,
    };
  } catch (error: any) {
    console.error("❌ Error submitting message to private topic:", error.message || error);
    return {
      success: false,
      error: error.message || "Unknown error occurred",
    };
  }
}

//submitMessageToPrivateTopic("testing")


  
export async function mintAndTransferNFT(
   recipientId: AccountId,
) {
 const treasuryKey = operatorKey
  try {
    const CID = [
    Buffer.from(NFT_URI)
    ];

    console.log("Minting NFT...");
    const mintTx = await new TokenMintTransaction()
      .setTokenId(TOKEN_ID)
      .setMetadata(CID)
      .freezeWith(client)
      .sign(operatorKey); //supplyKey

    const mintTxSubmit = await mintTx.execute(client);
    const mintRx = await mintTxSubmit.getReceipt(client);
    const serials = mintRx.serials.map((s) => s.toNumber());

    console.log(`✅ Created NFT ${TOKEN_ID} with serial(s): ${serials.join(", ")}`);

    // Transfer the first NFT (you can modify this for multiple)
    const serial = serials[0];
    if (!serial) throw new Error("No NFT serials were minted");

     console.log("🔁 Transferring NFT to recipient...");
    const transferTx = await new TransferTransaction()
      .addNftTransfer(TOKEN_ID, serial, OPERATOR_ID, recipientId)
      .freezeWith(client)
      .sign(treasuryKey);

    const transferSubmit = await transferTx.execute(client);
    const transferRx = await transferSubmit.getReceipt(client);

    console.log(`✅ NFT transfer complete: ${transferRx.status.toString()}`);

    return {
      success: true,
      TOKEN_ID,
      serial,
      status: transferRx.status.toString(),
    };
  } catch (error: any) {
    console.error("❌ Error in mintAndTransferNFT:", error.message || error);
    return {
      success: false,
      error: error.message || "Unknown error occurred while minting/transferring NFT",
    };
  }
}


//generate edsca account



export async function generateEdscaAccount(publicKey: string ) {
  try {
     if (!publicKey) {
      return { success: false, error: "Public key is required to create account" };
    }
    const hederaPublicKey = PublicKey.fromString(publicKey);

    // Create transaction
     const tx = await new AccountCreateTransaction()
      .setECDSAKeyWithAlias(hederaPublicKey) // set the account key with alias
      .setInitialBalance(new Hbar(20));   // fund with 20 HBAR

    const txResponse = await tx.execute(client);
    const receipt = await txResponse.getReceipt(client);
    const newAccountId = receipt.accountId;
   console.log("Account ID:", newAccountId?.toString());


    if (!newAccountId) {
      return { success: false, error: "Failed to create account" };
    }

    return {
      success: true,
      accountId: newAccountId.toString(), // safer as string
    };
  } catch (err: any) {
    console.error("Account creation error:", err);
    return { success: false, error: err.message || "Unknown error" };
  }
}


  const getAccount = async() => {

    const newPrivateKey = PrivateKey.generateECDSA();
    console.log("private:", newPrivateKey.toStringRaw())
    console.log("private:", newPrivateKey.toStringDer())
  const newPublicKey = newPrivateKey.publicKey;
  //console.log("public:", newPublicKey)

  // build & execute the account creation transaction
  const transaction = new AccountCreateTransaction()
    .setECDSAKeyWithAlias(newPublicKey)          // set the account key with alias
    .setInitialBalance(new Hbar(20));           // fund with 20 HBAR

  const txResponse = await transaction.execute(client);
  const receipt = await txResponse.getReceipt(client);
  const newAccountId = receipt.accountId;

  console.log(`\nHedera account created: ${newAccountId}`);
  console.log(`EVM Address: 0x${newPublicKey.toEvmAddress()}`);

  client.close();
  }
  //getAccount()





/**
 * Deploys a smart contract on Hedera using the ContractCreateFlow API.
 *
 * @param client - Initialized Hedera Client (with operator)
 * @param bytecodePath - Path to compiled contract bytecode (.bin)
 * @param maintenanceWallet - Address to pass to constructor (string)
 */
export async function deployIssuerBondManager() {
  try {

    // 1️⃣ Read compiled bytecode from file
    const contractPath = path.resolve("./src/sdk/issuerBond.bin");
    const contractBytecode = fs.readFileSync(contractPath);

    console.log("⏳ Deploying contract to Hedera...", contractBytecode);

    // 2️⃣ Build deployment transaction
    const contractCreateTx = new ContractCreateFlow()
      .setGas(4_000_000) // Enough gas for constructor
      .setBytecode(contractBytecode)
      .setConstructorParameters(
        new ContractFunctionParameters().addAddress(maintenanceWallet)
      )
      .setInitialBalance(new Hbar(0)) // No pre-funded HBAR
      .setContractMemo("Issuer Bond Manager Contract");

    // 3️⃣ Execute the transaction
    const txResponse = await contractCreateTx.execute(client);

    // 4️⃣ Get the receipt (wait for consensus)
    const receipt = await txResponse.getReceipt(client);

    // 5️⃣ Extract the Contract ID and Solidity address
    const contractId = receipt.contractId;
    if (!contractId) return {success: false, error: "error getting contractId"}
    const contractAddress = contractId.toEvmAddress();

    console.log(`✅ Contract successfully deployed!`);
    console.log(`Contract ID: ${contractId.toString()}`);
    console.log(`Solidity Address: ${contractAddress}`);
    return {success: true, contractId, contractAddress };
  } catch (error) {
    console.error("❌ Error deploying contract:", error);
    throw error;
  }
}

//deployIssuerBondManager()

interface ContractAction {
  call_depth: number;
  call_operation_type: string;
  call_type: string;
  caller: string | null;
  caller_type: string;
  from: string;
  gas: number;
  gas_used: number;
  index: number;
  input: string | null;
  recipient: string | null;
  recipient_type: string | null;
  result_data: string | null;
  result_data_type: string;
  timestamp: string;
  to: string | null;
  value: number;
}

const transactionId = '0.0.7119890@1761298725.685214004'; /* 0.0.7119890-1761298725-685214004 */
const network = 'testnet';

async function getContractActions(txId: string, network: string) {
  const url = `https://${network}.mirrornode.hedera.com/api/v1/contracts/results/${txId}/actions`;

  try {
    const response = await axios.get(url);
    const actions: ContractAction[] = response.data.actions;
    actions.forEach((action: ContractAction, idx: number) => {
      console.log(`Action #${idx}:`);
      console.log(`  Call Type: ${action.call_type}`);
      console.log(`  Caller: ${action.caller} (${action.caller_type})`);
      console.log(`  Recipient: ${action.recipient} (${action.recipient_type})`);
      console.log(`  Input (function selector and params): ${action.input}`);
      console.log(`  Gas Used: ${action.gas_used}`);
      console.log(`  Value (tinybars): ${action.value}`);
      console.log(`  Result Data: ${action.result_data}`);
      console.log('---');
    });
  } catch (err: any) {
    console.error('Error fetching contract actions:', err.response ? err.response.data : err.message);
  }
}


/// issuer issue vc for business
// npm i did-jwt-vc did-jwt

export async function issueVcJwtForBusiness(issuerDid: string, business: IBUSINESS) {
  // signer (example uses EdDSA or whatever the DID controller expects)
  const signer = EdDSASigner(operatorKey.toBytesRaw()); // private key in correct format: for the project for now

  // VC payload per W3C VC data model
  const vcPayload = {
    sub: business.orgDID,
    nbf: Math.floor(Date.now() / 1000),
    vc: {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential", "BusinessVerificationCredential"],
      credentialSubject: {
        id: business.orgDID,
        businessName: business.name,
        sector: business.sector,
        verifiedBy: issuerDid,
        verifiedAt: new Date().toISOString()
      }
    }
  };

  // create signed VC JWT
  const vcJwt = await createVerifiableCredentialJwt(vcPayload, { did: issuerDid, signer });

  // compute hash to anchor on Hedera
  const messageHash = sha256hex(vcJwt);
  return {vcJwt, messageHash}

}




// uploaded: bafkreicecnx2gvntm6fbcrvnc336qze6st5u7qq7457igegamd3bzkx7ri  


   /*  const ipfsData = {
      name: "GAD", // ✅ use mongoose id
      type: "image/png",
      image: "ipfs://Qmf3797FzHyW7ozCnBpR3AxBojP7Q1km4r87CjX26huug4"
    };

    const file = new File([JSON.stringify(ipfsData, null, 2)], "Issuer.json", {
      type: "application/json",
    });
    
    const uploadedDataCID = await uploadJsonToPinata(file);
    console.log("uploaded:", uploadedDataCID) */
    
// 

//getContractActions(transactionId, network);
//Contract call query


/*  const alias = "0x000000000000000000000000000000000066f5a9"; // your EVM address alias
fetch(`https://testnet.mirrornode.hedera.com/api/v1/accounts/${alias}`)
  .then(res => res.json())
  .then(data => {
    console.log("Account ID:", data.account);
    console.log("EVM Address:", data.evm_address);
  });  */

//deployIssuerBondManager()

//mintToken(metadataArray, true)
/*  let treasuryBalance = await new AccountBalanceQuery()
    .setAccountId(OPERATOR_ID)
    .execute(client);

  console.log(
    `Treasury balance: ${treasuryBalance?.tokens?[0].balance} NFTs of ID ${TOKEN_ID}`
  );
  /* console.log(
    `Treasury balance: ${treasuryBalance?.tokens.get(TOKEN_ID) ?? 0} NFTs of ID ${TOKEN_ID}`
  ); */


/* balance  {"hbars":"903.52230311 ℏ","tokens":[{"tokenId":"0.0.7098444","balance":"1","decimals":0}]} */







/* 
const transferTx = await new TransferTransaction()
    .addNftTransfer(tokenId, serials[0].toNumber(), treasuryId, recipientId)
    .freezeWith(client)
    .sign(treasuryKey);

  const transferSubmit = await transferTx.execute(client);
  const transferRx = await transferSubmit.getReceipt(client);
  console.log(`NFT transfer from Treasury to recipient: ${transferRx.status} ✅`);

  // Check balances
  let treasuryBalance = await new AccountBalanceQuery()
    .setAccountId(treasuryId)
    .execute(client);
  console.log(
    `Treasury balance: ${treasuryBalance.tokens.get(tokenId) ?? 0} NFTs of ID ${tokenId}`
  );

  let recipientBalance = await new AccountBalanceQuery()
    .setAccountId(recipientId)
    .execute(client);
  console.log(
    `Recipient's balance: ${recipientBalance.tokens.get(tokenId) ?? 0} NFTs of ID ${tokenId}`
  );
}

mintAndTransferNFT().catch(console.error);

*/

/* 
const nftCreate = await new TokenCreateTransaction()
    .setTokenName("GUARD")
    .setTokenSymbol("GHD")
    .setTokenType(TokenType.NonFungibleUnique)
    .setDecimals(0)
    .setInitialSupply(0)
    .setTreasuryAccountId(OPERATOR_ID)
    .setSupplyType(TokenSupplyType.Infinite) 
    .setSupplyKey(operatorKey)
    .freezeWith(client);

const nftCreateTxSign = await nftCreate.sign(operatorKey);
const nftCreateSubmit = await nftCreateTxSign.execute(client);
const nftCreateRx = await nftCreateSubmit.getReceipt(client);
const tokenId = nftCreateRx.tokenId; 
console.log(`Created NFT with token ID: ${tokenId}`);
 */

///
/* 

export const publishToHCS = async (topicId: string, message: any) => {
  const client = Client.forTestnet();
  client.setOperator(process.env.HEDERA_ACCOUNT_ID!, process.env.HEDERA_PRIVATE_KEY!);

  const tx = await new TopicMessageSubmitTransaction({
    topicId,
    message: JSON.stringify(message),
  }).execute(client);

  const receipt = await tx.getReceipt(client);
  return {
    status: receipt.status.toString(),
    transactionId: tx.transactionId.toString(),
  };
};



///

/*  
export const mintIssuerNFT = async (toAccountId: string, name: string, sector: string) => {
  const nftTokenId = TokenId.fromString(process.env.ISSUER_NFT_TOKEN_ID!);

  const metadata = Buffer.from(JSON.stringify({
    type: "Verified Issuer",
    name,
    sector,
    issuedAt: new Date().toISOString(),
  }));

  const mintTx = await new TokenMintTransaction()
    .setTokenId(nftTokenId)
    .setMetadata([metadata])
    .execute(client);

  const receipt = await mintTx.getReceipt(client);
  const serial = receipt.serials[0].low;

  // Associate if not already
  try {
    await new TokenAssociateTransaction()
      .setTokenIds([nftTokenId])
      .setAccountId(toAccountId)
      .execute(client);
  } catch (err) {
    console.log("Token already associated or pending.");
  }

  // Transfer NFT to issuer
  const transferTx = await new TransferTransaction()
    .addNftTransfer(nftTokenId, serial, process.env.HEDERA_ACCOUNT_ID!, toAccountId)
    .execute(client);

  return {
    tokenId: nftTokenId.toString(),
    serial,
  };
};


/*  const txResponse = await new TopicCreateTransaction()
  .setSubmitKey(operatorKey)
  .setAdminKey(operatorKey)
  .setTopicMemo("platform-verifications-private-topic")
  .execute(client);
  

// Get the receipt
const receipt = await txResponse.getReceipt(client);
const topicId = receipt.topicId;

console.log(`Your private topic ID is: ${topicId}`);  */









//





/**string
 * Creates the Standard Registry Certification Policy on the Guardian backend.
 */
/* 
export async function createSrCertificationPolicy(
  access: string,
): Promise<any | null> {
  try {
    const payload = {
      name: "Standard Registry Certification Policy",
      description:
        "Automatically applies to all Standard Registries; certifies SR eligibility and mints token upon approval.",
      policyTag: "SR_CERT_POLICY",
      status: "DRAFT",
      topicDescription: "SR-wide Certification Policy",
      creator: "did:hedera:testnet:4FSKwkfhS1hA4eUP8YeqZ2jBhcAJhkuMquDzNmhngMiW_0.0.7095729",
      owner: "did:hedera:testnet:4FSKwkfhS1hA4eUP8YeqZ2jBhcAJhkuMquDzNmhngMiW_0.0.7095729",
      version: "1.0.0",
      userRoles: ["RootStandardRegistry", "PartnerStandardRegistry"],
      policyRoles: ["RootStandardRegistry", "PartnerStandardRegistry"],
      config: {
        autoBinding: {
          role: "PartnerStandardRegistry",
          type: "STANDARD_REGISTRY",
          scope: "GLOBAL",
        },
        schemas: [
          {
            name: "IssuerVerificationSchema",
            uuid: "f9e24493-b665-4cac-825b-97683af465ab",
            initialRoles: ["PartnerStandardRegistry"],
            approverRoles: ["RootStandardRegistry"],
            mintTokens: true,
            mintField: "issuerDID",
          },
        ],
        mintTokens: [
          {
            tokenName: "CertifiedStandardRegistryToken",
            tokenSymbol: "CSRT",
            tokenType: "fungible",
            decimals: 0,
            changeSupply: true,
            enableAdmin: false,
            enableFreeze: false,
            enableKYC: false,
            enableWipe: false,
            templateTokenTag: "token_template_sr_cert",
          },
        ],
        trustChain: {
          RootStandardRegistry: {
            mintingSchema: "IssuerVerificationSchema",
            viewOnlyOwnVPs: false,
          },
          PartnerStandardRegistry: {
            mintingSchema: "IssuerVerificationSchema",
            viewOnlyOwnVPs: true,
          },
        },
      },
      policyNavigation: [
        {
          role: "PartnerStandardRegistry",
          steps: [
            {
              block: "submitIssuerVerification",
              level: 1,
              name: "Submit Certification Application",
            },
          ],
        },
        {
          role: "RootStandardRegistry",
          steps: [
            {
              block: "reviewApplications",
              level: 1,
              name: "Review and Approve Applications",
            },
          ],
        },
      ],
      policyTopics: [
        {
          name: "StandardRegistryCertification",
          description: "Main topic for SR certification workflow",
          memoObj: "SRPolicy",
          static: false,
          type: "any",
        },
      ],
      policyGroups: [
        {
          name: "SR Certification Group",
          creator: "PartnerStandardRegistry",
          groupAccessType: "Public",
          groupRelationshipType: "Multiple",
          members: ["PartnerStandardRegistry"],
        },
      ],
    };

    const res = await axios.post(`${GUARDIAN_BASE_URL}/policies`, payload, {
      headers: {
        Authorization: `Bearer ${access}`,
        "Content-Type": "application/json",
        "x-tenant-id": "68f60400348f53cc0b248011",
      },
    });

    console.log("✅ Policy created successfully:", res.data);
    return res.data;
  } catch (err: any) {
    console.error("🚨 Failed to create SR Certification Policy:", err.response?.data || err.message);
    return null;
  }
}
createSrCertificationPolicy("eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGY2MDQ3MDA4MmVlMDk5NGM1N2NhZjgiLCJ1c2VybmFtZSI6IkxORF9JU1NVRVJfVkVSSUZJQ0FUSU9OIiwiZGlkIjoiZGlkOmhlZGVyYTp0ZXN0bmV0OjRGU0t3a2ZoUzFoQTRlVVA4WWVxWjJqQmhjQUpoa3VNcXVEek5taG5nTWlXXzAuMC43MDk1NzI5Iiwicm9sZSI6IlNUQU5EQVJEX1JFR0lTVFJZIiwiZXhwaXJlQXQiOjE3NjEwNzY4ODMxMDAsImlhdCI6MTc2MDk5MDQ4MywiaXNzIjoiZ3VhcmRpYW5zZXJ2aWNlLmFwcCJ9.PvZdxKuuryiS3-q9JuF-vAVD4s9w4Wf-NpsC48oao1y61BU8dfgPBnml5WiEbKAYKGTI9D7OItSYW2KpQDcIcon1v8AuaTH-hu2rapoeKEyJuptdtQjP1iA0pOGNrOulhC0AYMirNN1vH1Nz5_oJ1fBog0nQ2x6YTLXstfaHc8M")
 */
//

 //transferHbar("0.0.6747561", operatorKey, "0.0.7095645")  

// Generate a new DID
/* 
export async function generateHederaDID(/* userPublicKey: string )  Promise<string | null>  {

  try {
    const identityNetwork = await new HcsIdentityNetworkBuilder()
      .setNetwork("testnet")
      .setAppnetName("LND")
      .setPublicKey(OPERATOR_PUBLIC_KEY)
      .setMaxTransactionFee(new Hbar(2))
      .setDidTopicMemo("User DID Topic")
      .setVCTopicMemo("User VC Topic")
      .execute(client);

    // 2️⃣ Generate DID for user public key
    const userDidObj = identityNetwork.generateDid(userPublicKeyObj, false);
    const userDid: string = userDidObj.toString();

    /* console.log("✅ Generated DID:", userDid);
    return userDid; 
    console.log("id:", identityNetwork)

  } catch (err: any) {
    console.error("❌ Failed to generate DID:", err);
    return null; // return null on failure
  }
}
 */







// Assume backendPrivateKey is securely loaded from your environment
/* const backendPrivateKey = PrivateKey.fromString(OPERATOR_KEY);

export async function executeUserSignedTopicAndMint(
  signedTopicTxBytesBase64: string,
  signedMintTxBytesBase64?: string,
) {
  try {
   
    if (!signedTopicTxBytesBase64) {
      return { success: false, error: "Missing signed topic transaction" };
    }

    // Reconstruct the user-signed topic transaction
    const topicTx = TopicCreateTransaction.fromBytes(
      Uint8Array.from(Buffer.from(signedTopicTxBytesBase64, "base64"))
    );

    // Add backend (payer) signature
    const fullySignedTopicTx = await topicTx.sign(backendPrivateKey);

    // Execute the fully signed topic transaction
    const topicResp = await fullySignedTopicTx.execute(client);
    const topicReceipt = await topicResp.getReceipt(client);
    const topicId = topicReceipt.topicId?.toString() || null;

    let tokenId: string | null = null;
    let mintStatus: string | null = null;

    // If user chose to mint immediately
    if (signedMintTxBytesBase64) {
      const mintTx = Transaction.fromBytes(
        Uint8Array.from(Buffer.from(signedMintTxBytesBase64, "base64"))
      );

      // Add backend (payer) signature for mint as well, if needed
      const fullySignedMintTx = await mintTx.sign(backendPrivateKey);

      // Execute user-signed mint transaction
      const mintResp = await fullySignedMintTx.execute(client);
      const mintReceipt = await mintResp.getReceipt(client);

      tokenId = mintReceipt.tokenId?.toString() || null;
      mintStatus = mintReceipt.status.toString();
    }

    return {
      success: true,
      topicId,
      tokenId,
      mintStatus,
      topicReceipt,
    };
  } catch (err: any) {
    console.error("executeUserSignedTopicAndMint error:", err);
    return { success: false, error: err.message || "Unknown error" };
  }
}
 */
/// schedule transaction
/* 
export async function createScheduledTopic(counterpartyPublicKey: string) {
  try {
    // 1. Build the inner TopicCreateTransaction
    const topicTx = new TopicCreateTransaction()
      .setTopicMemo("Scheduled topic creation"); // no adminKey, no autoRenew

    // 2. Wrap inside ScheduleCreateTransaction
    const scheduleTx = await new ScheduleCreateTransaction()
      .setScheduledTransaction(topicTx)
      .setScheduleMemo("Schedule for topic creation")
      .setAdminKey(PublicKey.fromString(counterpartyPublicKey)) // optional, allows counterparty to delete/cancel
      .freezeWith(client);

    // 3. Sign as payer (backend operator)
    const signedScheduleTx = await scheduleTx.sign(
      PrivateKey.fromString(process.env.OPERATOR_KEY!)
    );

    // 4. Execute the scheduled transaction
    const txResponse = await signedScheduleTx.execute(client);
    const receipt = await txResponse.getReceipt(client);

    // 5. Get the scheduleId
    const scheduleId: ScheduleId = receipt.scheduleId!;
    console.log("✅ Schedule created with ID:", scheduleId.toString());

    return { success: true, scheduleId: scheduleId.toString() };
  } catch (err: any) {
    console.error("❌ Error creating scheduled topic:", err);
    return { success: false, error: err.message };
  }
} */

// check schedule info
/* 
export async function checkScheduledStatus(scheduleIdStr: string) {
  try {
    const scheduleId = ScheduleId.fromString(scheduleIdStr);

    const info = await new ScheduleInfoQuery()
      .setScheduleId(scheduleId)
      .execute(client);

    if (info.executed) {
      console.log("✅ Scheduled transaction executed at:", info.executed.toString());
      return {success: true, executed: true, executedAt: info.executed.toDate() };
    } else {
      console.log("⏳ Scheduled transaction pending signatures.");
      return {success: true, executed: false, waitingSignatures: info.signers};
    }
  } catch (err: any) {
    console.error("❌ Error checking schedule status:", err);
    return {success: false, executed: false, error: err.message };
  }
} */