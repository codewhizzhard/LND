import crypto from "crypto";
import dotenv from "dotenv";
import { TopicId } from "@hashgraph/sdk";
import { VerificationRecords } from "../database/verificationSchema.js";
dotenv.config();
const secretSalt = process.env.SECRETSALT;
const TOPIC_ID = process.env.TOPIC_ID;
const ADMIN_ID = TopicId.fromString(TOPIC_ID);
export function createDID(accountId, network = "testnet") {
    return `did:hedera:${network}:${accountId}`;
}
export function generateAssetId(creatorId, metadata, useSalt = false) {
    let base = `${creatorId}-${JSON.stringify(metadata)}`;
    if (useSalt)
        base += `-${crypto.randomUUID()}`;
    return crypto.createHash("sha256").update(base).digest("hex");
}
export function generateEventId() {
    return crypto.randomUUID();
}
// Generate a random 6-digit PIN
export function generatePin() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
export function hashData(data) {
    const formattedData = typeof data === "string" ? data : JSON.stringify(data);
    return crypto.createHash("sha256").update(`${secretSalt}-${formattedData}`).digest("hex");
}
export const logVerificationAction = async ({ targetType, targetDid, action, performedBy, topicData, messageHash, additionalMessage, }) => {
    try {
        // Compose the message to submit
        /* const messageContent = JSON.stringify({
          targetType,
          targetDid,
          action,
          performedBy,
          timestamp: new Date().toISOString(),
          info: additionalMessage || null,
        }); */
        // Submit to Hedera Topic
        // Save record to MongoDB
        const record = await VerificationRecords.create({
            targetType,
            targetDid,
            action,
            performedBy,
            messageHash,
            hcsTransactionId: topicData.transactionId,
            hcsHash: topicData.transactionHash,
            timestamp: new Date(),
        });
        return {
            success: true,
            record,
            transaction: {
                transactionHash: topicData.transactionHash,
                transactionId: topicData.transactionId,
            },
        };
    }
    catch (err) {
        console.error("logVerificationAction error:", err);
        return {
            success: false,
            error: err.message || "Failed to log verification action",
        };
    }
};
/* hashing data */
export default function sha256hex(obj) {
    const canonical = JSON.stringify(obj); // TODO: implement canonical ordering
    return crypto.createHash("sha256").update(canonical).digest("hex");
}
/*
export async function registerUser(data: DataType) {
    
        let userPin = data.pin;
        if (userPin && userPin.length !== 6) {
          return {success: false, error: "pin must be 6 characters long" };
        }
        if (!userPin) {
          userPin = generatePin();
          console.log("Generated PIN:", userPin);
        }
    
        const phoneHash = hashData(data.phone);
        const pinHash = await bcrypt.hash(userPin, 10);

        // verify phone number hasn't being registered before
        let creator: ICreator | null
        creator = await Creators.findOne({phoneHash})
        if (creator) {
            return {success: false, error: "creator not found"}
        }
       
       // getting details from hedera
        let accountId
        const accountResult = await createAccount(data.alias);
        if (!accountResult.success || !accountResult.accountId) {
        return { success: false, error: accountResult.error || "Account creation failed" };
        }

        accountId = accountResult.accountId; // now guaranteed to be a number
        const creatorDID = createDID(accountId);
        const creatorTopicId = await createAssetTopic(`CREATOR_${accountId}`)

        const creatorData: Creator = {
          creatorId: data.creatorId || crypto.randomUUID(), // permanent
          creatorTopicId: (creatorTopicId!).toString(), // permanent
          generalTopicId: ADMIN_ID.toString(), // permanent
          accountId, // permanent
          creatorDID, // permanent
          phoneHash, // can change
          pinHash, // can change
          walletId: data.walletId, // can change
          info: data.info, // changeable,
          eventType: "REGISTER_CREATOR",
          createdAt: new Date(), // permanent
        };

        const creatorPublicData: CreatorPublic = (({pinHash, info,  ...rest}) => rest)(creatorData)

        // send to nftStorage
        const file = new File(
            [JSON.stringify(creatorPublicData, null, 2)],
            "creatorData.json",
            { type: "application/json" }
        );

        const uploadedDataCID = await uploadToNFTStorage(file)

        const cid: CidsEvent = {
            eventType: "CREATE",
            cid: uploadedDataCID,
            createdAt: new Date().toISOString()
        }

        // send event to the project Topic
        const adminEvent: Event = {
                creatorId: creatorData.creatorId,
                cids: [cid],
                createdAt: creatorData.createdAt.toISOString(),
                creatorDID: creatorData.creatorDID,
                phoneHashes: {
                    newPhoneHash: creatorData.phoneHash
                }
            };

            const adminEventStatus = await sendEventToAsset({
                ...adminEvent,
            });
            
            if (adminEventStatus !== "SUCCESS") {
                return { success: false, error: "Failed to send admin event to Hedera network" };
            }
        // send an event to hedera creatorTopic
        const eventData: Event = {
            creatorId: creatorData.creatorId,
            createdAt: creatorData.createdAt.toISOString(),
            creatorTopicId: TopicId.fromString(creatorData.creatorTopicId),
            generalTopicId: TopicId.fromString(creatorData.generalTopicId),
            creatorDID: creatorData.creatorDID,
            cids: [cid],
            phoneHashes: {
                newPhoneHash: creatorData.phoneHash
            },
            /// info: creatorData.info so other devs can add the knind of data they wish to add
        }

        //send event to hedera topic for creator registration
        const eventStatus = await sendEventToAsset(eventData)
        console.log("eventtsatus:", eventStatus)
    
        if (eventStatus !== "SUCCESS") {
            return { success: false, error: "Failed to send event to Hedera network" };
        }
       
        // save to db...
        creator = await Creators.create(creatorData)
        //const metaData = hashData(creator);
        return {
          success: true,
          creatorId: data.creatorId || crypto.randomUUID(),
          creatorTopicId: (creatorTopicId!).toString(),
          generalTopicId: ADMIN_ID.toString(),
          accountId,
          creatorDID,
          phoneHash,
          //pinHash,
          walletId: data.walletId,
          info: data.info,
          eventType: "REGISTER_CREATOR",
          createdAt: creator.createdAt
        };
}
 */
// loginUser
/*
export async function loginUser(phone: string, pin: string) {

    const phoneHash = hashData(phone);
    
        // fetch creator by phoneHash from db
        const creator: Creator | null = await Creators.findOne({phoneHash})
        if (!creator) return {success: false, error: `user not found`}
    
        const isPinValid = await bcrypt.compare(pin, creator.pinHash);
        const isPhoneValid = creator.phoneHash === phoneHash;
    
        if (!isPhoneValid || !isPinValid) {
          return { success: false, error: "Invalid phone number or PIN" };
        }
          // Step 3: Optional Hedera verification (slow, underground)
          // we use the hashed phone to check hedera if it exist, if yes then keep creator alive
         try {
            const isOnHedera = await verifyUserOnHedera(creator.creatorTopicId);
            if (!isOnHedera) return { success: false, error: "User not verified on Hedera" };
        } catch (err) {
            console.error("Hedera verification error:", err);
            return { success: false, error: "Hedera verification failed" };
        }

    
        // receive whatsapp messages
        // remove the pinhash
        //return { success: true, message: "Authentication successful", data: creator };
} */ 
//# sourceMappingURL=utils.js.map