import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useWallet } from "./usewallet";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import sdk from "@/sdk";
import { getFromDB } from "@/utils/db";

export function WalletUI() {
  const navigate = useNavigate();
  const { publicKey, createWallet, restoreWallet, backup, startSession, sessionActive, expiresAt } =
    useWallet();

  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [keystore, setKeystore] = useState("");
  const [showPrivKey, setShowPrivKey] = useState(false);
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    toast.loading("Syncing your data to the server…", { id: "sync-toast" });
    try {
      const { privateKey, publicKey } = await createWallet(password);
      localStorage.setItem("userPublicKey", publicKey);
      setPrivateKey(privateKey);
      setShowPrivKey(true);

      const res = await sdk.registerNewCreator(publicKey);
      if (!res.success) throw new Error(res.error || "Registration failed");
      localStorage.setItem("creator", JSON.stringify(res.data));

      startSession(15);

      toast.success("Data in sync!", { id: "sync-toast" });
    } catch (err: any) {
      console.error("Error creating wallet:", err);
      toast.error(err.message || "Unknown error", { id: "sync-toast" });
      setError(err.message || "Unknown error");
    } finally {
      setCreating(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    toast.loading("Syncing your data to the server…", { id: "sync-toast" });
    try {
      const { privateKey } = await restoreWallet(password, keystore);
      const WALLET_KEY = "user_wallet";
      const raw = await getFromDB(WALLET_KEY);
      console.log("IndexedDB raw value:", raw);

      setPrivateKey(privateKey);
      setShowPrivKey(true);

      startSession(15);

      toast.success("Data in sync!", { id: "sync-toast" });
    } catch (err: any) {
      console.error("Error restoring wallet:", err);
      toast.error(err.message || "Unknown error", { id: "sync-toast" });
      setError(err.message || "Unknown error");
    } finally {
      setRestoring(false);
    }
  };

  const handleBackup = async () => {
    if (!password) return;
    const json = await backup();
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wallet-backup.json";
    a.click();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            {!publicKey || !showPrivKey ? "Create or Restore Wallet" : "Wallet Dashboard"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {!publicKey || !showPrivKey ? (
            <>
              {/* Back button disabled while creating/restoring */}
              <Button
                variant="ghost"
                disabled={creating || restoring}
                onClick={() => navigate(-1)}
              >
                ← Back
              </Button>

              <div className="relative">
                <Input
                  type={show ? "text" : "password"}
                  placeholder="Set Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={creating || restoring}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0"
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>

              <Button
                className="w-full"
                onClick={handleCreate}
                disabled={password.length < 5 || creating}
              >
                {creating ? "Creating…" : "Create New Wallet"}
              </Button>

              <Input
                type="file"
                accept="application/json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) file.text().then(setKeystore);
                }}
                disabled={creating || restoring}
              />
              <Button
                className="w-full"
                onClick={handleRestore}
                disabled={password.length < 5 || !keystore || restoring}
              >
                {restoring ? "Restoring…" : "Restore from Backup"}
              </Button>
            </>
          ) : (
            <>
              {/* Back button to create/restore form disabled if syncing */}
              <Button
                variant="ghost"
                onClick={() => setShowPrivKey(false)}
                disabled={creating || restoring}
                className="mb-2"
              >
                ← Back to Create / Restore
              </Button>

              <p className="text-sm text-gray-600">Public Key:</p>
              <p className="break-all text-xs font-mono">{publicKey}</p>

              {showPrivKey && privateKey && (
                <div className="p-3 rounded-lg border border-red-400 bg-red-50">
                  <p className="text-sm font-semibold text-red-600">
                    ⚠️ Save your Private Key securely. You won’t see this again!
                  </p>
                  <p className="break-all text-xs font-mono mt-2">{privateKey}</p>
                  <Button
                    className="mt-2 w-full"
                    variant="destructive"
                    onClick={() => setShowPrivKey(false)}
                    disabled={creating || restoring}
                  >
                    I have saved it
                  </Button>
                </div>
              )}

              {sessionActive ? (
                <p className="text-green-600 text-sm">
                  Session Active (expires {new Date(expiresAt!).toLocaleTimeString()})
                </p>
              ) : (
                <p className="text-red-600 text-sm">Session expired</p>
              )}

              <Button className="w-full" onClick={handleBackup} disabled={creating || restoring}>
                Download Backup
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
