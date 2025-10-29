
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import { connectDB } from "./config/database.js";
import authRouter from "./apis/auth/router.js";
import { authMiddleware } from "./apis/auth/middleware.js";
import contactRouter from "./apis/contact/router.js";
import eventRouter from "./apis/event/router.js";
import accountRouter from "./apis/addAccount/router.js";
import messageRouter from "./apis/messages/router.js";
import verifyRouter from "./apis/verify/router.js";
import { startTransactionMonitor } from "./utils/issuerRecords/recordchecker.js";
import verificationRouter from "./apis/orgVerification/router.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

// Middleware
const allowedOrigins = [
  "http://localhost:5174",
  "https://lnd-frontend.onrender.com"
];

app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin like mobile apps or curl
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = `The CORS policy for this site does not allow access from the specified Origin.`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/auth", authRouter);
app.use("/verify", verifyRouter);
app.use(authMiddleware);
app.use("/contacts", contactRouter);
app.use("/topic", eventRouter);
app.use("/creators", accountRouter);
app.use("/messages", messageRouter);
app.use("/org", verificationRouter);

const startServer = async () => {
  try {
    // 1️⃣ Connect to MongoDB
    await connectDB();
    console.log("✅ Connected to MongoDB");

    // 2️⃣ Start transaction monitor cron
    startTransactionMonitor();
    console.log("⏳ Transaction monitor cron started");

    // 3️⃣ Start Express server
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server startup error:", err);
    process.exit(1); // Exit with failure
  }
};

// Kick off the startup
startServer();

//
 /* 
const uri = process.env.DB as string;

async function deleteAllData() {
  try {
    if (!uri) throw new Error("DB URI not found");

    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established");

    const collections = await db.collections();

    for (const collection of collections) {
      await collection.deleteMany({});
      console.log(`Cleared ${collection.collectionName}`);
    }

    console.log("✅ All data deleted successfully!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error deleting data:", error);
    process.exit(1);
  }
}

deleteAllData(); */






/* app.use((err, req, res, next) => {
  console.error("🔥 Unhandled error:", err);
  res.status(500).json({ success: false, error: "Internal server error" });
}); */