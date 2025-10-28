import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AccountId, PrivateKey } from "@hashgraph/sdk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const HederaCrossProjectConnect = () => {
  const [accountId, setAccountId] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [signature, setSignature] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);


  function parsePrivateKey(input: string): PrivateKey {
  try {
    // Try ED25519 first
    return PrivateKey.fromStringED25519(input);
  } catch {
    try {
      // If that fails, try ECDSA
      return PrivateKey.fromStringECDSA(input);
    } catch {
      throw new Error("Invalid Hedera private key format");
    }
  }
}


  const handleSubmit = async () => {
    if (!accountId || !privateKey) {
      setError("Please enter both Account ID and Private Key");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Parse Hedera account and private key
      const accId = AccountId.fromString(accountId);
      const privKey = parsePrivateKey(privateKey);

      // Derive public key from private key
      const pubKey = privKey.publicKey.toString();
      setPublicKey(pubKey);

      // Generate a challenge message
      const challenge = crypto.randomUUID();

      // Convert string challenge to Uint8Array
      const encoder = new TextEncoder();
      const challengeBytes = encoder.encode(challenge);

      // Sign the challenge
      const sigBytes = privKey.sign(challengeBytes);
      const sigHex = Buffer.from(sigBytes).toString("hex");
      setSignature(sigHex);

      // Send to backend
      const res = await fetch("/register-existing-creator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, publicKey: pubKey, signature: sigHex, challenge }),
      });

      if (!res.ok) throw new Error("Failed to submit Hedera info");

      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Hedera Cross-Project Connect</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Hedera Account ID (e.g., 0.0.12345)"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
          />
          <Input
            placeholder="Private Key"
            type="password"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
          />
          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit Hedera Info"}
          </Button>

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">Successfully submitted!</p>}

          {publicKey && signature && (
            <div className="mt-4">
              <p className="text-sm font-mono break-all">Public Key: {publicKey}</p>
              <p className="text-sm font-mono break-all">Signature: {signature}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
