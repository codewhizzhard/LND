import mongoose, { Schema, Document } from "mongoose";

export interface IRumor extends Document {
 /*  complaintId: string; */
  gossiperDID?: string;
  gossiperAccountId: string;

  defendantDID: string;
  defendantAccountId: string;
    
  defendantIssuerDID: string;  

  metadata?: Record<string, any>;        

  status: "RUMOR" | "IN_REVIEW" | "RESOLVED" | "REJECTED";
  traceId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const RumorSchema = new Schema<IRumor>(
  {
    /*     complaintId: { type: String, required: true, unique: true }, */

    gossiperDID: { type: String },
    gossiperAccountId: { type: String, required: true },

    defendantDID: { type: String, required: true },
    defendantAccountId: { type: String, required: true },

    defendantIssuerDID: { type: String, required: true },

    metadata: { type: Schema.Types.Mixed, default: {} },

    status: {
      type: String,
      enum: ["RUMOR", "IN_REVIEW", "RESOLVED", "REJECTED"],
      default: "RUMOR",
    },

    traceId: { type: String, required: true },

  },
  { timestamps: true } // auto adds createdAt & updatedAt
);

// Auto-generate traceId if missing

export const Rumors = mongoose.model<IRumor>("Rumors", RumorSchema);
