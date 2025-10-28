import type { AuthRequest } from "../auth/auth.js";
import type { Request, Response } from "express";
import { verifyToken } from "../auth/control.js";
import { hashData } from "../../utils/utils.js";
import { createAccount } from "../../sdk/index.js";
import { generateToken, registerCreator, verifyHederaSignature } from "../../utils/userFlow/creatorFlow.js";
import Creators from "../../database/userschema.js";


export const addNewAccountToCreator = async (req: AuthRequest, res: Response) => {
  try {
    console.log("started")
    const { publicKey, token, info } = req.body;

    if (!req.creator) return res.status(401).json({ error: "Unauthorized" });
    if (!publicKey) return res.status(400).json({ error: "publicKey is required" });
    // phone check
    let phoneHash: string | undefined;
    if (token) {
      const phone = verifyToken(token);
      if (!phone) return res.status(400).json({ error: "Invalid or expired token" });
      phoneHash = hashData(phone);
    }

    // Create Hedera account
    const account = await createAccount(publicKey);
    const accountId = account.accountId?.toString();
    console.log("accountId1:",accountId)
    if (!accountId) return res.status(500).json({ error: "Failed to create Hedera account" });

    // Register creator wallet
    const result = await registerCreator({
      creatorId: req.creator.id,
      accountId,
      publicKey,
      ...(phoneHash ? { phoneHash } : {}),
      info,
    });

    if (!result.success) return res.status(500).json(result);

    // 👉 issue new token with accountId now included
    const newToken = generateToken({
      _id: req.creator.id,
      role: req.creator.role,
      accountId, // newly created Hedera account
    });
    console.log("Successfully added new account to creator:", result.creator);

    res.status(200).json({ success: true, data: result.creator, token: newToken });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};




export const addExistingCreator = async (req: AuthRequest, res: Response) => {
  try {
    const { accountId, publicKey, signature, challenge, info } = req.body;

    if (!accountId || !publicKey || !signature || !challenge) {
      return res.status(400).json({ error: "accountId, publicKey, signature, challenge are required" });
    }

    if (!req.creator) {
      return res.status(401).json({ error: "Unauthorized: login required" });
    }

    // Verify Hedera signature
    const isValidSig = verifyHederaSignature(publicKey, challenge, signature);
    if (!isValidSig) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    // Ensure account not already linked
    const existing = await Creators.findOne({ accountId });
    if (existing) {
      return res.status(400).json({ error: "This Hedera account is already linked to another user" });
    }

    const result = await registerCreator({
      creatorId: req.creator.id,
      accountId: accountId.toString(),
      publicKey,
      info,
    });

    if (!result.success) return res.status(400).json(result);

    // 👉 issue new token with accountId
    const newToken = generateToken({
      _id: req.creator.id,
      role: req.creator.role,
      accountId: accountId.toString(),
    });

    return res.status(200).json({ success: true, data: result.creator, token: newToken });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

