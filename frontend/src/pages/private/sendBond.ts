// hederaBondHelper.ts

import {
  AccountId,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  Hbar,
  TransactionId,
  TransactionRecordQuery,
} from "@hashgraph/sdk";
import { hashconnect, initHashConnect } from "../../utils/walletconnect/walletConnect"; // adjust import path
import Web3 from "web3";

const web3 = new Web3();

interface BondLockedEventDecoded {
  issuer: string;
  amount: string;
}

const bondLockedEventAbi = {
  name: "BondLocked",
  type: "event",
  inputs: [
    { indexed: true, name: "issuer", type: "address" },
    { indexed: false, name: "amount", type: "uint256" },
  ],
};

export const connectHederaWallet = async (): Promise<string> => {
  await hashconnect.disconnect();
  await initHashConnect();

  return new Promise((resolve, reject) => {
    try {
      hashconnect.pairingEvent.once((pairingData: any) => {
        const connectedAccount = pairingData.accountIds?.[0] ?? null;
        if (!connectedAccount) return reject("Failed to pair account");
        resolve(connectedAccount);
      });
    } catch (err) {
      reject("Wallet connection failed");
    }
  });
};


/**
 * Lock bond on contract
 * @param account wallet account ID
 * @param contractId target contract
 * @param amount HBAR amount to lock
 */
export const lockBondOnContract = async (
  account: string,
  contractId: string,
  amount: number
): Promise<{ transactionId: string; decodedBond?: BondLockedEventDecoded }> => {
  const signer = hashconnect.getSigner(AccountId.fromString(account));

  // 1️⃣ Build contract call
  const tx = await new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(2_000_000)
    .setFunction("lockBond", new ContractFunctionParameters())
    .setPayableAmount(new Hbar(amount))
    .setTransactionMemo("Lock bond as issuer")
    .freezeWithSigner(signer);

  // 2️⃣ Execute
  const txResponse = await tx.executeWithSigner(signer);
  const txIdString = txResponse.transactionId.toString();

  // 3️⃣ Fetch Record
  const record = await new TransactionRecordQuery()
    .setTransactionId(TransactionId.fromString(txIdString))
    .execute(signer.getProvider());

  // 4️⃣ Decode event logs
  let decodedBond: BondLockedEventDecoded | undefined = undefined;
  const logs = record.contractFunctionResult?.logs ?? [];

  for (const rawLog of logs) {
    const logDataHex = "0x" + Buffer.from(rawLog.data).toString("hex");
    const logTopicsHex = (rawLog.topics ?? []).map(
      (t: Uint8Array) => "0x" + Buffer.from(t).toString("hex")
    );

    try {
      const decodedUnknown = web3.eth.abi.decodeLog(
        bondLockedEventAbi.inputs,
        logDataHex,
        logTopicsHex.slice(1)
      );
      decodedBond = decodedUnknown as unknown as BondLockedEventDecoded;
      break;
    } catch {
      // ignore wrong logs
    }
  }

  return { transactionId: txIdString, decodedBond };
};
