import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useWallet } from "./usewallet";
import { Eye, EyeOff } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import sdk from "@/sdk";
import { getFromDB } from "@/utils/db";
export function WalletUI() {
    const { publicKey, createWallet, restoreWallet, backup, startSession, sessionActive, expiresAt } = useWallet();
    const [privateKey, setPrivateKey] = useState(null);
    const [password, setPassword] = useState("");
    const [keystore, setKeystore] = useState("");
    const [showPrivKey, setShowPrivKey] = useState(false); // ✅ show once toggle
    const [show, setShow] = useState(false);
    const [accountId, setAccountId] = useState("");
    const [error, setError] = useState(null);
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token"); // optional
    const [phoneHash, setPhoneHash] = useState(null);
    useEffect(() => {
        const verify = async () => {
            if (!token)
                return; // normal user, skip
            try {
                const res = await fetch(`/verify-whatsapp?token=${token}`);
                if (!res.ok)
                    throw new Error("Invalid WhatsApp token");
                const data = await res.json();
                setPhoneHash(data.phoneHash);
            }
            catch (err) {
                console.error("WhatsApp token verification failed:", err);
            }
        };
        verify();
    }, [token]);
    const handleCreate = async () => {
        try {
            console.log("Creating wallet...");
            // 1️⃣ Create local wallet
            const { privateKey, publicKey } = await createWallet(password);
            localStorage.setItem("userPublicKey", publicKey);
            setPrivateKey(privateKey); // optional if you want to display it
            setShowPrivKey(true);
            // 2️⃣ Call backend via SDK
            // const token = localStorage.getItem("token") ?? ""; // existing login JWT
            const res = await sdk.registerNewCreator(publicKey);
            console.log("done");
            if (!res.success)
                throw new Error(res.error || "Registration failed");
            localStorage.setItem("creator", JSON.stringify(res.data));
            setAccountId(res.data.accountId);
            // 3️⃣ Set accountId from backend response
            //setAccountId(res.data.data.accountId);
            // 4️⃣ Start session
            startSession(15);
        }
        catch (err) {
            console.error("Error creating wallet:", err);
            setError(err.message || "Unknown error");
        }
    };
    const handleRestore = async () => {
        const { privateKey } = await restoreWallet(password, keystore);
        const WALLET_KEY = "user_wallet";
        // Try to pull it out again
        const raw = await getFromDB(WALLET_KEY);
        console.log("IndexedDB raw value:", raw);
        if (raw) {
            console.log("Wallet persisted ✅");
        }
        else {
            console.log("Wallet NOT persisted ❌");
        }
        setPrivateKey(privateKey);
        setShowPrivKey(true);
        // check
        /*  const accountId = await getOrCreateAccountOnBackend({
           publicKey: privateKey,
           phoneHash,
         });
         setAccountId(accountId); */
        startSession(15);
    };
    const handleBackup = async () => {
        if (!password)
            return;
        const json = await backup();
        const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "wallet-backup.json";
        a.click();
    };
    return (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-gray-100 p-4", children: _jsxs(Card, { className: "w-full max-w-md rounded-2xl shadow-lg", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-xl font-semibold", children: publicKey ? "Wallet Dashboard" : "Create or Restore Wallet" }) }), _jsx(CardContent, { className: "space-y-4", children: !publicKey ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "relative", children: [_jsx(Input, { type: show ? "text" : "password", placeholder: "Set Password", value: password, onChange: e => setPassword(e.target.value) }), _jsx(Button, { type: "button", variant: "ghost", size: "icon", className: "absolute right-2 top-1/2 -translate-y-1/2 p-0", onClick: () => setShow(!show), children: show ? _jsx(EyeOff, { size: 16 }) : _jsx(Eye, { size: 16 }) })] }), _jsx(Button, { className: "w-full", onClick: handleCreate, disabled: password.length < 5, children: "Create New Wallet" }), _jsx(Input, { type: "file", accept: "application/json", onChange: e => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        file.text().then(setKeystore);
                                    }
                                } }), _jsx(Button, { className: "w-full", onClick: handleRestore, disabled: password.length < 5 || !keystore, children: "Restore from Backup" })] })) : (_jsxs(_Fragment, { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Public Key:" }), _jsx("p", { className: "break-all text-xs font-mono", children: publicKey }), showPrivKey && privateKey && (_jsxs("div", { className: "p-3 rounded-lg border border-red-400 bg-red-50", children: [_jsx("p", { className: "text-sm font-semibold text-red-600", children: "\u26A0\uFE0F Save your Private Key securely. You won\u2019t see this again!" }), _jsx("p", { className: "break-all text-xs font-mono mt-2", children: privateKey }), _jsx(Button, { className: "mt-2 w-full", variant: "destructive", onClick: () => setShowPrivKey(false), children: "I have saved it" })] })), sessionActive ? (_jsxs("p", { className: "text-green-600 text-sm", children: ["Session Active (expires ", new Date(expiresAt).toLocaleTimeString(), ")"] })) : (_jsx("p", { className: "text-red-600 text-sm", children: "Session expired" })), _jsx(Button, { className: "w-full", onClick: handleBackup, children: "Download Backup" })] })) })] }) }));
}
