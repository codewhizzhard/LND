import cron from "node-cron";
import { registerIssuer } from "../../apis/orgVerification/controller.js";
import { TransactionRecords } from "../../database/issuerTransactionId.js"; 

let isRunning = false;

export const startTransactionMonitor = () => {
  // Run every 30 seconds
  cron.schedule("*/30 * * * * *", async () => {
    if (isRunning) {
      console.log("⚠️ Transaction monitor already running, skipping this tick...");
      return;
    }

    isRunning = true;
    console.log("⏳ Running transaction monitor...");

    try {
      // 🔍 Find all unchecked transactions
      const pendingRecords = await TransactionRecords.find({ checked: false });

      for (const record of pendingRecords) {
        console.log("🕵️‍♀️ Found pending transaction:", record.transactionId);
        const { transactionId, accountDID, accountId } = record;

        // 1️⃣ Verify necessary info exists
        if (!accountDID || !accountId) {
          console.warn("⚠️ Missing identifiers in record:", record);
          continue;
        }

        // 2️⃣ Call registerIssuer
        const result = await registerIssuer(accountDID, accountId);

        // 3️⃣ Update transaction status
        if (result.success) {
          record.checked = true;
          await record.save();
          console.log("✅ Transaction processed successfully:", transactionId);
        } else {
          console.error("❌ Error processing transaction:", result.error);
        }
      }
    } catch (err) {
      console.error("💥 Transaction monitor error:", err);
    } finally {
      isRunning = false;
    }
  });
};
