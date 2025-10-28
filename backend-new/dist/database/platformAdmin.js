import mongoose, { Schema } from "mongoose";
const PlatformAdminSchema = new Schema({
    name: { type: String, required: true },
    did: { type: String, required: true, unique: true },
    hederaAccountId: { type: String, required: false },
    role: { type: String, default: "platformAdmin" },
});
export const PlatformAdmins = mongoose.model("PlatformAdmin", PlatformAdminSchema);
//# sourceMappingURL=platformAdmin.js.map