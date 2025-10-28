import { Contacts } from "../../database/contactsSchema.js";
import Creators from "../../database/userschema.js";
/**
 * Add a contact for the current user
 */ export const addContact = async (req, res) => {
    try {
        console.log("addContact called:", req.creator);
        const accountId = req.creator?.accountId;
        // safe access
        if (!accountId) {
            return res.status(400).json({ error: "You must create a Hedera account before adding contacts" });
        }
        const { contactAccountId, displayName } = req.body;
        if (!contactAccountId || !displayName) {
            return res.status(400).json({ error: "contactAccountId and displayName are required" });
        }
        if (accountId === contactAccountId) {
            return res.status(400).json({ error: "You cannot add yourself as a contact" });
        }
        const existing = await Contacts.findOne({
            ownerAccountId: accountId,
            contactAccountId,
        });
        if (existing) {
            return res.status(409).json({ error: "Contact already exists" });
        }
        const userExists = await Creators.findOne({ accountId: contactAccountId });
        if (!userExists) {
            return res.status(404).json({ error: "Target user does not exist" });
        }
        const newContact = await Contacts.create({
            ownerAccountId: accountId,
            contactAccountId,
            info: { displayName },
        });
        return res.status(201).json({ success: true, contact: newContact });
    }
    catch (err) {
        console.error("addContact error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};
/**
 * View all contacts for the current user
 */
export const viewAllContacts = async (req, res) => {
    try {
        const accountId = req.creator?.accountId;
        if (!accountId) {
            return res.status(400).json({
                error: "You must create a Hedera account before viewing contacts",
            });
        }
        // 1️⃣ Fetch all contacts owned by this user
        const contacts = await Contacts.find({ ownerAccountId: accountId }).lean();
        if (!contacts.length) {
            return res.json({ success: true, contacts: [] });
        }
        // 2️⃣ For each contact, get the latest data from Creators
        const updatedContacts = await Promise.all(contacts.map(async (contact) => {
            const creator = await Creators.findOne({
                accountId: contact.contactAccountId,
            }).lean();
            // If the contact's user no longer exists
            if (!creator) {
                return {
                    contactAccountId: contact.contactAccountId,
                    contactDisplayName: contact?.info?.displayName, // user’s saved label
                    creatorDisplayName: "User not found",
                    exist: false, // ✅ mark as not existing
                };
            }
            // Merge user’s saved name with the creator’s latest data
            return {
                contactAccountId: creator.accountId,
                contactDisplayName: contact?.info?.displayName, // ✅ user’s saved label
                creatorDisplayName: creator.info?.displayName || "Unnamed user", // ✅ latest name
                did: creator.creatorDID || null,
                exist: true, // ✅ mark as existing
            };
        }));
        // 3️⃣ Return final result
        return res.json({ success: true, contacts: updatedContacts });
    }
    catch (err) {
        console.error("viewAllContacts error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};
//# sourceMappingURL=controller.js.map