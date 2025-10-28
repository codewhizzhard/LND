import bcrypt from "bcrypt";
import { hashData } from "../../utils/utils.js";
import jwt from "jsonwebtoken";
import twilio from "twilio";
import Creators from "../../database/userschema.js";
import { v4 as uuidv4 } from "uuid";
import { getProfileData, inviteUser } from "../../sdk/index.js";
import Businesses from "../../database/businessSchema.js";
//import { processMessage } from "../../test.js";
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
// register user
// 🔑 Signup Controller
export const signup = async (req, res) => {
    try {
        const { role, password, email, displayName, orgName, phoneHash, userType } = req.body;
        // 🔹 Validate required fields
        if (!password || !role || !email) {
            return res.status(400).json({ success: false, error: "Password, role, and email are required" });
        }
        if (role === "user" && !displayName) {
            return res.status(400).json({ success: false, error: "Display name is required for users" });
        }
        if (role === "organization" && !orgName) {
            return res.status(400).json({ success: false, error: "Organization name is required" });
        }
        // 🔹 Check for existing email
        const existingEmail = await Creators.findOne({ "info.email": email });
        if (existingEmail) {
            return res.status(400).json({ success: false, error: "Email already in use" });
        }
        // 🔹 Check for duplicate displayName/orgName
        const existingName = role === "user"
            ? await Creators.findOne({ "info.displayName": displayName })
            : await Creators.findOne({ "info.org.name": orgName });
        if (existingName) {
            return res.status(400).json({ success: false, error: "Account already exists, the name is in use" });
        }
        // 🔹 Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        // 🔹 Attempt Guardian invite (MANDATORY)
        let invited = false;
        try {
            console.log("fff:", userType);
            const type = userType === "issuer" ? "STANDARD_REGISTRY" : "USER";
            console.log("type:", type);
            invited = await inviteUser(email, type);
        }
        catch (err) {
            console.error("❌ Guardian invite failed:", err.message);
            return res.status(500).json({
                success: false,
                error: "Failed to invite user on Guardian",
            });
        }
        if (!invited) {
            console.error(`❌ Guardian invite for ${email} returned false`);
            return res.status(500).json({
                success: false,
                error: "Guardian invite unsuccessful",
            });
        }
        // 🔹 Create and save local user
        const newCreator = new Creators({
            creatorTopicId: "",
            generalTopicId: "",
            accountId: null,
            creatorDID: "",
            passwordHash,
            role,
            info: {
                displayName: role === "user" ? displayName : undefined,
                org: role === "organization" ? { name: orgName } : undefined,
                email,
                phoneHash,
            },
            createdAt: new Date(),
        });
        await newCreator.save();
        return res.json({
            success: true,
            message: "Account created and Guardian invite successful",
            creatorId: newCreator._id,
        });
    }
    catch (err) {
        console.error("❌ Signup error:", err);
        return res.status(500).json({ success: false, error: "Server error" });
    }
};
// 🔐 Login Controller
export const login = async (req, res) => {
    try {
        const { identifier, email, password, role } = req.body;
        // 🛑 Basic input validation
        if (!identifier || !password || !role) {
            return res
                .status(400)
                .json({ success: false, error: "Identifier, password, and role are required" });
        }
        // 🔍 Find user/org by role and identifier
        let creator;
        if (role === "user") {
            creator = await Creators.findOne({ "info.displayName": identifier });
        }
        else if (role === "organization") {
            creator = await Creators.findOne({ "info.org.name": identifier });
        }
        if (!creator) {
            return res.status(400).json({ success: false, error: "Creator not found" });
        }
        // 🔑 Check password validity
        const isMatch = await bcrypt.compare(password, creator.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ success: false, error: "Invalid credentials" });
        }
        // ⚙️ Fetch and sync DID from Guardian if email provided
        if (email) {
            try {
                // Only fetch DID if not already set
                if (!creator.creatorDID) {
                    console.log("Fetching DID from Guardian for:", email);
                    const data = await getProfileData(email, identifier, password);
                    if (data && data.did) {
                        creator.creatorDID = data.did;
                        creator.didDocument = data.didDocument || {};
                        creator.vcDocument = data.VcDocument || {};
                        await creator.save();
                        console.log(`✅ Synced DID for ${creator.info?.email || email}: ${data.did}`);
                        // 🏢 If this creator is an organization, sync DID to its business entry too
                        if (creator.role === "organization" && creator.accountId) {
                            const business = await Businesses.findOne({
                                $or: [
                                    { accountId: creator.accountId },
                                ],
                            });
                            if (business && !business.orgDID) {
                                business.orgDID = data.did;
                                await business.save();
                                console.log(`🏢 Synced DID to business for account: ${creator.accountId}`);
                            }
                        }
                    }
                    else {
                        console.warn("⚠️ No DID data returned from Guardian for:", email);
                    }
                }
                else {
                    console.log("ℹ️ DID already exists, skipping Guardian sync.");
                }
            }
            catch (err) {
                console.warn("⚠️ Failed to fetch DID from Guardian:", err);
            }
        }
        // 🧱 Ensure organization creator data is saved properly (no duplicate create)
        if (creator.role === "organization") {
            // Just ensure the creator has a DID and accountId saved
            if (creator.creatorDID && creator.accountId) {
                creator.orgDID = creator.creatorDID;
                await creator.save(); // ✅ Proper save (not create)
            }
        }
        // 🧱 Build JWT payload
        const payload = {
            id: creator._id,
            role: creator.role,
        };
        if (creator.accountId)
            payload.accountId = creator.accountId.toString();
        if (creator.creatorDID)
            payload.creatorDID = creator.creatorDID;
        // 🔐 Sign and issue JWT
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
        // ✅ Return success response
        return res.json({
            success: true,
            message: "Login successful",
            token,
            creator,
        });
    }
    catch (err) {
        console.error("❌ Login error:", err);
        return res.status(500).json({ success: false, error: "Server error" });
    }
};
const tokenStore = {};
// ---------------------
// Create Token + Link
// ---------------------
export const createWhatsappToken = (from, type, data) => {
    const token = uuidv4();
    tokenStore[token] = {
        phone: from,
        exp: Date.now() + 5 * 60 * 1000,
        type,
        data,
    };
    if (type === "registration") {
        return `https://yourapp.com/self-custodian?token=${token}`;
    }
    return `https://yourapp.com/create-message?token=${token}`;
};
// ---------------------
// Verify Token
// ---------------------
export const verifyToken = (token) => {
    const record = tokenStore[token];
    if (!record || record.exp < Date.now())
        return null;
    return record;
};
// ---------------------
// API: Verify Token
// ---------------------
export const verifyWhatsappToken = (req, res) => {
    const { token } = req.query;
    if (!token || typeof token !== "string") {
        return res.status(400).json({ error: "Invalid link" });
    }
    const record = verifyToken(token);
    if (!record)
        return res.status(400).json({ error: "Expired or invalid token" });
    const phoneHash = hashData(record.phone);
    const response = { phoneHash, type: record.type };
    if (record.type === "transaction") {
        response.messageData = record.data?.messageData;
        response.isScheduled = record.data?.isScheduled || false;
    }
    return res.json(response);
};
// ---------------------
// WhatsApp Webhook
// ---------------------
export const whatsappWebhook = async (req, res) => {
    const from = req.body.From;
    const body = req.body.Body?.trim();
    if (!from || !body)
        return res.send("invalid request");
    if (body.toUpperCase() === "REGISTER") {
        // 🔐 Registration flow
        const link = createWhatsappToken(from, "registration");
        await client.messages.create({
            from: process.env.TWILIO_PHONE_NUMBER,
            to: from,
            body: `🔐 Registration link (valid 5 min): ${link}`,
        });
        return res.send("registration link sent");
    }
    // 📝 Transaction flow
    /* const structured = await processMessage(body);
   */
    /* const link = createWhatsappToken(from, "transaction", {
      messageData: structured,
      isScheduled: body.toLowerCase().startsWith("schedule"),
    });
  
    await client.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: from,
      body: `📑 Review & sign your transaction:\n${link}`,
    });
   */
    return res.send("transaction link sent");
};
/*
const tokenStore: Record<string, { phone: string; exp: number }> = {};

export const whatsappWebhook = async (req: Request, res: Response) => {
  const from = req.body.From; // WhatsApp sender
  const body = req.body.Body?.trim().toUpperCase() || "";

  if (body === "REGISTER") {
    const token = uuidv4();
    tokenStore[token] = { phone: from, exp: Date.now() + 5 * 60 * 1000 };

    const link = `https://yourapp.com/self-custodian?token=${token}`;

    await client.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: from,
      body: `🔐 Secure registration link (valid for 5 min): ${link}\n\nDo not share this link with anyone.`,
    });

    return res.send("registration link sent");
  }

  res.send("unknown command");
};

const verifyToken = (token: string) => {
  const record = tokenStore[token];
  if (!record || record.exp < Date.now()) return null;
  return record.phone;
};

// GET /onboard?token=abc123
export const verifyWhatsappToken = (req: Request, res: Response) => {
  const { token } = req.query;

  if (!token || typeof token !== "string") {
    return res.status(400).json({ error: "Invalid link" });
  }

  const phone = verifyToken(token);
  if (!phone) {
    return res.status(400).json({ error: "Expired or invalid token" });
  }

  const phoneHash = hashData(phone);

  // Just return the phoneHash to the frontend
  return res.json({ phoneHash });
};
 */
// POST /
/*
export const postOnboard = async (req: Request, res: Response) => {
  try {
    const { token, publicKey, info } = req.body;
    const phone = verifyToken(token);
    if (!phone) return res.status(400).json({ error: "invalid token" });

    const phoneHash = hashData(phone);

    // Check if already registered
    const existing = await Creators.findOne({ phoneHash });
    if (existing) {
      return res.status(400).json({ error: "already registered" });
    }

    // Create Hedera account
    const account = await createAccount(publicKey);
    const accountId = account.accountId?.toString();
    if (!accountId) {
      return res.status(500).json({ error: "failed to create Hedera account" });
    }

    // Full registration handles DB saving
    const result = await registerCreator({
      accountId,
      publicKey,
      phoneHash,
      info,
    });

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}; */ 
//# sourceMappingURL=control.js.map