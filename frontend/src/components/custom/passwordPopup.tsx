import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useEcdsaWallet } from "@/hooks/hederaWallet/hederaSelfCustodial";
import { Transaction } from "@hashgraph/sdk";

interface PasswordPopupProps {
  isOpen: boolean;
  transaction?: Transaction | null; // optional now
  onClose: () => void;
  onSigned: (signedTx: Transaction | null) => void; // allow null for "no transaction"
}

export function PasswordPopup({ isOpen, transaction = null, onClose, onSigned }: PasswordPopupProps) {
  const { unlock, signTransaction, lock } = useEcdsaWallet();

  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!password) {
      setError("Password required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1) Unlock wallet
      await unlock(password);

      if (transaction) {
        // 2) Sign transaction if present
        const signedTx = await signTransaction(transaction);
        await onSigned(signedTx);
      } else {
        // 3) No transaction → just confirm password and call onSigned with null
        await onSigned(null);
      }

      // 4) Lock wallet immediately
      lock();

      // 5) Reset
      setPassword("");
      onClose();
    } catch (err: any) {
      console.error("❌ Password verification failed:", err);
      setError(err.message || "Failed to verify password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-black bg-opacity-40 p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            {transaction ? "Enter Password to Sign" : "Enter Password to Confirm"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Input
              type={show ? "text" : "password"}
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0"
              onClick={() => setShow(!show)}
              disabled={loading}
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setPassword("");
                setError("");
                onClose();
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={handleSubmit}
              disabled={loading || password.length < 5}
            >
              {loading ? (transaction ? "Signing..." : "Verifying...") : transaction ? "Sign & Send" : "Confirm & Send"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
