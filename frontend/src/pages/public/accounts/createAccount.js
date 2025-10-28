import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
const custodyOptions = [
    {
        title: "Custodial (Fireblocks)",
        description: "With custodial wallets, your account and private keys are created and securely stored by Fireblocks. You don’t create or manage a seed phrase yourself. Instead, you can recover access by tying it to a passphrase or your identity verification.",
        highlight: "✅ Easier to use. ✅ Private keys are safe with Fireblocks. 🔑 You recover access with your passphrase."
    },
    {
        title: "Self-Custodial",
        description: "With self-custodial wallets, you control everything — seed phrase, private keys, and access. No one else can recover your wallet for you.",
        highlight: "⚠️ You must store your seed phrase and private keys safely. If you lose them, your funds and identity are permanently gone."
    }
];
const CreateAccount = () => {
    return (_jsx("div", { className: "min-h-screen md:h-screen  bg-gray-50 flex items-center justify-center p-4 pt-7 overflow-y-scroll md:overflow-hidden", children: _jsxs("div", { className: "max-w-4xl w-full bg-white shadow-lg rounded-2xl pt-3 p-6 md:p-10 h-fit ", children: [_jsx("h1", { className: "text-2xl md:text-3xl font-bold text-center mb-2", children: "Choose Your Wallet Type" }), _jsx("div", { className: "grid gap-6 md:grid-cols-2 pt-4 md:pt-1", children: custodyOptions.map((option, idx) => (_jsxs("div", { className: "border rounded-xl p-6 hover:shadow-md transition bg-gray-50", children: [_jsx("h2", { className: "text-xl font-semibold mb-3", children: option.title }), _jsx("p", { className: "text-gray-700 mb-4", children: option.description }), _jsx("div", { className: "bg-gray-100 p-3 rounded-lg text-sm text-gray-800 whitespace-pre-line", children: option.highlight })] }, idx))) }), _jsxs("div", { className: "mt-8 flex flex-col md:flex-row justify-center gap-4", children: [_jsx(Link, { to: "/self-custodian", className: "px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition cursor-pointer", children: "Create Custodial Wallet" }), _jsx(Link, { to: "/import-account", className: "px-6 py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition cursor-pointer", children: "Create Self-Custodial Wallet" })] })] }) }));
};
export default CreateAccount;
