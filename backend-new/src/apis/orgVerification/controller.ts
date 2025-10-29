
import { Request, Response } from "express";
import { Issuers } from "../../database/issuer.js"; // assuming you have a type that extends Request with creator info
import { AuthRequest } from "../auth/auth.js";
import { generateEdscaAccount, issueVcJwtForBusiness, mintAndTransferNFT, submitMessageToPrivateTopic } from "../../sdk/index.js";
import Businesses from "../../database/businessSchema.js";
import { Workers } from "../../database/workerSchema.js";
import sha256hex, { logVerificationAction, LogVerificationActionParams } from "../../utils/utils.js";
import { AccountId, PublicKey } from "@hashgraph/sdk";
import { TransactionRecords } from "../../database/issuerTransactionId.js";
import Creators from "../../database/userschema.js";
import { Rumors } from "../../database/rumor.js";
import { TrustRequests } from "../../database/trustRequest.js";

/* this should be automatic and it is after the user has created their bond */
export const registerIssuer = async (creatorDID: string, creatorAccountId: string) => {
  try {
    const issuerDID = process.env.PLATFORM_ISSUER_DID
    if (!creatorDID || !creatorAccountId || !issuerDID) {
      return {
        success: false,
        error: "Missing required identifiers: creatorDID, accountId, or issuerDID",
      };
    }
    // this should for when they try to split from org to issuer
   /*  const { name, sector, ...extraData } = req.body;
    if (!name || !sector) {
      return res.status(400).json({ success: false, error: "name and sector are required" });
    } */

    // 1️⃣ Check if issuer already exists
    const existingIssuer = await Issuers.findOne({ creatorDID });
    if (!existingIssuer) {
      return { success: false, error: "Issuer not registered" };
    }

    // 2️⃣ Publish verification record to HCS
    const message = {
      type: "ISSUER_VERIFICATION",
      verifiedBy: issuerDID,
      verifiedDid: creatorDID,
      name: existingIssuer?.data?.name,
      sector: existingIssuer?.data?.sector,
      timestamp: new Date().toISOString(),
    };
    const messageHash = sha256hex(message);
    const topicData = await submitMessageToPrivateTopic(messageHash);

    if (topicData.status !== "SUCCESS") {
      return { success: false, error: "Failed to create Hedera message" };
    }
    const convertedCreatorAccountId = AccountId.fromString(creatorAccountId)
    // 3️⃣ Mint verification NFT: looking at adding it to the issuer data
    const nftResult = await mintAndTransferNFT(convertedCreatorAccountId);

    // 4️⃣ Log verification action
    const logData: LogVerificationActionParams = {
      targetType: "issuer",
      targetDid: creatorDID,
      action: "verify",
      performedBy: issuerDID,
      messageHash,
      topicData
      /* : {
        transactionHash: topicData.transactionHash,
        transactionId: topicData.transactionId,
        status: topicData.status,
      }, */
    };
    const verification = await logVerificationAction(logData);
    if (verification.success === false) return {success: false, error: verification}

    // 5️⃣ update issuer in DB with ACTIVE status and EDSCA info
    
    existingIssuer.status = "ACTIVE"
    existingIssuer.issuerDID = issuerDID
    await existingIssuer.save()

    return {
      success: true,
      issuer: existingIssuer,
      hcs: topicData,
      nft: nftResult,
      verification,
    };
  } catch (err: any) {
    console.error("registerIssuer error:", err);
    return { success: false, error: err.message || "Internal server error" };
  }
};

//now business adding workers to their org

export const addWorker = async (req: AuthRequest, res: Response) => {
  try {
    console.log("addWorker called:", req.creator);

    const callerDID = req.creator?.creatorDID;
    const callerAccountId = req.creator?.accountId;

    if (!callerDID || !callerAccountId) {
      return res.status(400).json({
        success: false,
        error: "Missing required credentials (DID or accountId)",
      });
    }

    const { orgDID, name, accountDID, role } = req.body;

    // Validate payload
    if (!orgDID || !name || !accountDID || !role) {
      return res.status(400).json({
        success: false,
        error: "orgDID, name, accountDID and role are required",
      });
    }

    // Confirm org exists and is active
    const business = await Businesses.findOne({orgDID, status: "ACTIVE"});
    if (!business) {
      return res.status(404).json({
        success: false,
        error: "Business not found or not active",
      });
    }

    // Validate that accountDID belongs to a registered user
    const validUser = await Creators.findOne({ accountDID });
    if (!validUser) {
      return res.status(404).json({
        success: false,
        error: "This DID does not belong to a registered user",
      });
    }

    // Check if this user is already registered as a worker/admin anywhere in this org
    const existingWorker = await Workers.findOne({ accountDID, orgDID });
    if (existingWorker) {
      return res.status(409).json({
        success: false,
        error: `This user is already added as a ${existingWorker.role} in this organization`,
      });
    }

    // Determine caller's role in this org
    let callerRole: "orgAdmin" | "admin" | "unauthorized" = "unauthorized";

    // If caller created the org
    if (callerDID === business.orgDID && callerAccountId === business.accountId) {
      callerRole = "orgAdmin";
    } else {
      // Check if caller is an admin in the org
      const admin = await Workers.findOne({
        accountDID: callerDID,
        orgDID,
        role: "admin",
        status: "ACTIVE",
      });

      if (admin) callerRole = "admin";
    }

    if (callerRole === "unauthorized") {
      return res.status(403).json({
        success: false,
        error: "You do not have permission to add members to this organization",
      });
    }

    // Permission rule: Only OrgOwner can add Admin
    if (callerRole === "admin" && role === "admin") {
      return res.status(403).json({
        success: false,
        error: "Only the organization owner can add other admins",
      });
    }

    // Create the worker/admin
    const newWorker = await Workers.create({
      name,
      accountDID,
      orgDID,
      role: role === "admin" && callerRole === "orgAdmin" ? "admin" : "worker",
      addedBy: callerDID,
      status: "ACTIVE",
    });

    return res.status(201).json({
      success: true,
      message: `Successfully added ${newWorker.role}`,
      worker: newWorker,
    });

  } catch (err: any) {
    console.error("addWorker error:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      details: err.message || err,
    });
  }
};

export const getWorkers = async (req: AuthRequest, res: Response) => {
  try {
    const callerDID = req.creator?.creatorDID;
    const callerAccountId = req.creator?.accountId;

    if (!callerDID || !callerAccountId) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required credentials (DID or accountId)" });
    }

    const { orgDID } = req.params;

    if (!orgDID) {
      return res.status(400).json({ success: false, error: "orgDID is required" });
    }

    // Check if business exists
    const business = await Businesses.findOne({ orgDID });
    if (!business) {
      return res.status(404).json({ success: false, error: "Business not found" });
    }

    // Determine role of the caller
    let callerRole: "orgAdmin" | "admin" | "unauthorized" = "unauthorized";

    // OrgAdmin check
    if (callerDID === business.orgDID && callerAccountId === business.accountId) {
      callerRole = "orgAdmin";
    } else {
      // Check if caller is an admin in this business
      const admin = await Workers.findOne({
        accountDID: callerDID,
        orgDID,
        role: "admin",
        status: "ACTIVE",
      });

      if (admin) callerRole = "admin";
    }

    if (callerRole === "unauthorized") {
      return res.status(403).json({ success: false, error: "Unauthorized to view workers" });
    }

    // Build query based on role
    let query: any = { orgDID };

    if (callerRole === "admin") {
      // Admins can only see workers, not other admins
      query.role = "worker";
    }

    const workers = await Workers.find(query).sort({ createdAt: -1 });

    // Return counts
    const total = workers.length;
    const active = workers.filter((w) => w.status === "ACTIVE").length;
    const revoked = workers.filter((w) => w.status === "REVOKED").length;

    return res.status(200).json({
      success: true,
      total,
      active,
      revoked,
      workers,
    });
  } catch (err: any) {
    console.error("getWorkers error:", err);
    return res
      .status(500)
      .json({success: false,  error: "Internal server error", details: err.message || err });
  }
};



export const removeWorker = async (req: AuthRequest, res: Response) => {
  try {
    console.log("removeWorker called:", req.creator);

    const callerDID = req.creator?.creatorDID;
    const callerAccountId = req.creator?.accountId;

    if (!callerDID || !callerAccountId) {
      return res.status(400).json({
        success: false,
        error: "Missing required credentials (DID or accountId)"
      });
    }

    const { orgDID, workerAccountDID } = req.query;

    if (!orgDID || !workerAccountDID) {
      return res.status(400).json({
        success: false,
        error: "orgDID and workerAccountDID are required as query parameters"
      });
    }

    // Check if business exists
    const business = await Businesses.findOne({ accountDID: orgDID, status: "ACTIVE" });
    if (!business) {
      return res.status(404).json({
        success: false,
        error: "Business not found or not active"
      });
    }

    // Check if worker exists
    const worker = await Workers.findOne({ accountDID: workerAccountDID, orgDID });
    if (!worker) {
      return res.status(404).json({
        success: false,
        error: "Worker not found in this organization"
      });
    }

    // Determine caller role
    let callerRole: "orgAdmin" | "admin" | "unauthorized" = "unauthorized";

    // OrgAdmin (business creator)
    if (callerDID === business.orgDID && callerAccountId === business.accountId) {
      callerRole = "orgAdmin";
    } else {
      // Check if caller is an admin
      const admin = await Workers.findOne({
        accountDID: callerDID,
        orgDID,
        role: "admin",
        status: "ACTIVE"
      });
      if (admin) callerRole = "admin";
    }

    if (callerRole === "unauthorized") {
      return res.status(403).json({
        success: false,
        error: "You do not have permission to remove members from this organization"
      });
    }

    // Admins cannot remove other admins
    if (callerRole === "admin" && worker.role === "admin") {
      return res.status(403).json({
        success: false,
        error: "Only the OrgAdmin can remove other admins"
      });
    }

    // Perform remove
    await Workers.deleteOne({ _id: worker._id });

    return res.status(200).json({
      success: true,
      message: `Successfully removed ${worker.role}`
    });

  } catch (err: any) {
    console.error("removeWorker error:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      details: err.message || err
    });
  }
};


//////



export const registerIssuerEcdsaAccount = async (req: AuthRequest, res: Response) => {
  try {
    const callerDID = req.creator?.creatorDID;
    if (!callerDID) {
      return res.status(400).json({success: false, error: "Missing creatorDID" });
    }

    const { publicKey, encryptedPrivateKey, salt, iv } = req.body;
    if (!publicKey || !encryptedPrivateKey || !salt || !iv) {
      return res.status(400).json({success: false, error: "Missing encryption data" });
    }

    // Check issuer
    const issuer = await Issuers.findOne({ creatorDID: callerDID });
    if (!issuer) {
      return res.status(403).json({success: false, error: "Unauthorized: only verified issuers can create ECDSA accounts" });
    }

    // Setup client
    const accountData = await generateEdscaAccount(publicKey)
    const edscaAccountId = accountData.accountId

    if (!edscaAccountId) {
      return res.status(500).json({success: false, error: "Failed to create Hedera account" });
    }
    const purePublicKey = PublicKey.fromStringECDSA(publicKey);
    const evmAddress = `0x${purePublicKey.toEvmAddress()}`;
    
    if(!evmAddress || evmAddress === null) return res.status(500).json({success: false, error: "account not fully created" });

    // Store encrypted data
    issuer.edscaAccountId = edscaAccountId;
    issuer.edscaPublickey = publicKey;
    issuer.edscaEncryptedPrivateKey = encryptedPrivateKey;
    issuer.edscaSalt = salt;
    issuer.edscaIv = iv;
    issuer.evmAddress = evmAddress && evmAddress.toString()
    await issuer.save();

    return res.status(201).json({
      success: true,
      message: "ECDSA account successfully registered",
      accountId: edscaAccountId,
    });
  } catch (err: unknown) {
    console.error("Error registering ECDSA account:", err);
    if (err instanceof Error) {
      return res.status(500).json({success: false, error: err.message });
    }
    return res.status(500).json({success: false, error: "Internal server error" });
  }
};

// retrieve
export const retrieveIssuerEcdsaAccount = async (req: AuthRequest, res: Response) => {
  try {
    const callerDID = req.creator?.creatorDID;

    if (!callerDID) {
      return res.status(400).json({success: false, error: "Missing creatorDID" });
    }

    // Ensure issuer exists
    const issuer = await Issuers.findOne({ creatorDID: callerDID });
    if (!issuer) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized: only verified issuers can retrieve ECDSA account data",
      });
    }

    // Check if ECDSA account is set
    if (!issuer.edscaAccountId || !issuer.edscaPublickey) {
      return res.status(404).json({success: false, error: "ECDSA account not found for this issuer" });
    }

    // Return **only safe, non-sensitive** fields
    return res.status(200).json({
      success: true,
      edscaAccountId: issuer.edscaAccountId,
      edscaPublickey: issuer.edscaPublickey,
      edscaEncryptedPrivateKey: issuer.edscaEncryptedPrivateKey,
      edscaSalt: issuer.edscaSalt,
      edscaIv: issuer.edscaIv,
      status: issuer.status,
      issuerDID: issuer.issuerDID,
      createdAt: issuer.createdAt,
    });
  } catch (err: unknown) {
    console.error("Error retrieving ECDSA account:", err);
    if (err instanceof Error) {
      return res.status(500).json({success: false, error: err.message });
    }
    return res.status(500).json({success: false, error: "Internal server error" });
  }
};

// get all businesses for an issuer
export const getBusinessesByIssuer = async (req: AuthRequest, res: Response) => {
  try {
    const callerDID = req.creator?.creatorDID;

    if (!callerDID) {
      return res.status(400).json({
        success: false,
        error: "Missing creatorDID",
      });
    }

    // ✅ Ensure issuer exists
    const issuer = await Issuers.findOne({ creatorDID: callerDID });
    if (!issuer) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized: only verified issuers can retrieve their businesses.",
      });
    }

    // ✅ Fetch all businesses already linked to this issuer
    const businesses = await Businesses.find({ issuerDID: issuer.creatorDID });

    // ✅ Fetch pending trust requests sent to this issuer
    const pendingRequests = await TrustRequests.find({
      issuerDID: issuer.creatorDID,
      status: "PENDING",
    });

    // ✅ Format pending requests (so issuers can see who requested trust)
    const pendingBusinesses = pendingRequests.map((req) => ({
      businessName: req.businessName,
      businessAccountId: req.businessAccountId,
      issuerDID: req.issuerDID,
      status: req.status,
      createdAt: req.createdAt,
    }));

    // ✅ Categorize businesses
    const activeBusinesses = businesses.filter((b) => b.status === "ACTIVE");
    const revokedBusinesses = businesses.filter((b) => b.status === "REVOKED");

    // ✅ Prepare summary
    const result = {
      issuer: {
        name: issuer?.data?.name || "Unknown Issuer",
        sector: issuer?.data?.sector || "Unknown Sector",
        issuerDID: issuer.creatorDID,
      },
      stats: {
        total: businesses.length,
        active: activeBusinesses.length,
        revoked: revokedBusinesses.length,
        pending: pendingBusinesses.length,
      },
      businesses: {
        active: activeBusinesses,
        revoked: revokedBusinesses,
        pending: pendingBusinesses,
      },
    };

    return res.status(200).json({
      success: true,
      business: result,
    });
  } catch (error: any) {
    console.error("Error fetching businesses by issuer:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch issuer businesses.",
    });
  }
};


/// get business details

export const getBusiness = async (req: AuthRequest, res: Response) => {
  try {
    const creatorDID = req.creator?.creatorDID;
    const accountId = req.creator?.accountId
    if (!creatorDID && !accountId) {
      return res.status(400).json({ error: "Missing logged in credentials" });
    }

    // Role can come from query param
    const role = req.query.role as "worker" | "business";
    if (!role) {
      return res.status(400).json({success: false, error: "Role query parameter is required" });
    }

    let business;

    if (role === "business") {
      // OrgAdmin: query business directly
          business = await Businesses.findOne({
        $or: [
          { orgDID: creatorDID },
          { accountId }
        ]
      });
      if (!business) {
        return res.status(404).json({success: false, error: "Business not found or inactive" });
      }
    } else if (role === "worker") {
      // Worker/Admin: fetch worker record first
      const worker = await Workers.findOne({ accountDID: creatorDID, status: "ACTIVE" });
      if (!worker) {
        return res.status(403).json({success: false, error: "You do not have access to any business" });
      }

      business = await Businesses.findOne({ orgDID: worker.orgDID, status: "ACTIVE" });
      if (!business) {
        return res.status(404).json({success: false, error: "Business not found or inactive" });
      }
    } else {
      return res.status(403).json({success: false, error: "Unauthorized role" });
    }

    return res.status(200).json({success: true, business });
  } catch (err: any) {
    console.error("getBusiness error:", err);
    return res.status(500).json({success: false, error: "Internal server error", details: err.message || err });
  }
};

// get the particular issuer

export const getIssuer = async (req: AuthRequest, res: Response) => {
  try {
    const creatorDID = req.creator?.creatorDID;

    if (!creatorDID) {
      return res.status(400).json({
        success: false,
        error: "Missing creator DID",
      });
    }

    // Role should come from query param
   /*  const role = req.query.role as "issuer";
    if (role !== "issuer") {
      return res.status(400).json({
        success: false,
        error: "Invalid role for this endpoint",
      });
    } */

    // Find the issuer by creatorDID
    const issuer = await Issuers.findOne({ creatorDID /* , status: "ACTIVE" */ });
 

    if (!issuer) {
      return res.status(404).json({
        success: false,
        error: "Issuer not found",
      });
    }

    return res.status(200).json({
      success: true,
      issuer: {
        issuerDID: issuer.issuerDID,
        accountId: issuer.accountId,
        data: issuer,
        status: issuer.status,
        createdAt: issuer.createdAt,
      },
    });
  } catch (err: any) {
    console.error("getIssuer error:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      details: err.message || err,
    });
  }
};


// save transactionId



export const saveTransactionId = async (req: AuthRequest, res: Response) => {
  try {
    const creatorDID = req.creator?.creatorDID;
    const callerAccountId = req.creator?.accountId;

    if (!creatorDID) {
      return res.status(400).json({
        success: false,
        error: "Missing creator DID",
      });
    }

    // Validate issuer
    const issuer = await Issuers.findOne({ creatorDID });
    if (!issuer) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized. DID does not belong to an issuer.",
      });
    }

    const { transactionId } = req.body;
    if (!transactionId) {
      return res.status(400).json({
        success: false,
        error: "Missing transactionId",
      });
    }

    // ✅ Safely convert to required format
    const [accountId, timestamp] = transactionId.split("@");

    if (!accountId || !timestamp || !timestamp.includes(".")) {
      return res.status(400).json({
        success: false,
        error: "Invalid transactionId format",
      });
    }

    const [seconds, nanos] = timestamp.split(".");
    const formattedTxId = `${accountId}-${seconds}-${nanos}`;

    // Check if already saved
    const exists = await TransactionRecords.findOne({ transactionId: formattedTxId });
    if (exists) {
      return res.status(409).json({
        success: false,
        error: "Transaction ID already saved",
      });
    }

    // Save new record
    const record = await TransactionRecords.create({
      transactionId: formattedTxId,
      accountDID: creatorDID,
      accountId: callerAccountId,
      checked: true,
    });
    const result = await registerIssuer(creatorDID, callerAccountId);

    return res.status(201).json({
      success: true,
      message: "Transaction ID saved successfully",
      data: record,
    });

  } catch (error) {
    console.error("Error saving transaction ID:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};


/// add pending business or issuer


export const addCreatorType = async (req: AuthRequest, res: Response) => {
  try {
    const creatorDID = req.creator?.creatorDID;
    const accountId = req.creator?.accountId;

    if (!creatorDID && !accountId) {
      return res.status(400).json({
        success: false,
        error: "Unauthorized: Missing creator credentials",
      });
    }

    const { sector, type } = req.body;

    if (!sector || !type) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: sector and type",
      });
    }

    if (!["issuer", "business"].includes(type)) {
      return res.status(400).json({
        success: false,
        error: "Invalid type. Must be issuer or business",
      });
    }

    const creator = await Creators.findOne({ $or: [{creatorDID}, {accountId}]  });
    if (!creator) {
      return res.status(404).json({
        success: false,
        error: "Creator not found",
      });
    }

    if (creator.info?.org?.type) {
      return res.status(400).json({
        success: false,
        error: `Type already assigned as ${creator.info.org.type}`,
      });
    }

    // --- Create BUSINESS --- //here
    if (type === "business") {
      const exists = await Businesses.findOne({ $or: [{orgDID: creatorDID}, {accountId}]  });
      if (exists) {
        return res.status(400).json({
          success: false,
          error: "Business already exists for this creator",
        });
      }

     await Businesses.create({
      ...(creatorDID && { orgDID: creatorDID }), // only include if present
      accountId,
      status: "PENDING",
      sector,
      name: creator.info.org?.name,
      createdAt: new Date(),
    });
  }

    // --- Create ISSUER ---
    if (type === "issuer") {
      const exists = await Issuers.findOne({ creatorDID });
      if (exists) {
        return res.status(400).json({
          success: false,
          error: "Issuer already exists for this creator",
        });
      }
      await Issuers.create({
        role: "issuer",
        creatorDID,
        accountId,
        status: "PENDING",
        data: { sector, name: creator.info.org?.name },
        createdAt: new Date(),
      });
    }

    // ---- Update Creator with Org Data ----
    creator.info = {
      ...creator.info,
      org: {
        name: creator.info.org?.name,           // preserve name if you have it
        sector: sector || "",
        type: type || "",
      },
    };

    await creator.save();

    return res.json({
      success: true,
      message: `${type.toUpperCase()} successfully registered`,
      data: creator,
    });

  } catch (error: any) {
    console.error("addCreatorType Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
};



export const getBusinessRumors = async (req: AuthRequest, res: Response) => {
  try {
    const creatorDID = req.creator?.creatorDID;
    const accountId = req.creator?.accountId;

    if (!creatorDID && !accountId) {
      return res.status(400).json({
        success: false,
        error: "Unauthorized: You must be logged in to view rumors.",
      });
    }

    const { identifier } = req.body; // can be business name or accountId

    if (!identifier) {
      return res.status(400).json({
        success: false,
        error: "Missing required field: identifier (business name or accountId)",
      });
    }

    // 🔍 Find the business by name or accountId
    const business = await Businesses.findOne({
      $or: [{ name: identifier }, { accountId: identifier }, {orgDID: identifier}],
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        error: `No business found matching ${identifier}`,
      });
    }

    // 🧠 Find all rumors where this business is the defendant
    const rumors = await Rumors.find({
      defendantAccountId: business.accountId,
    }).sort({ createdAt: -1 });

    if (rumors.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No rumors found for this business",
        data: {
          business: {
            name: business.name,
            orgDID: business.orgDID,
            issuerDID: business.issuerDID,
            accountId: business.accountId,
            sector: business.sector,
          },
          stats: {
            total: 0,
            rumor: 0,
            in_review: 0,
            resolved: 0,
            rejected: 0,
          },
          rumors: [],
        },
      });
    }

    // 🧾 Count rumors by status
    const rumorStats = {
      total: rumors.length,
      rumor: rumors.filter((r) => r.status === "RUMOR").length,
      in_review: rumors.filter((r) => r.status === "IN_REVIEW").length,
      resolved: rumors.filter((r) => r.status === "RESOLVED").length,
      rejected: rumors.filter((r) => r.status === "REJECTED").length,
    };

    // 🧩 Add more structured data for the response
    const detailedRumors = rumors.map((r) => ({
      gossiper: {
        did: r.gossiperDID,
        accountId: r.gossiperAccountId,
      },
      defendant: {
        did: r.defendantDID,
        accountId: r.defendantAccountId,
        issuerDID: r.defendantIssuerDID,
      },
      status: r.status,
      traceId: r.traceId,
      metadata: r.metadata,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    const result = {
      business: {
        name: business.name,
        orgDID: business.orgDID,
        issuerDID: business.issuerDID,
        accountId: business.accountId,
        sector: business.sector,
      },
      stats: rumorStats,
      rumors: detailedRumors,
    };

    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    console.error("Error fetching business rumors:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch rumors for business",
    });
  }
};


/// get issuers for businesses


export const getIssuers = async (req: AuthRequest, res: Response) => {
  try {
    const creatorDID = req.creator?.creatorDID;
    const accountId = req.creator?.accountId;

    // 🔒 Ensure user is logged in /* !creatorDID ||  */!
    if (!creatorDID && !accountId) {
      return res.status(400).json({
        success: false,
        error:
          "Unauthorized: You must be logged in.",
      });
    }

    // 🔍 Verify the requester is a registered business
    const business = await Businesses.findOne({
      $or: [{ orgDID: creatorDID }, { accountId }],
    });

    if (!business) {
      return res.status(403).json({
        success: false,
        error: "Access denied: Only registered businesses can view issuers.",
      });
    }

    // ✅ Extract query filters (sector, name) from query, not body
    const { sector, name } = req.query;

    const query: any = {};
    if (sector) query["data.sector"] = sector;
    if (name)
      query["data.name"] = { $regex: new RegExp(name as string, "i") }; // case-insensitive match

    // 🧠 Fetch issuers, newest first
    const issuers = await Issuers.find(query).sort({ createdAt: -1 });

    if (issuers.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No issuers found matching your criteria.",
        data: [],
      });
    }

    // 🧩 Structure response
    const formattedIssuers = issuers.map((i) => ({
      name: i.data?.name || "Unknown",
      sector: i.data?.sector || "Unknown",
      issuerDID: i.issuerDID,
      accountId: i.accountId,
      status: i.status,
      createdAt: i.createdAt,
    }));

    return res.status(200).json({
      success: true,
      total: formattedIssuers.length,
      data: formattedIssuers,
    });
  } catch (error: any) {
    console.error("Error fetching issuers:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch issuers.",
    });
  }
};

// send trust request to issuer

export const requestIssuerTrust = async (req: AuthRequest, res: Response) => {
  try {
    const creatorDID = req.creator?.creatorDID;
    const accountId = req.creator?.accountId;

    // ✅ Ensure the user is logged in
    if (!creatorDID && !accountId) {
      return res.status(400).json({
        success: false,
        error: "Unauthorized: You must be logged in to request issuer trust.",
      });
    }

    const { issuerDID } = req.body;

    if (!issuerDID) {
      return res.status(400).json({
        success: false,
        error: "Missing required field: issuerDID",
      });
    }

    // ✅ Verify requester is a registered business
    const business = await Businesses.findOne({
      $or: [{ orgDID: creatorDID }, { accountId }],
    });

    if (!business) {
      return res.status(403).json({
        success: false,
        error: "Access denied: Only registered businesses can request trust.",
      });
    }

    // ✅ Verify issuer exists
    const issuer = await Issuers.findOne({ creatorDID: issuerDID });
    if (!issuer) {
      return res.status(404).json({
        success: false,
        error: "Issuer not found.",
      });
    }

    // ✅ Prevent duplicate requests
    const existingRequest = await TrustRequests.findOne({
      businessAccountId: accountId,
      issuerDID: issuer.creatorDID,
      status: { $in: ["PENDING", "APPROVED"] },
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        error: "A trust request already exists or has been approved with this issuer.",
      });
    }

    // ✅ Create new trust request
    const trustRequest = await TrustRequests.create({
      businessName: business.name,
      businessAccountId: business.accountId,
      issuerDID: issuer.issuerDID,
      //issuerAccountId: issuer.accountId,
      //sector: business.sector,
      status: "PENDING",
      createdAt: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: `Trust request sent to issuer: ${issuer.issuerDID}.`,
      data: trustRequest,
    });
  } catch (error: any) {
    console.error("Error requesting issuer trust:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to request trust from issuer.",
    });
  }
};

/// issuer issue trust


export const accessIssuerTrust = async (req: AuthRequest, res: Response) => {
  try {
    const issuerDID = req.creator?.creatorDID;
    const issuerAccountId = req.creator?.accountId;

    // ✅ Ensure issuer is logged in
    if (!issuerDID || !issuerAccountId) {
      return res.status(400).json({
        success: false,
        error: "Unauthorized: You must be logged in as an issuer to accept trust.",
      });
    }

    const { userAccountId } = req.body;

    if (!userAccountId) {
      return res.status(400).json({
        success: false,
        error: "Missing required field: userAccountId",
      });
    }

    // ✅ Ensure issuer exists
    const issuer = await Issuers.findOne({ creatorDID: issuerDID });
    if (!issuer) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized: only verified issuers can accept trust.",
      });
    }

    // ✅ Find the corresponding pending trust request
    const trustRequest = await TrustRequests.findOne({
      issuerDID,
      businessAccountId: userAccountId,
      status: "PENDING",
    });

    if (!trustRequest) {
      return res.status(404).json({
        success: false,
        error: "No pending trust request found for this business.",
      });
    }

    // ✅ Find the business linked to that accountId
    const business = await Businesses.findOne({ accountId: userAccountId });
    if (!business) {
      return res.status(404).json({
        success: false,
        error: "Business not found for this accountId.",
      });
    }

    if (!business.orgDID) {
      return res.status(404).json({
        success: false,
        error: "Business must have a registered DID to access trust.",
      });
    }

    // ✅ Create VC JWT for this business
    const { vcJwt, messageHash: vcHash } = await issueVcJwtForBusiness(issuerDID, business);

    // ✅ Attach VC document to business (you can modify this schema as needed)
    business.vcDocument = {
      jwt: vcJwt,
      issuedAt: new Date(),
      anchoredHash: vcHash,
      issuerDID,           // who signed / verified this VC
      subjectDID: business.orgDID,
    };
    await business.save();

    business.status = "ACTIVE";
    business.issuerDID = issuerDID;
    await business.save();

    // ✅ Update trust request and business status
    trustRequest.status = "APPROVED";
    await trustRequest.save();

    

    // ✅ Log business verification to Hedera
   /*  const message = {
      type: "BUSINESS_VERIFICATION",
      verifiedBy: issuerDID,
      verifiedDid: business.orgDID,
      businessName: business.name,
      sector: business.sector,
      timestamp: new Date().toISOString(),
    }; */

    const topicData = await submitMessageToPrivateTopic(vcHash);

    if (topicData.status !== "SUCCESS") {
      return res.status(500).json({
        success: false,
        error: "Failed to publish business verification message to Hedera.",
      });
    }

    // ✅ Log the verification in DB
    const logData: LogVerificationActionParams = {
      targetType: "business",
      targetDid: business.orgDID,
      action: "verify",
      performedBy: issuerDID,
      messageHash: vcHash,
      topicData,
    };

    const verificationLog = await logVerificationAction(logData);

    return res.status(200).json({
      success: true,
      message: `Business (${business.name}) is now verified under issuer: ${issuerDID}.`,
      data: {
        business,
        trustRequest,
        verificationLog,
        vcJwt, // expose issued credential for debugging or use
      },
    });
  } catch (error: any) {
    console.error("Error accepting issuer trust:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to accept issuer trust.",
    });
  }
};




/* 
import { TransactionRecord } from "../models/TransactionRecord";

export const processTransaction = async (transactionId: string) => {
  // Check if we have processed this transaction before
  let record = await TransactionRecord.findOne({ transactionId });

  if (record && record.checked) {
    console.log("⚠️ Transaction already processed. Skipping:", transactionId);
    return false;
  }

  if (!record) {
    // Create new record
    record = await TransactionRecord.create({ transactionId });
  }

  // ✅ Do your business logic here...
  console.log("🔍 Processing new transaction:", transactionId);

  // Mark as processed
  record.checked = true;
  await record.save();

  return true;
};


*/