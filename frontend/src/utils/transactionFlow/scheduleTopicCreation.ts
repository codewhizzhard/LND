import { PrivateKey, TopicCreateTransaction,  Client,
  ScheduleSignTransaction,
  ScheduleId,
  AccountId,
  TopicMessageSubmitTransaction,
  TopicId,
  ScheduleCreateTransaction,
  TransactionReceipt, } from "@hashgraph/sdk";

/**
 * Sign a Nonscheduled TopicCreateTransaction that was prepared by backend and make sure user set if scheduled or non schedule
 */
export async function signTopicTransaction(
  txBytesBase64: string,
  userPrivateKey: string
): Promise<string> {
  // Convert back to bytes
  const txBytes = Buffer.from(txBytesBase64, "base64");

  // Reconstruct transaction
  const transaction = TopicCreateTransaction.fromBytes(txBytes);

  // User signs with their private key
  const privateKey = PrivateKey.fromString(userPrivateKey);
  const signedTx = await transaction.sign(privateKey);

  // Return signed transaction bytes as base64 (send back to backend)
  return Buffer.from(signedTx.toBytes()).toString("base64");
}



/* 
import axios from "axios";
import { signTopicTransaction } from "./hederaClient";

async function createTopic(userPublicKey: string, userAccountId: string, userPrivateKey: string) {
  // 1️⃣ Ask backend to prepare the frozen tx
  const { data } = await axios.post("/api/topics/prepare", {
    userPublicKey,
    userAccountId,
  });

  if (!data.success) throw new Error(data.error);

  const txBytesBase64 = data.txBytes;

  // 2️⃣ User signs the transaction locally
  const signedTxBase64 = await signTopicTransaction(txBytesBase64, userPrivateKey);

  // 3️⃣ Send signed tx back to backend for final submission
  const submitRes = await axios.post("/api/topics/submit", {
    signedTxBytes: signedTxBase64,
  });

  return submitRes.data; // should include topicId
}
 */

// sign scheduled topic creation transaction


/// fetch all schedule using the user public key, and check if any are executed or pending signatures


export async function signScheduledTopic(
  scheduleIdStr: string,
  operatorKey: string,   // private key in string form
  operatorId: string     // account id in string form ("0.0.xxxx")
) {
  // Parse Hedera types
  const accountId = AccountId.fromString(operatorId);
  const privateKey = PrivateKey.fromString(operatorKey);
  const scheduleId = ScheduleId.fromString(scheduleIdStr);

  // Create client for operator
  const client = Client.forTestnet().setOperator(accountId, privateKey);

  try {
    // Build sign transaction (signed by operator automatically)
    const signTx = new ScheduleSignTransaction()
      .setScheduleId(scheduleId);

    // Submit
    const signTxResponse = await signTx.execute(client);
    const signReceipt = await signTxResponse.getReceipt(client);

    console.log("✅ Operator signed scheduled tx:", signReceipt.status.toString());

    return {
      success: true,
      status: signReceipt.status.toString(),
    };
  } catch (err: any) {
    console.error("❌ Error signing schedule:", err);
    return {
      success: false,
      error: err.message,
    };
  } finally {
    await client.close();
  }
}


// check scheduled topic creation status
//just call the sdk

// send a non schedule message
export async function createNonScheduleMessageToTopic(
  counterpartyId: string,
  counterpartyKey: string,
  topicId: string,
  message: string | Uint8Array
): Promise<string> {
  // Initialize client
  const client = Client.forTestnet().setOperator(
    AccountId.fromString(counterpartyId),
    PrivateKey.fromString(counterpartyKey)
  );

  try {
    // Build and execute the message submission transaction
    const messageTransaction = new TopicMessageSubmitTransaction()
      .setTopicId(TopicId.fromString(topicId))
      .setMessage(message);

    const txResponse = await messageTransaction.execute(client);
    const receipt = await txResponse.getReceipt(client);

    // Return the transaction status
    return receipt.status.toString();
  } catch (error) {
    console.error("Error submitting non-schedule message to topic:", error);
    throw error;
  } finally {
    // Ensure the client is always closed
    await client.close();
  }
}


/// send a schedule message to topic
export async function createScheduledMessageTransaction(
  counterpartyId: string,
  counterpartyKey: string,
  topicId: string,
  message: string | Uint8Array
): Promise<{ scheduleId: ScheduleId; scheduledTransactionId: string }> {
  const client = Client.forTestnet().setOperator(
    AccountId.fromString(counterpartyId),
    PrivateKey.fromString(counterpartyKey)
  );

  try {
    // Create the inner transaction (the message submission)
    const messageTx = new TopicMessageSubmitTransaction()
      .setTopicId(TopicId.fromString(topicId))
      .setMessage(message);

    // Create the schedule transaction
    const scheduleTx = new ScheduleCreateTransaction().setScheduledTransaction(messageTx);

    // Sign and submit the schedule transaction
    const txResponse = await scheduleTx.execute(client);
    const receipt: TransactionReceipt = await txResponse.getReceipt(client);

    // Get the schedule ID and scheduled transaction ID
    const scheduleId = receipt.scheduleId!;
    const scheduledTransactionId = receipt.scheduledTransactionId!.toString();

    return { scheduleId, scheduledTransactionId };
  } catch (error) {
    console.error("Error creating scheduled message transaction:", error);
    throw error;
  } finally {
    // Ensure client is always closed
    await client.close();
  }
}
