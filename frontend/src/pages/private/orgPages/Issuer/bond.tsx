"use client";

import { forwardRef, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Loader2, Coins, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import axios from "axios";
import { getHederaBalance } from "../../../../utils/utils";
import BondDialog from "../../../public/test";


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




interface IssuerBondDialogProps {
  accountId: string; 
}

const IssuerBondDialog = forwardRef<HTMLDivElement, IssuerBondDialogProps>((props, ref) => {  
  const {accountId} = props
  const [showDialog, setShowDialog] = useState(false);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [bondBalance, setBondBalance] = useState<string | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  const [openBondModal, setOpenBondModal] = useState(false);
  
    


  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setAmount("");
      setLoading(false);
    }
    setShowDialog(open);
  };

  // 🔹 Add Bond to Platform


  // 🔹 Withdraw Bond
  const handleWithdraw = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.post(
        "/api/issuer/withdraw-bond",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(res.data?.message || "✅ Bond withdrawn successfully!");
      refreshBalance(); // Refresh balance
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Withdraw error:", error);
        const axiosError = error as { response?: { data?: { error?: string } } };
        const errMsg =
          axiosError.response?.data?.error ||
          error.message ||
          "Failed to withdraw bond.";
        toast.error(errMsg);
      } else {
        console.error("Unknown error:", error);
        toast.error("An unknown error occurred while withdrawing.");
      }
    } finally {
      setLoading(false);
    }
  };

 

 const refreshBalance = async () => {
  if (!accountId) return; // only run if accountId exists
  setLoadingBalance(true);
  setBalanceError(null);
  try {
    const hbarBalance = await getHederaBalance(accountId);
    setBondBalance(hbarBalance.toFixed(4));
  } catch (err: any) {
    console.error("❌ Failed to refresh balance:", err);
    setBalanceError(err?.message ?? "Unable to refresh balance");
  } finally {
    setLoadingBalance(false);
  }
};

useEffect(() => {
  refreshBalance();
}, [accountId]);


  // 🔹 Fetch bond balance

  return (
    <Dialog open={showDialog} onOpenChange={handleDialogChange}>
      <Button
        variant="outline"
        onClick={() => {
          refreshBalance();
          setShowDialog(true);
        }}
        className="flex items-center gap-2"
      >
        <Coins className="w-4 h-4 text-blue-600" />
        Manage Bond
      </Button>

      <DialogContent className="sm:max-w-md" ref={ref}>
        <DialogHeader>
          <DialogTitle>
            <p className="text-green-600 text-center">
            PROOF OF TRUST
          </p>
            </DialogTitle>
          <DialogDescription>
            A Proof to be trusted by users and seen as a verified issuer that is worthy of monitoring exchange, built on proof of stake
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Display Bond Balance */}
          <div className="bg-muted p-3 rounded-md flex justify-between items-center">
            <p className="text-sm text-gray-600">Current Bond Balance:</p>
            <span className="font-semibold text-green-500">
              {bondBalance !== null ? `${bondBalance} ℏ` : "Loading..."}
            </span>
          </div>

          <Separator />

          {/* Add Bond Section */}

           <div className="p-6">
      {/* Add Bond Button */}
      <button
        onClick={() => setOpenBondModal(true)}
        className="px-5 py-3 rounded-xl bg-black text-white font-medium hover:bg-neutral-800"
      >
        Add Bond
      </button>

      {/* Modal */}
      <BondDialog
        open={openBondModal}
        onOpenChange={setOpenBondModal}
        onSuccess={(txId) => {
          console.log("✅ Bond TX Saved:", txId);
          // here you can call API to store TX in db if needed
        }}
      />
    </div>
       {/*    <div className="space-y-2">
            <p className="text-sm text-gray-600">Add Bond to Platform:</p>
            <Input
              type="number"
              placeholder="Enter bond amount in ℏ"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Button
              onClick={handleAddBond}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                <ArrowDownToLine className="w-4 h-4" />
              )}
              Add Bond
            </Button>
          </div> */}

          <Separator />

          {/* Withdraw Section */}
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Withdraw your locked bond:</p>
            <Button
              onClick={handleWithdraw}
              variant="secondary"
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                <ArrowUpFromLine className="w-4 h-4" />
              )}
              Withdraw Bond
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleDialogChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
)
export default IssuerBondDialog