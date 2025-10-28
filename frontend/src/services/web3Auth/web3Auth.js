import { WEB3AUTH_NETWORK } from "@web3auth/modal";
const clientId = import.meta.env.VITE_CLIENT_ID; //
const web3AuthContextConfig = {
    web3AuthOptions: {
        clientId,
        web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
    }
};
export default web3AuthContextConfig;
