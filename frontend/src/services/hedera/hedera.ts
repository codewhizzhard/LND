import { Client, PrivateKey, FileCreateTransaction, Hbar, TransferTransaction, TopicCreateTransaction, TopicMessageSubmitTransaction, TopicMessageQuery, TopicMessage, TopicInfoQuery, AccountCreateTransaction, TopicId } from "@hashgraph/sdk";


// BACKEND TESTNET ACCOUNT PAYS FOR NOW USER'S WILL PAY IN PRODUCTION FOR EVERYTHING EXCEPT REGISTRATION

const OPERATOR_ID = import.meta.env.VITE_OPERATOR_ID!;
const OPERATOR_KEY = import.meta.env.VITE_OPERATOR_KEY!
const TOPIC_ID = import.meta.env.VITE_TOPIC_ID!
const ADMIN_ID = TopicId.fromString(TOPIC_ID);
//console.log(`Using topic ID: ${TOPIC_ID}`)

// Pre-configured client for test network (testnet)
export const client = Client.forTestnet()
const operatorKey = PrivateKey.fromStringECDSA(OPERATOR_KEY);

//Set the operator with the account ID and private key
client.setOperator(OPERATOR_ID, operatorKey);


/*  */
export async function createAccountOnHedera(privateKeyHex: string, accountType: "EDSCA" | "ED255") {
    let newPrivateKey
    let newPublicKey

    let transaction;
    if (accountType === "EDSCA") {
        // create edsca account
        newPrivateKey = PrivateKey.fromStringECDSA(privateKeyHex);
        newPublicKey = newPrivateKey.publicKey
        transaction = new AccountCreateTransaction()
        // DO NOT set an alias with your key if you plan to update/rotate keys in the future, Use .setKeyWithoutAlias instead 
        .setKeyWithoutAlias(newPublicKey)
    } else if (accountType === "ED255") {
        newPrivateKey = PrivateKey.generateED25519();
        newPublicKey = newPrivateKey.publicKey
        transaction = new AccountCreateTransaction()
        .setKeyWithoutAlias(newPublicKey)
    }


    const txResponse = await transaction!.execute(client);

    //Request the receipt of the transaction
    const receipt = await txResponse.getReceipt(client);

    //Get the account ID
    const newAccountId = receipt.accountId;
    console.log(typeof +newAccountId!)
    //console.log("The new account ID is " +newAccountId);
     if (!newAccountId) {
         return {success: false, error: "Failed to create a transaction"}
        
    } 
    return {success: true, accountId: +newAccountId, publicKey: newPublicKey}

    // create auto account creation for transactions too

}