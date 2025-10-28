import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.DB!
const eventsCollectionName = "events";

async function fixConsensusTimestampIndex() {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 20000,
      socketTimeoutMS: 45000,
    });

    if (!mongoose.connection.db) {
      throw new Error("Database connection not established");
    }

    console.log("✅ Connected to MongoDB");
    const db = mongoose.connection.db;
    const collection = db.collection(eventsCollectionName);

    const indexes = await collection.indexes();
    const hasOldIndex = indexes.some((i) => i.name === "consensusTimestamp_1");

    if (hasOldIndex) {
      console.log("🧹 Dropping old consensusTimestamp index...");
      await collection.dropIndex("consensusTimestamp_1");
    }

    console.log("⚙️ Creating new sparse unique index on consensusTimestamp...");
    await collection.createIndex(
      { consensusTimestamp: 1 },
      { unique: true, sparse: true }
    );

    console.log("✅ Index fix complete! Only non-null consensusTimestamp values are now unique.");
  } catch (err) {
    console.error("❌ Failed to fix index:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected");
  }
}

//fixConsensusTimestampIndex();import mongoose from "mongoose";

const MONGO_URI = process.env.DB!// replace this

async function resetDatabase() {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("❌ Database connection not established (db is undefined)");
    }
    

    // 1️⃣ Drop all collections
    const collections = await db.listCollections().toArray();
    for (const { name } of collections) {
      console.log(`🗑️ Dropping collection: ${name}`);
      await db.dropCollection(name);
    }

    // 2️⃣ Recreate non-unique index on consensusTimestamp
    console.log("🛠️ Recreating non-unique index on consensusTimestamp...");
    const events = db.collection("events");
    await events.createIndex({ consensusTimestamp: 1 }, { unique: false, sparse: true });
    console.log("✅ Non-unique index created on consensusTimestamp");

    console.log("🎉 Database reset complete!");
  } catch (err) {
    console.error("❌ Error while resetting database:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected");
  }
}

resetDatabase();
