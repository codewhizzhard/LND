/* import { useState } from "react";
import { initHashConnect, hashconnect } from "@/utils/walletconnect/walletConnect";
import {
  ContractExecuteTransaction,
  ContractFunctionParameters,
  Hbar,
  TransactionRecord,
  TransactionRecordQuery,
  TransactionId,
  AccountId,
} from "@hashgraph/sdk";
import Web3 from "web3";
import { client } from "@/services/hedera/hedera";
import { toast } from "sonner";

interface AccountPairing {
  accountIds: string[];
  network: string;
}

// ABI for decoding BondLocked event
const bondLockedEventAbi = {
  name: "BondLocked",
  type: "event",
  inputs: [
    { indexed: true, name: "issuer", type: "address" },
    { indexed: false, name: "amount", type: "uint256" },
  ],
};

export default function HederaWalletConnect() {
  const [account, setAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bondInfo, setBondInfo] = useState<{ issuer: string; amount: string } | null>(null);

  const contractId = "0.0.7110461"; // ← set to your deployed IssuerBondManager contract ID
  const web3 = new Web3();

  // Connect HashPack Wallet
  const connectWallet = async () => {
    try {
      setLoading(true);
      await hashconnect.disconnect()

      await initHashConnect();

      // listen for pairing (HashConnect docs recommend registering events before init)
        hashconnect.pairingEvent.once((pairingData: AccountPairing) => {
        const connectedAccount = pairingData.accountIds?.[0] ?? null;
        console.log("conn:", connectedAccount)
        setAccount(connectedAccount);
      });
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  };

  // Build, send to HashPack for signing+execution, then query record and decode logs
    const sendBond = async () => {
  if (!account) {
    setError("Please connect your wallet first");
    return;
  }

  try {
    setSending(true);
    setError(null);
    setBondInfo(null);

    const amountToSend = 2; // HBAR to lock

    // 1️⃣ Get signer from HashConnect
    const signer = hashconnect.getSigner(AccountId.fromString(account));

    // 2️⃣ Build contract transaction
    const tx = await new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(2000000)
      .setFunction("lockBond", new ContractFunctionParameters())
      .setPayableAmount(new Hbar(amountToSend))
      .setTransactionMemo("Lock bond as issuer")
      .freezeWithSigner(signer);

    // 3️⃣ Execute with signer (wallet signs + executes)
    const txResponse = await tx.executeWithSigner(signer);

    console.log("📦 Execute Response:", txResponse);

    // 4️⃣ Get receipt
    const receipt = await txResponse.getReceiptWithSigner(signer);
    console.log("🧾 Receipt:", receipt);

    const txIdString = txResponse.transactionId.toString();

    // 5️⃣ Query record to decode logs
    const record = await new TransactionRecordQuery()
      .setTransactionId(TransactionId.fromString(txIdString))
      .execute(client);

    console.log("✅ Transaction record:", record);

    // 6️⃣ Decode BondLocked event from logs
    interface BondLockedEventDecoded {
      issuer: string;
      amount: string;
    }

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

        const decoded = decodedUnknown as unknown as BondLockedEventDecoded;

        console.log("✅ BondLocked event decoded:", decoded);

        setBondInfo({
          issuer: decoded.issuer,
          amount: web3.utils.fromWei(decoded.amount, "ether"),
        });

        break;
      } catch {
        // ignore wrong logs
      }
    }
    return {txIdString}

    toast.success(`✅ Bond of ${amountToSend} HBAR locked successfully! TX: ${txIdString}`);
  } catch (err: any) {
    console.error("❌ Contract call failed:", err);
    setError(err?.message ?? "Failed to lock bond");
  } finally {
    setSending(false);
  }
}; 

  return (
    <div className="flex flex-col items-center gap-4 mt-10">
      <button
        onClick={connectWallet}
        disabled={loading}
        className={`px-4 py-2 rounded-xl text-white ${loading ? "bg-gray-500" : "bg-purple-600 hover:bg-purple-700"}`}
      >
        {loading ? "Connecting..." : "Connect HashPack Wallet"}
      </button>

      {account && (
        <div className="flex flex-col items-center">
          <p className="text-green-500 mt-2">Connected: {account}</p>
          <button
            onClick={sendBond}
            disabled={sending}
            className={`mt-4 px-4 py-2 rounded-xl text-white ${sending ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {sending ? "Sending Bond..." : "Send 1 HBAR to Bond"}
          </button>
        </div>
      )}

      {bondInfo && (
        <div className="mt-4 p-4 border rounded-lg bg-green-50">
          <p>✅ Bond Locked!</p>
          <p>Issuer: {bondInfo.issuer}</p>
          <p>Amount: {bondInfo.amount} HBAR</p>
        </div>
      )}

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
 */

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { initHashConnect, hashconnect } from "@/utils/walletconnect/walletConnect";
import {
  ContractExecuteTransaction,
  ContractFunctionParameters,
  Hbar,
  TransactionRecordQuery,
  TransactionId,
  AccountId,
} from "@hashgraph/sdk";
import Web3 from "web3";
import { client } from "@/services/hedera/hedera";
import { toast } from "sonner";
import sdk from "../../sdk";

interface AccountPairing {
  accountIds: string[];
  network: string;
}

const bondLockedEventAbi = {
  name: "BondLocked",
  type: "event",
  inputs: [
    { indexed: true, name: "issuer", type: "address" },
    { indexed: false, name: "amount", type: "uint256" },
  ],
};

interface BondDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (txId: string) => void; // parent can receive the TX ID after success
}

export default function BondDialog({ open, onOpenChange, onSuccess }: BondDialogProps) {
  const [account, setAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [savingTx, setSavingTx] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bondInfo, setBondInfo] = useState<{ issuer: string; amount: string } | null>(null);

  const contractId = "0.0.7110461";
  const web3 = new Web3();

  const connectWallet = async () => {
    try {
      setLoading(true);
      setError(null);
      setBondInfo(null);

      await hashconnect.disconnect();
      await initHashConnect();

      hashconnect.pairingEvent.once((pairingData: AccountPairing) => {
        const connectedAccount = pairingData.accountIds?.[0] ?? null;
        setAccount(connectedAccount);
      });
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  };

/*   const saveTxIdToBackend = async (txId: string) => {
    try {
      setSavingTx(true);
      toast(`💾 Saving transaction...`);
      const res = await sdk.orgSaveTransactionId(txId);
      if (res.success) {
        toast.success("✅ Transaction saved! Wait a little for profile update.");
      } else {
        toast.error(res.error || "Failed to save transaction ID");
      }
    } catch (err: any) {
      console.error("Error saving transaction ID:", err);
      toast.error(err?.message || "Failed to save transaction ID");
    } finally {
      setSavingTx(false);
    }
  }; */
const sendBond = async () => {
  if (!account) {
    setError("Please connect your wallet first");
    return;
  }

  try {
    setSending(true);
    setError(null);
    setBondInfo(null);

    const amountToSend = 2;
    toast(`💸 Sending ${amountToSend} HBAR to contract...`);

    const signer = hashconnect.getSigner(AccountId.fromString(account));

    const tx = await new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(2_000_000)
      .setFunction("lockBond", new ContractFunctionParameters())
      .setPayableAmount(new Hbar(amountToSend))
      .setTransactionMemo("Lock bond as issuer")
      .freezeWithSigner(signer);

    const txResponse = await tx.executeWithSigner(signer);
    const txIdString = txResponse.transactionId.toString();

    // Get record and decode logs
    const record = await new TransactionRecordQuery()
      .setTransactionId(TransactionId.fromString(txIdString))
      .execute(client);

    const logs = record.contractFunctionResult?.logs ?? [];
    for (const rawLog of logs) {
      const logDataHex = "0x" + Buffer.from(rawLog.data).toString("hex");
      const logTopicsHex = (rawLog.topics ?? []).map(
        (t: Uint8Array) => "0x" + Buffer.from(t).toString("hex")
      );

      try {
        const decoded = web3.eth.abi.decodeLog(
          bondLockedEventAbi.inputs,
          logDataHex,
          logTopicsHex.slice(1)
        ) as unknown as { issuer: string; amount: string };

        setBondInfo({
          issuer: decoded.issuer,
          amount: web3.utils.fromWei(decoded.amount, "ether"),
        });

        toast.success(`✅ Bond of ${amountToSend} HBAR locked! TX: ${txIdString}`);

        // Immediately save transaction ID to backend
        toast(`💾 Saving transaction...`);
        const res = await sdk.orgSaveTransactionId(txIdString);
        if (res.success) {
          toast.success(res.data?.message || "✅ Transaction saved! Wait a little for profile update.");
        } else {
          toast.error(res.error || "❌ Failed to save transaction ID");
        }

        onSuccess?.(txIdString); // notify parent
        break;
      } catch {}
    }
  } catch (err: any) {
    console.error(err);
    setError(err?.message ?? "Failed to lock bond");
  } finally {
    setSending(false);
  }
};



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Lock Issuer Bond</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {!account && (
            <button
              onClick={connectWallet}
              disabled={loading}
              className={`px-5 py-3 rounded-xl w-full text-white font-medium ${
                loading ? "bg-gray-500" : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {loading ? "Connecting..." : "Connect HashPack Wallet"}
            </button>
          )}

          {account && !bondInfo && (
            <div className="flex flex-col items-center w-full">
              <p className="text-green-500 text-sm mt-1">Connected: {account}</p>

              <button
                onClick={sendBond}
                disabled={sending || savingTx}
                className={`mt-4 px-5 py-3 w-full rounded-xl text-white font-medium ${
                  sending || savingTx ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {sending ? "Sending Bond..." : savingTx ? "Saving TX..." : "Send 2 HBAR to Bond"}
              </button>
            </div>
          )}

          {bondInfo && (
            <div className="mt-3 p-4 border rounded-lg bg-green-50 w-full text-center">
              <p className="font-semibold text-green-700">✅ Bond Locked!</p>
              <p>Issuer: {bondInfo.issuer}</p>
              <p>Amount: {bondInfo.amount} HBAR</p>
            </div>
          )}

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}