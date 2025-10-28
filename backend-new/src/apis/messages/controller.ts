import type { Response } from "express";
import type { AuthRequest } from "../auth/auth.js";
import { Messages } from "../../database/messageSchema.js";

/**
 * Get all messages for the logged-in creator
 */
export const getAllMessages = async (req: AuthRequest, res: Response) => {
  try {
    const  accountId  = req.creator?.accountId;

    if (!accountId) {
      return res.status(400).json({ error: "accountId is required in token" });
    }

    // Fetch all messages where the user is sender or recipient
    const messages = await Messages.find({
      $or: [
        { senderAccountId: accountId },
        { recipientAccountId: accountId }
      ]
    })
      .sort({ createdAt: -1 }) // latest first
      .lean();

    return res.json({ success: true, messages });
  } catch (err) {
    console.error("getAllMessages error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
