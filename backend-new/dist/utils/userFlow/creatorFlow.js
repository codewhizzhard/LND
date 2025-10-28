import crypto from "crypto";
import Creators from "../../database/userschema.js";
import { File } from "nft.storage";
import { TopicId } from "@hashgraph/sdk";
import jwt from "jsonwebtoken";
import { AccountId, PublicKey } from "@hashgraph/sdk";
import { createAssetTopic, sendEventToAsset } from "../../sdk/index.js";
import { uploadJsonToPinata } from "../../sdk/nftStorage/index.js";
const secretSalt = process.env.SECRETSALT;
const TOPIC_ID = process.env.TOPIC_ID;
const ADMIN_ID = TopicId.fromString(TOPIC_ID);
/* export async function createUser(publicKey) {

} */
/**
 * Verifies a Hedera signature using the account's public key.
 * @param accountId - The user's Hedera account ID
 * @param publicKey - The user's public key derived from private key
 * @param challenge - The original challenge message
 * @param signatureHex - Signature in hex format
 */
export function verifyHederaSignature(publicKey, challenge, signatureHex) {
    try {
        const sigBytes = Buffer.from(signatureHex, "hex");
        const challengeBytes = new TextEncoder().encode(challenge);
        const pubKey = PublicKey.fromString(publicKey);
        return pubKey.verify(challengeBytes, sigBytes);
    }
    catch (err) {
        console.error("Signature verification failed:", err);
        return false;
    }
}
export async function registerCreator(data) {
    try {
        const creator = await Creators.findById(data.creatorId);
        if (!creator)
            return { success: false, error: "Creator not found" };
        // Validate Hedera accountId
        try {
            AccountId.fromString(data.accountId); // just format check
        }
        catch {
            return { success: false, error: "Invalid Hedera accountId" };
        }
        // Generate DID
        // const creatorDID = createDID(data.accountId);
        // Create Hedera topic for this creator
        const creatorTopic = await createAssetTopic(`CREATOR_${data.accountId}`);
        if (!creatorTopic.topicId)
            return { success: false, error: "Failed to create creator topic" };
        // Update creator with wallet info
        creator.accountId = data.accountId;
        //creator.creatorDID = creatorDID;
        creator.creatorTopicId = creatorTopic.topicId.toString();
        //creator.generalTopicId = creator.generalTopicId || "ADMIN_TOPIC_ID"; // fallback
        if (data.phoneHash)
            creator.info = { ...creator.info, phoneHash: data.phoneHash };
        if (data.info)
            creator.info = { ...creator.info, ...data.info };
        // Prepare IPFS metadata
        const ipfsData = {
            creatorId: creator._id.toString(), // ✅ use mongoose id
            accountId: creator.accountId,
            didDocument: {
                id: creator.creatorDID,
                verificationMethod: [
                    {
                        id: `${creator.creatorDID}#keys-1`,
                        type: "Ed25519VerificationKey2018",
                        controller: creator.creatorDID,
                        publicKeyMultibase: data.publicKey,
                    },
                ],
                authentication: [`${creator.creatorDID}#keys-1`],
            },
            createdAt: new Date().toISOString(),
            info: creator.info,
            topics: {
                creatorTopicId: creator.creatorTopicId,
                // globalTopicId: creator.generalTopicId,
                topicdata: creatorTopic.txResponse
            },
        };
        const file = new File([JSON.stringify(ipfsData, null, 2)], "creatorData.json", {
            type: "application/json",
        });
        const uploadedDataCID = await uploadJsonToPinata(file);
        creator.vcReferences = [...(creator.vcReferences || []), uploadedDataCID]; // store IPFS link
        // Optional: send event to creator topic
        const eventData = {
            creatorId: creator._id.toString(),
            accountId: creator.accountId.toString(),
            // creatorDID: creator.creatorDID,
            eventType: "ADD_CREATOR",
            createdAt: new Date().toISOString(),
            eventId: crypto.randomUUID(),
            cids: [
                {
                    eventType: "ADD_ACCOUNT",
                    cid: uploadedDataCID,
                    createdAt: new Date().toISOString(),
                },
            ],
        };
        const payload = {
            topicId: creator.creatorTopicId,
            message: eventData,
        };
        const event = await sendEventToAsset(payload);
        if (event.status !== "SUCCESS") {
            return { success: false, error: "Failed to send event to Hedera" };
        }
        await creator.save();
        return { success: true, creator };
    }
    catch (err) {
        return { success: false, error: err.message || "Unexpected error" };
    }
}
export function generateToken(user) {
    const payload = {
        id: user._id,
        role: user.role,
    };
    if (user.accountId) {
        payload.accountId = user.accountId;
    }
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
}
/*
export async function registerCreator(data: {accountId: string, publicKey: string, phoneHash?: string | undefined, info?: Record<string, unknown>}) {
  try {
    // Validate accountId
    let accountId: string;
    try {
      AccountId.fromString(data.accountId); // validate format
      accountId = data.accountId;
    } catch (err) {
      return { success: false, error: "Invalid Hedera accountId" };
    }

    // Generate DID from accountId
    const creatorDID = createDID(accountId.toString());

    // Create a topic for this creator
    const creatorTopicId = await createAssetTopic(`CREATOR_${accountId}`);
    if (!creatorTopicId) {
      return { success: false, error: "Failed to create creator topic" };
    }

    // Build creator object
    const creatorData: Creator = {
      creatorId: crypto.randomUUID(),
      creatorTopicId: creatorTopicId.toString(),
      globalTopicId: ADMIN_ID.toString(),
      accountId,
      creatorDID,
      publicKey: data.publicKey,
      info: data.info,
      eventType: "REGISTER_CREATOR",
      createdAt: new Date(),
      eventId: crypto.randomUUID(),
      cids: [],
      assetId: crypto.randomUUID(),
      phoneHash: data.phoneHash
    };

    const creatorIpfsData = {
    creatorId: creatorData.creatorId,
    accountId: creatorData.accountId,
    didDocument: {
        id: creatorData.creatorDID,
        verificationMethod: [
        {
            id: `${creatorData.creatorDID}#keys-1`,
            type: "Ed25519VerificationKey2018",
            controller: creatorData.creatorDID,
            publicKeyMultibase: creatorData.publicKey,
        },
        ],
        authentication: [
        `${creatorData.creatorDID}#keys-1`
        ],
    },
    createdAt: creatorData.createdAt.toISOString(),
    eventType: creatorData.eventType,
    info: creatorData.info,
    topics: {
        creatorTopicId: creatorData.creatorTopicId, // optional
        globalTopicId: creatorData.globalTopicId, // optional
    }
};
    // Public version (remove sensitive info)
    // Upload to NFT.storage
    const file = new File(
      [JSON.stringify(creatorIpfsData, null, 2)],
      "creatorData.json",
      { type: "application/json" }
    );
    const uploadedDataCID = await uploadToNFTStorage(file);

    const cid: CidsEvent = {
      eventType: creatorData.eventType,
      cid: uploadedDataCID,
      createdAt: new Date().toISOString(),
    };

    // Send event to admin/general topic
    const adminEvent: Event = {
      creatorId: creatorData.creatorId,
      cids: [cid],
      createdAt: creatorData.createdAt.toISOString(),
      creatorDID: creatorData.creatorDID,
      eventId: creatorData.eventId,
      assetId: "22f6e76c-45b1-487e-b739-70e8b024f1fa",
      accountId: creatorData.accountId,
      eventType: creatorData.eventType
    };

    const adminEventStatus = await sendEventToAsset(adminEvent);
    if (adminEventStatus !== "SUCCESS") {
      return { success: false, error: "Failed to send admin event to Hedera" };
    }

    // Send event to creator’s topic
    const eventData: Event = {
      creatorId: creatorData.creatorId,
      createdAt: creatorData.createdAt.toISOString(),
      creatorTopicId: TopicId.fromString(creatorData.creatorTopicId),
      globalTopicId: TopicId.fromString(creatorData.globalTopicId),
      accountId: creatorData.accountId,
      publicKey: "z6Mkf...abcd",
      creatorDID: creatorData.creatorDID,
      cids: [cid],
      assetId: creatorData.assetId,
      eventType: "CREATE",
      eventId: crypto.randomUUID(),
    };

    const eventStatus = await sendEventToAsset(eventData);
    if (eventStatus !== "SUCCESS") {
      return { success: false, error: "Failed to send event to creator topic" };
    }

    // Save to DB
    const creator = await Creators.create(creatorData);

    return {
      success: true,
      ...creatorData,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Unexpected error" };
  }
} */ 
//# sourceMappingURL=creatorFlow.js.map