"use client";

import { useState } from "react";
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
import { Loader2 } from "lucide-react";
import axios from "axios";
import {
  generateHederaEcdsaAccount,
  encryptPrivateKey,
  decryptPrivateKey,
} from "@/utils/walletCrypto";
import sdk from "../../../../sdk";

export default function IssuerSecurityDialog() {
  const [showDialog, setShowDialog] = useState(false);
  const [mode, setMode] = useState<"generate" | "retrieve" | null>(null);
  const [loading, setLoading] = useState(false);
  const [walletData, setWalletData] = useState<{
    publicKey: string;
    privateKey?: string;
    accountId?: string;
  } | null>(null);
  const [userSecret, setUserSecret] = useState("");

  // ✅ Reset all states when dialog closes
  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setMode(null);
      setWalletData(null);
      setUserSecret("");
      setLoading(false);
    }
    setShowDialog(open);
  };

  /**
   * 🧩 Generate + Encrypt + Register new ECDSA account
   */
  const handleGenerate = async () => {
  if (!userSecret.trim()) {
    toast.error("Please enter a secret phrase before generating your wallet.");
    return;
  }

  setLoading(true);
  try {
    // 1️⃣ Generate Hedera ECDSA key pair
    const { privateKey, publicKey } = generateHederaEcdsaAccount();
    console.log("Generated keys:", privateKey, publicKey);

    // 2️⃣ Encrypt private key locally
    const encryptedData = encryptPrivateKey(privateKey, userSecret);
    const encryptedPrivateKey = encryptedData.encryptedPrivateKey
    const encryptedSalt = encryptedData.salt
    const encryptedIv = encryptedData.iv

    // 3️⃣ Register issuer ECDSA account via SDK
    const res = await sdk.orgRegisterIssuerEcdsaAccount(
      publicKey,
      encryptedPrivateKey,
      encryptedSalt,
      encryptedIv,
  );
  console.log("res:", res)

    if (!res.success) {
      toast.error(res.error || "Failed to register ECDSA account on Hedera.");
      return;
    }

    // 4️⃣ Save wallet data to state
    setWalletData({
      publicKey,
      accountId: res.data.accountId,
      privateKey,
    });

    toast.success("✅ ECDSA Wallet created and saved to Hedera!");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error generating/registering wallet:", error.message);
      toast.error("Unexpected error: " + error.message);
    } else {
      console.error("Unknown error generating/registering wallet:", error);
      toast.error("An unknown error occurred while creating wallet.");
    }
  } finally {
    setLoading(false);
  }
};

  /**
   * 🧩 Retrieve + Decrypt ECDSA account from backend
   */
const handleRetrieve = async () => {
  if (!userSecret.trim()) {
    toast.error("Enter your secret phrase to decrypt your wallet.");
    return;
  }

  setLoading(true);

  try {
    // ✅ Use SDK to retrieve issuer ECDSA account
    const res = await sdk.orgRetrieveIssuerEcdsaAccount();
 

    if (!res.success) {
      toast.error(res.error || "Failed to retrieve ECDSA wallet.");
      return;
    }

    const data = res.data;

    // 1️⃣ No account exists
    if (!data?.edscaAccountId || !data?.edscaPublickey) {
      toast.warning("No ECDSA account found. Please generate a new wallet.");
      return;
    }

    // 2️⃣ Attempt to decrypt private key if available
    let decryptedKey: string | undefined = undefined;
    if (data.edscaEncryptedPrivateKey && data.edscaSalt && data.edscaIv) {
      try {
        decryptedKey = decryptPrivateKey(
          data.edscaEncryptedPrivateKey,
          userSecret,
          data.edscaSalt,
          data.edscaIv
        );
        toast.success("✅ Private key decrypted successfully!");
      } catch (err: unknown) {
        toast.error("Secret phrase is incorrect or data is corrupted.");
        return; // Stop further processing
      }
    } else {
      // If encrypted private key is missing, allow using public info only
      toast.info("ECDSA account exists but no private key stored locally.");
    }

    // 🔑 Save wallet data to state
    setWalletData({
      publicKey: data.edscaPublickey,
      accountId: data.edscaAccountId,
      privateKey: decryptedKey, // undefined if not decrypted
    });

  } catch (err: unknown) {
    if (err instanceof Error) {
      toast.error(err.message || "Failed to retrieve ECDSA wallet.");
    } else {
      toast.error("An unknown error occurred while retrieving ECDSA wallet.");
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <Dialog open={showDialog} onOpenChange={handleDialogChange}>
      <Button
        variant="outline"
        onClick={() => setShowDialog(true)}
        className="flex items-center gap-2"
      >
        Manage Wallet
      </Button>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage ECDSA Wallet</DialogTitle>
          <DialogDescription>
            Generate a new encrypted wallet or retrieve an existing one linked to your issuer account.
          </DialogDescription>
        </DialogHeader>

        {/* Initial Mode Selector */}
        {!mode && (
          <div className="flex flex-col gap-3">
            <Button onClick={() => setMode("generate")}>Generate New Wallet</Button>
            <Button variant="secondary" onClick={() => setMode("retrieve")}>
              Retrieve Existing Wallet
            </Button>
          </div>
        )}

        {/* Mode Actions */}
        {mode && (
          <div className="space-y-4">
            <Button variant="ghost" onClick={() => setMode(null)}>
              ← Back
            </Button>
            <Separator />

            {/* Generate */}
            {mode === "generate" && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Enter a strong secret phrase. It encrypts your private key before upload.
                </p>
                <Input
                  placeholder="Enter Secret Phrase"
                  type="password"
                  value={userSecret}
                  onChange={(e) => setUserSecret(e.target.value)}
                />
                <Button onClick={handleGenerate} disabled={loading}>
                  {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                  Generate Wallet
                </Button>
              </div>
            )}

            {/* Retrieve */}
            {mode === "retrieve" && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Retrieve your Hedera ECDSA account information.
                </p>
                <Input
                  placeholder="Enter Secret Phrase"
                  type="password"
                  value={userSecret}
                  onChange={(e) => setUserSecret(e.target.value)}
                />
                <Button onClick={handleRetrieve} disabled={loading}>
                  {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                  Retrieve Wallet
                </Button>
              </div>
            )}

            {/* Wallet Display */}
            {walletData && (
              <div className="bg-muted p-3 rounded-md text-sm mt-3 max-h-48 overflow-y-auto">
                <p className="break-all">
                  <strong>Public Key:</strong> {walletData.publicKey}
                </p>
                {walletData.accountId && (
                  <p className="mt-2 break-all text-green-600">
                    <strong>Account ID:</strong> {walletData.accountId}
                  </p>
                )}
                {walletData.privateKey && (
                  <p className="mt-2 break-all text-red-600">
                    <strong>Private Key:</strong> {walletData.privateKey}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleDialogChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
