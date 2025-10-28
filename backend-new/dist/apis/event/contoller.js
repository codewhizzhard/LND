import { Client } from "@hashgraph/sdk";
import { buildTopicCreateTransaction, createAssetTopic, sendEventToAsset, tryImmediateConsensusCheck } from "../../sdk/index.js";
import { v4 as uuidv4 } from "uuid";
import { Assets } from "../../database/assetSchema.js";
import { Events, EventType } from "../../database/eventSchema.js";
import QRCode from "qrcode";
import { Contacts } from "../../database/contactsSchema.js";
import { Messages } from "../../database/messageSchema.js";
import sha256hex from "../../utils/utils.js";
import Businesses from "../../database/businessSchema.js";
import { Rumors } from "../../database/rumor.js";
// Configure your Hedera client here (or import from a config file)
const client = Client.forTestnet(); // or Mainnet
/**
 * Submit a signed Hedera transaction to the network
 */
/**
 * Receive signed transaction + optional mint transaction from frontend
 * - User signs the transaction and/or mint on the frontend
 * - Backend submits them to Hedera
 */
export const handleNonScheduleTransaction = async (req, res) => {
    /*
    try {
    
      const { signedTxBytes, metadata, mintTxBytes } = req.body;
        console.log("meta:", metadata)
  
      if (!req.creator) {
        return res.status(401).json({ success: false, error: "Unauthorized: login required" });
      }
  
      let topicId: string;
      let isFirstEvent = false;
      let txResult: any = null;
  
      // ✅ Case 1: User is creating a new asset/topic
      if (signedTxBytes && !metadata?.assetTopicId) {
        console.log("about to sign")
        txResult = await executeUserSignedTopicAndMint(signedTxBytes, mintTxBytes);
        if (!txResult.success) {
          return res.status(500).json(txResult);
        }
        console.log("res:", txResult)
        if (!txResult.topicId) {
          return res.status(500).json({ success: false, error: "Missing topicId from signed transaction" });
        }
  
        topicId = txResult.topicId.toString();
        isFirstEvent = true;
  
        // Immediately send the creation message to the new topic
        const msgPayload = {
          message: metadata?.message || metadata,
          topicId
        };
        const msgStatus = await sendEventToAsset(msgPayload);
        if (msgStatus !== "SUCCESS") {
          return res.status(500).json({ success: false, error: "Failed to send creation message to topic" });
        }
  
      // ✅ Case 2: Sending message to an existing topic
      } else if (!signedTxBytes && metadata?.assetTopicId) {
        topicId = metadata.assetTopicId;
  
        const msgPayload = {
          message: metadata?.message || metadata,
          topicId
        };
        const msgStatus = await sendEventToAsset(msgPayload);
        if (msgStatus !== "SUCCESS") {
          return res.status(500).json({ success: false, error: "Failed to send message to topic" });
        }
  
      } else {
        return res.status(400).json({
          success: false,
          error: "Invalid input: either provide signedTxBytes (new topic) or topicId (message).",
        });
      }
  
      // 📌 Asset URL + QR
      const url = `https://yourdomain.com/asset/${topicId}`;
      const qrCodeBase64 = await QRCode.toDataURL(url);
  
      // 🗄️ Asset DB storage
      let asset;
      if (isFirstEvent) {
        asset = await Assets.create({
         // assetId: txResult.tokenId,
          topicId,
          metadata,
          creatorId: req.creator.id,
          creatorDID: req.creator.did,
          accountId: req.creator.accountId,
          publicKey: req.creator.publicKey,
          createdAt: new Date(),
        });
      } else {
        asset = await Assets.findOne({ topicId });
        if (!asset) {
          return res.status(404).json({ success: false, error: "Asset not found for this topic" });
        }
      }
  
      // 🗄️ Event DB storage
      const newEvent = await Events.create({
        eventId: uuidv4(),
        //assetId: asset.assetId,
        topicId: asset.topicId,
        creatorId: req.creator.id,
        creatorDID: req.creator.did,
        accountId: req.creator.accountId,
        publicKey: req.creator.publicKey,
        eventType: isFirstEvent ? EventType.CREATED : EventType.CUSTOM,
        payload: metadata,
        cids: [],
        createdAt: new Date(),
        latestCreatedAt: Date.now(),
      });
  
      asset.latestEventId = newEvent.eventId;
      await asset.save();
  
      // ✉️ If recipient provided, add message to their account
    if (metadata?.recipient) {
    const contact = await Contacts.findOne({
      ownerAccountId: req.creator.accountId,         // 🔑 check by Hedera accountId of sender
      "info.displayName": metadata.recipient         // match the recipient's display name
    });
    console.log("contact:", contact)
  
    if (contact) {
      await Messages.create({
        senderAccountId: req.creator.accountId,      // sender Hedera accountId
        recipientAccountId: contact.contactAccountId, // recipient Hedera accountId
        topicId,
        content: metadata?.message || metadata,
        createdAt: new Date(),
        read: false,
        status: "DELIVERED"
      });
    }
  }
  
  
      // ✅ Response
      res.json({
        success: true,
        transaction: txResult,
        topicId,
        url,
        qrCode: qrCodeBase64,
        event: newEvent,
      });
  
    } catch (err: any) {
      console.error("Error handling transaction:", err);
      res.status(500).json({ success: false, error: err.message || "Unknown error" });
    }
      */
};
/// schedule Topic creation 
export const prepareNonScheduleTopicTransaction = async (req, res) => {
    try {
        const { userPublicKey, userAccountId } = req.body;
        // 🔐 Ensure user is logged in
        if (!req.creator) {
            return res.status(401).json({
                success: false,
                error: "Unauthorized: login required",
            });
        }
        console.log("Logged-in creator:", req.creator);
        // 🔐 Ensure keys match the logged-in creator
        /*  if (
           req.creator.publicKey !== userPublicKey ||
           req.creator.accountId !== userAccountId
         ) {
           return res.status(403).json({
             success: false,
             error: "Forbidden: provided accountId/publicKey do not match logged-in creator",
           });
         } */
        if (!userPublicKey || !userAccountId) {
            return res.status(400).json({
                success: false,
                error: "userPublicKey and userAccountId are required",
            });
        }
        console.log("Preparing topic transaction for:", userAccountId, userPublicKey);
        // Build the topic transaction
        const txBytes = await buildTopicCreateTransaction(userPublicKey, userAccountId);
        console.log("Built topic create transaction bytes", txBytes);
        return res.json({
            success: true,
            txBytes: Buffer.from(txBytes).toString("base64"),
            creatorId: req.creator.id, // 👈 link to logged-in creator
        });
    }
    catch (err) {
        console.error("Error preparing topic transaction:", err);
        return res.status(500).json({
            success: false,
            error: err.message || "Unknown error",
        });
    }
};
/* import { verifyPublishedMessage } from "../mirrorVerifier"; */ // custom fn (Mirror Node polling)
/*
comback to this
function generateBatchNumber(productName) {
  const prefix = productName.slice(0, 4).toUpperCase(); // e.g. PARA
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${y}${m}${d}-${random}`;
}
 */
export const handleCreateAsset = async (req, res) => {
    try {
        const { metadata } = req.body; // 
        if (!req.creator) {
            return res.status(401).json({ success: false, error: "Unauthorized: login required" });
        }
        if (!req.creator?.accountId) {
            return res.status(401).json({ success: false, error: "you must have created hedera account to create events" });
        }
        if (!metadata || Object.keys(metadata).length === 0) {
            return res.status(400).json({ success: false, error: "Metadata is required" });
        }
        let topicId;
        let isFirstEvent = false;
        let topicData = null;
        // ✅ Check if this asset already has a topic
        if (metadata.assetTopicId) {
            topicId = metadata.assetTopicId;
            console.log("Using existing topic:", topicId);
        }
        else {
            const newTopic = await createAssetTopic(metadata.message || "Asset created");
            if (!newTopic.topicId)
                throw new Error("Failed to create Hedera topic");
            topicId = newTopic.topicId.toString();
            topicData = newTopic.txResponse;
            isFirstEvent = true;
        }
        // ✅ Compute message hash for Hedera verification
        const messageHash = sha256hex(metadata);
        const proofMessage = {
            hash: messageHash,
            version: 1,
        };
        // ✅ Send to Hedera Consensus Service
        const msg = await sendEventToAsset({
            message: JSON.stringify(proofMessage),
            topicId,
        });
        if (msg.status !== "SUCCESS") {
            return res.status(500).json({ success: false, error: "Failed to send proof to Hedera topic" });
        }
        // ✅ Try immediate consensus lookup
        const immediateConsensus = await tryImmediateConsensusCheck(msg.transactionId);
        // ✅ Generate asset QR Code for scanning
        const url = `https://yourdomain.com/asset/${topicId}`;
        const qrCodeBase64 = await QRCode.toDataURL(url);
        // 🗄️ Create or update Asset record
        let asset;
        if (isFirstEvent) {
            asset = await Assets.create({
                topicId,
                creatorId: req.creator.id,
                creatorDID: metadata?.creatorDID,
                accountId: req.creator.accountId,
                publicKey: metadata.publicKey,
                createdAt: new Date(),
                topicData,
                qrCode: qrCodeBase64,
            });
        }
        else {
            asset = await Assets.findOne({ topicId });
            if (!asset) {
                return res.status(404).json({ success: false, error: "Asset not found for this topic" });
            }
        }
        // 🗄️ Create new Event document (✅ matches your EventSchema)
        const newEvent = await Events.create({
            eventId: uuidv4(),
            topicId: topicId,
            creatorId: req.creator.id,
            creatorDID: metadata?.creatorDID,
            accountId: metadata.accountId,
            publicKey: metadata.publicKey,
            visibility: metadata.visibility,
            eventType: isFirstEvent ? EventType.CREATED : EventType.CUSTOM,
            payload: metadata, // ✅ all frontend fields stored here
            cids: [], // ✅ optional; can be filled later if you store IPFS hashes
            createdAt: new Date(),
            latestCreatedAt: Date.now(),
            messageHash,
            msgTransactionHash: msg.transactionHash,
            msgTransactionId: msg.transactionId,
            consensusTimestamp: immediateConsensus || null, // ✅ directly aligns with schema
            verified: !!immediateConsensus,
        });
        // ✅ Link latest event to the asset
        asset.latestEventId = newEvent.eventId;
        await asset.save();
        ////   sending rumor to the database
        if (metadata.action?.toUpperCase() === "RUMOR") {
            const defendantIdentifier = metadata.receiverIdentifier;
            if (!defendantIdentifier) {
                return res.status(401).json({
                    success: false,
                    error: "RUMOR action missing defendant identifier",
                });
            }
            else {
                // Find defendant business record
                const defendantBusiness = await Businesses.findOne({
                    $or: [
                        { name: defendantIdentifier },
                        { accountId: defendantIdentifier },
                    ],
                });
                if (!defendantBusiness?.issuerDID) {
                    return res.status(401).json({
                        success: false,
                        error: `${defendantIdentifier} is not valid for RUMOR, only interact with valid registered businesses`,
                    });
                }
                else {
                    const rumor = await Rumors.create({
                        gossiperDID: req.creator?.creatorDID,
                        gossiperAccountId: req.creator.accountId,
                        defendantDID: defendantBusiness.orgDID,
                        defendantAccountId: defendantBusiness.accountId,
                        defendantIssuerDID: defendantBusiness.issuerDID,
                        metadata,
                        status: "RUMOR",
                        traceId: newEvent.traceId, // Link to event
                    });
                    console.log("✅ Rumor stored:", rumor);
                }
            }
        }
        // ✉️ Handle optional peer message (receiverIdentifier)
        if (metadata.receiverIdentifier) {
            const contact = await Contacts.findOne({
                ownerAccountId: req.creator.accountId,
                "info.displayName": metadata.receiverIdentifier,
            });
            if (contact) {
                await Messages.create({
                    senderAccountId: req.creator.accountId,
                    recipientAccountId: contact.contactAccountId,
                    topicId,
                    content: metadata.message,
                    createdAt: new Date(),
                    read: false,
                    status: "DELIVERED",
                });
            }
        }
        // ✅ Response
        return res.json({
            success: true,
            topicId,
            url,
            qrCode: qrCodeBase64,
            event: {
                ...newEvent.toObject(), // convert Mongoose doc to plain JSON
                traceId: newEvent.traceId, // ensure traceId is included explicitly
            },
            asset,
        });
    }
    catch (err) {
        console.error("❌ Error in handleCreateAsset:", err);
        res.status(500).json({ success: false, error: err.message || "Unknown error" });
    }
};
/*
if (metadata?.action === "complaint") {
  await Complaints.create({
    complaintId: newEvent.eventId, // or uuidv4(), but eventId is cleaner
    traceId: newEvent.traceId,     // ✅ same trace id as event
    topicId,
    complainantDID: metadata.creatorDID,
    complainantAccountId: metadata.accountId,
    defendantDID: metadata.defendantDID,
    defendantAccountId: metadata.defendantAccountId,
    message: metadata.message,
    metadata,
    images: metadata.images || [],
    status: "PENDING",
    createdAt: new Date(),
  });
}

*/
/**
 * Get all events for the logged-in user
 */
export const getUserEvents = async (req, res) => {
    try {
        if (!req.creator) {
            return res.status(401).json({
                success: false,
                error: "Unauthorized: login required",
            });
        }
        const userId = req.creator.id; // from JWT / session
        const accountId = req.creator.accountId; // Hedera account
        // Find all events where the user is involved
        const events = await Events.find({
            $or: [{ creatorId: userId }, { accountId }],
        })
            .sort({ createdAt: -1 })
            .lean();
        res.status(200).json({
            success: true,
            count: events.length,
            events,
        });
    }
    catch (err) {
        console.error("❌ Failed to fetch user events:", err);
        res.status(500).json({
            success: false,
            error: err.message || "Internal server error",
        });
    }
};
export const getUserAssets = async (req, res) => {
    try {
        if (!req.creator) {
            return res.status(401).json({
                success: false,
                error: "Unauthorized: login required",
            });
        }
        const userId = req.creator.id; // from JWT / session
        const accountId = req.creator.accountId; // Hedera account
        // Find all assets where the user is involved
        const assets = await Assets.find({
            $or: [{ creatorId: userId }, { accountId }],
        })
            .sort({ createdAt: -1 })
            .lean();
        res.status(200).json({
            success: true,
            count: assets.length,
            assets,
        });
    }
    catch (err) {
        console.error("❌ Failed to fetch user assets:", err);
        res.status(500).json({
            success: false,
            error: err.message || "Internal server error",
        });
    }
};
// 
/**
 * Shared helper: fetch Hedera messages and compare with DB events
 */
// schedule transation getting stored 
{ /*

export const handleScheduledTopicInit = async (req: Request, res: Response) => {
  try {
    const { counterpartyPublicKey, metadata } = req.body;

    if (!counterpartyPublicKey) {
      return res.status(400).json({ success: false, error: "counterpartyPublicKey is required" });
    }

    // Call the pure function
    const result = await createScheduledTopic(counterpartyPublicKey )

    if (!result.success) {
      return res.status(500).json(result);
    }

    // Store metadata + schedule info in DB
    //await db.scheduledTopics.insert({
      scheduleId: result.scheduleId!,
      counterpartyPublicKey,
      metadata,
      status: "pending",
      topicId: null,
    });

    res.json({
      success: true,
      scheduleId: result.scheduleId,
      status: "pending",
    });
  } catch (err: any) {
    console.error("handleScheduledTopicInit error:", err);
    res.status(500).json({ success: false, error: err.message || "Unknown error" });
  }
};
 */
}
// check schedule transaction status
/* export const checkScheduledTransactionStatus = async (req: Request, res: Response) => {
  try {
    const { scheduleId } = req.params;
    if (!scheduleId) {
      return res.status(400).json({ success: false, error: "scheduleId is required" });
    }
    const scheduleInfo = await checkScheduledStatus(scheduleId)
    res.json(scheduleInfo);
  } catch (err: any) {
    console.error("Error checking schedule status:", err);
    res.status(500).json({ success: false, error: err.message || "Unknown error" });
}
} */
///
//# sourceMappingURL=contoller.js.map