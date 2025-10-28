import { Events, IEvent } from "../../database/eventSchema.js";
import axios from "axios";
import { Request, Response } from "express";
import { AuthRequest } from "../auth/auth.js";

interface HederaEvent {
  consensusTime: string;
  sequence: number;
  message: string;
  runningHash: string;
}

/**
 * Shared helper: fetch Hedera messages and compare with DB events
 */
interface HederaEvent {
  consensusTime: string;
  sequence: number;
  message: string;
  runningHash: string;
}



export const verifyEventsOnHedera = async (req: Request, res: Response) => {
  try {
    const { events } = req.body;

    if (!events || !Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ success: false, message: "No events provided" });
    }

    const topicId = events[0].topicId;
    if (!topicId) {
      return res.status(400).json({ success: false, message: "Missing topicId in events" });
    }

    const mirrorUrl = `https://testnet.mirrornode.hedera.com/api/v1/topics/${topicId}/messages`;
    const response = await axios.get(mirrorUrl);
    const messages = response.data.messages || [];

    console.log(`✅ Fetched ${messages.length} messages from Mirror Node for topic ${topicId}`);

    const hederaEvents: HederaEvent[] = messages.map((msg: any) => ({
      consensusTime: msg.consensus_timestamp,
      sequence: msg.sequence_number,
      message: msg.message,
      runningHash: msg.running_hash,
    }));

    // 🔍 Compare DB events vs Hedera messages
  const verifiedEvents = await Promise.all(
  events.map(async (dbE: IEvent) => {
    let isValid = false;
    let matchedHedera: HederaEvent | null = null;

    for (const he of hederaEvents) {
      try {
        // Decode base64 → utf8 → parse JSON
        const decodedMsg = Buffer.from(he.message, "base64").toString("utf-8");
        const parsed = JSON.parse(decodedMsg);

        // Some apps wrap the actual data inside `message`
        const innerMsg =
          typeof parsed.message === "string"
            ? JSON.parse(parsed.message)
            : parsed.message;

        const hederaHash = innerMsg?.hash;
        const dbHash = dbE.messageHash;
        const heTime = Math.floor(parseFloat(he.consensusTime));
        const dbTime = Math.floor(
          new Date(dbE.consensusTimestamp).getTime() / 1000
        );

        // Compare both hash and timestamp
        if (hederaHash === dbHash && heTime === dbTime) {
          isValid = true;
          matchedHedera = he;

          // ✅ Update event verification status in DB
          await Events.updateOne(
            { _id: dbE._id },
            {
              verified: true,
              consensusTimestamp: he.consensusTime,
            }
          );
          break;
        }
      } catch (err) {
        console.warn("⚠️ Failed to parse Hedera message:", err);
      }
    }

    // ✅ Return sanitized event
    return {
      ...dbE.toObject?.() ?? dbE,
      isValid,
      matchedConsensusTime: matchedHedera?.consensusTime || null,
      // 🔒 Hide actual payload data, but keep key
      payload: { message: "🔒 Payload hidden for privacy" },
    };
  })
);


    const allValid = verifiedEvents.every((e) => e.isValid);

    return res.json({
      success: true,
      source: "hedera",
      data: {
        topicId,
        totalDBEvents: events.length,
        totalHederaEvents: hederaEvents.length,
        allValid,
        verifiedEvents,
        hederaEvents,
      },
    });
  } catch (error: any) {
    console.error("❌ Hedera verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Error verifying events on Hedera",
      error: error.message,
    });
  }
};

/**
 * 1. Verify from Database
 */
export const verifyFromDB = async (req: AuthRequest, res: Response) => {
  try {
    const { topicId } = req.params;
    const requesterAccountId = req?.creator?.accountId;
    const requesterDID = req?.creator?.creatorDID;
    console.log("params:", req.params)
    console.log("creator:", req.creator)

    let events = await Events.find({ topicId });
    if (!events.length) {
      return res.status(404).json({ success: false, message: "No events found for topic" });
    }

    // ✅ Keep only events with consensus timestamp
    events = events.filter((e) => !!e.consensusTimestamp);

    // ✅ Sort by latest
    events.sort((a, b) => Number(b.consensusTimestamp) - Number(a.consensusTimestamp));

    // ✅ Sanitize private events based on ownership
    const sanitizedEvents = events.map((event) => {
      const e = event.toObject();
      const isOwner =
        e.accountId === requesterAccountId || e.creatorDID === requesterDID;

      if (e.visibility === "private" && !isOwner) {
        // Hide sensitive fields for non-owners
        return {
          ...e,
          payload: { message: "🔒 Private message" },
          cids: [],
          verified: false,
        };
      }

      // Owner or public event → show everything
      return e;
    });

    // ✅ Keep same structure in response
    return res.json({
      success: true,
      source: "database",
      data: {
        topicId,
        totalEvents: sanitizedEvents.length,
        latestConsensusTimestamp: sanitizedEvents[0]?.consensusTimestamp || null,
        events: sanitizedEvents,
      },
    });
  } catch (error: any) {
    console.error("DB verification error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/* export const verifyFromDB = async (req: Request, res: Response) => {
  try {
    const { topicId } = req.params;

    let events = await Events.find({ topicId });
    if (!events.length) {
      return res.status(404).json({ success: false, message: "No events found for topic" });
    }

    events = events.filter((e) => !!e.consensusTimestamp);
    events.sort((a, b) => Number(b.consensusTimestamp) - Number(a.consensusTimestamp));

    return res.json({
      success: true,
      source: "database",
      data: {
        topicId,
        totalEvents: events.length,
        latestConsensusTimestamp: events[0]?.consensusTimestamp || null,
        events,
      },
    });
  } catch (error: any) {
    console.error("DB verification error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}; */
/**
 * 2. Verify from Hedera
 *//* 
export const verifyFromHedera = async (req: Request, res: Response) => {
  try {
    const { topicId } = req.params;

    let events = await Events.find({ topicId });
    if (!events.length) {
      return res.status(404).json({ success: false, message: "No events found in DB for topic" });
    }

    events = events.filter((e) => !!e.consensusTimestamp);
    events.sort((a, b) => Number(b.consensusTimestamp) - Number(a.consensusTimestamp));

    const { valid, hederaEvents } = await verifyEventsOnHedera(topicId, events);

    return res.json({
      success: true,
      source: "hedera",
      valid,
      data: {
        topicId,
        totalDbEvents: events.length,
        latestConsensusTimestamp: events[0]?.consensusTimestamp || null,
        dbEvents: events,
        hederaEvents,
      },
    });
  } catch (error: any) {
    console.error("Hedera verification error:", error?.response?.data || error.message);
    return res.status(500).json({ success: false, message: "Hedera verification failed" });
  }
}; */
