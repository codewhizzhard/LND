import mongoose, { Schema } from "mongoose";
const CreatorSchema = new Schema({
    creatorTopicId: { type: String },
    // generalTopicId: { type: String },
    orgDID: { type: String },
    accountId: { type: String },
    creatorDID: { type: String },
    didDocument: {
        type: mongoose.Schema.Types.Mixed, // store full DID JSON document
        default: {},
    },
    vcDocument: {
        type: mongoose.Schema.Types.Mixed, // store full VC JSON (Verifiable Credential)
        default: {},
    },
    documentVerified: {
        type: Boolean,
        default: false
    },
    walletId: { type: String },
    passwordHash: { type: String, required: true },
    vcReferences: { type: [String], default: [] },
    role: {
        type: String,
        enum: ["user", "organization"],
        required: true,
    },
    info: {
        phoneHash: { type: String },
        email: {
            type: String,
            required: true,
            unique: true, // ✅ prevent duplicates
            lowercase: true, // normalize
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Invalid email format"], // basic email pattern
        },
        displayName: { type: String },
        org: {
            name: { type: String },
            sector: { type: String },
            type: {
                type: String,
                enum: ["issuer", "business"],
            },
        },
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
const Creators = mongoose.model("Creators", CreatorSchema);
export default Creators;
//# sourceMappingURL=userschema.js.map