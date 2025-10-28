import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AccountId, PrivateKey } from "@hashgraph/sdk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
export const HederaCrossProjectConnect = () => {
    const [accountId, setAccountId] = useState("");
    const [privateKey, setPrivateKey] = useState("");
    const [signature, setSignature] = useState(null);
    const [publicKey, setPublicKey] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    function parsePrivateKey(input) {
        try {
            // Try ED25519 first
            return PrivateKey.fromStringED25519(input);
        }
        catch {
            try {
                // If that fails, try ECDSA
                return PrivateKey.fromStringECDSA(input);
            }
            catch {
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
            if (!res.ok)
                throw new Error("Failed to submit Hedera info");
            setSuccess(true);
        }
        catch (err) {
            console.error(err);
            setError(err.message || "Unknown error");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-gray-100 p-4", children: _jsxs(Card, { className: "w-full max-w-md rounded-2xl shadow-lg", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-xl font-semibold", children: "Hedera Cross-Project Connect" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsx(Input, { placeholder: "Hedera Account ID (e.g., 0.0.12345)", value: accountId, onChange: (e) => setAccountId(e.target.value) }), _jsx(Input, { placeholder: "Private Key", type: "password", value: privateKey, onChange: (e) => setPrivateKey(e.target.value) }), _jsx(Button, { className: "w-full", onClick: handleSubmit, disabled: loading, children: loading ? "Submitting..." : "Submit Hedera Info" }), error && _jsx("p", { className: "text-red-600 text-sm", children: error }), success && _jsx("p", { className: "text-green-600 text-sm", children: "Successfully submitted!" }), publicKey && signature && (_jsxs("div", { className: "mt-4", children: [_jsxs("p", { className: "text-sm font-mono break-all", children: ["Public Key: ", publicKey] }), _jsxs("p", { className: "text-sm font-mono break-all", children: ["Signature: ", signature] })] }))] })] }) }));
};
