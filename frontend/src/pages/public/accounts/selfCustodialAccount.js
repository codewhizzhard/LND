import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useWeb3Auth, useWeb3AuthConnect, useWeb3AuthDisconnect, useWeb3AuthUser } from "@web3auth/modal/react";
import { useEffect, useState } from "react";
import { createAccountOnHedera } from "../../../services/hedera/hedera";
import { getAccountIdFromDb, saveAccountIdToDb } from "../../../indexedDB";
import { getErrorMessage } from "../../../utils/utils";
const SelfCustodialAccount = () => {
    const { connect, isConnected, loading: connectLoading, error: connectError } = useWeb3AuthConnect();
    const { disconnect, loading: disconnectLoading, error: disconnectError } = useWeb3AuthDisconnect();
    const { userInfo } = useWeb3AuthUser();
    const { provider } = useWeb3Auth();
    const [hederaAccountId, setHederaAccountId] = useState(null);
    const [hederaLoading, setHederaLoading] = useState(false);
    const [hederaError, setHederaError] = useState(null);
    useEffect(() => {
        const handleHederaAccountSetup = async () => {
            if (!provider || !userInfo) {
                return;
            }
            try {
                setHederaLoading(true);
                setHederaError(null);
                // Get the ECDSA private key from Web3Auth
                const privateKey = await provider.request({ method: "eth_private_key" });
                // Perform a robust check to ensure the value is a string
                if (typeof privateKey !== 'string' || privateKey.length === 0) {
                    throw new Error("Failed to retrieve a valid private key from Web3Auth.");
                }
                const privateKeyHex = privateKey;
                // Use userInfo properties to create a unique IndexedDB key
                const dbKey = `${userInfo?.email || userInfo?.name}`;
                // Check IndexedDB for a stored Hedera account ID
                const accountId = await getAccountIdFromDb(dbKey);
                if (!accountId) {
                    console.log("No existing Hedera account found. Creating a new one...");
                    const account = await createAccountOnHedera(privateKeyHex, "EDSCA");
                    if (!account.success || !account.accountId)
                        return { success: false, error: account.error };
                    const newAccountId = (account.accountId).toString();
                    await saveAccountIdToDb(dbKey, newAccountId);
                    console.log(`New Hedera account created: ${accountId}`);
                    setHederaAccountId(newAccountId);
                }
                else {
                    console.log(`Found existing Hedera account: ${accountId}`);
                    setHederaAccountId(accountId.toString());
                }
            }
            catch (error) {
                console.error("Error during Hedera account setup:", error);
                setHederaError(getErrorMessage(error));
            }
            finally {
                setHederaLoading(false);
            }
        };
        if (isConnected) {
            handleHederaAccountSetup();
        }
    }, [isConnected, provider, userInfo]);
    const uiConsole = (...args) => {
        const el = document.querySelector("#console>p");
        if (el) {
            el.innerHTML = JSON.stringify(args || {}, null, 2);
            console.log(...args);
        }
    };
    // View to display when the user is logged in
    const loggedInView = (_jsxs("div", { className: "grid", children: [_jsx("h2", { children: "Welcome!" }), hederaAccountId && _jsxs("div", { children: ["Your Hedera Account ID is: ", hederaAccountId] }), _jsxs("div", { className: "flex-container", children: [_jsx("div", { children: _jsx("button", { onClick: () => uiConsole(userInfo), className: "card", children: "Get User Info" }) }), _jsxs("div", { children: [_jsx("button", { onClick: () => disconnect(), className: "card", children: "Log Out" }), disconnectLoading && _jsx("div", { className: "loading", children: "Disconnecting..." }), disconnectError && _jsx("div", { className: "error", children: disconnectError.message })] })] }), hederaLoading && _jsx("div", { className: "loading", children: "Setting up Hedera account..." }), hederaError && _jsx("div", { className: "error", children: hederaError })] }));
    // View to display when the user is logged out
    const unloggedInView = (_jsxs("div", { className: "grid", children: [_jsx("button", { onClick: () => connect(), className: "card cursor-pointer", children: "Login" }), connectLoading && _jsx("div", { className: "loading", children: "Connecting..." }), connectError && _jsx("div", { className: "error", children: connectError.message })] }));
    // Main component return based on connection status
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50 px-4", children: _jsx("div", { className: "max-w-md w-full bg-white shadow-lg rounded-2xl p-6", children: isConnected ? loggedInView : unloggedInView }) }));
};
export default SelfCustodialAccount;
