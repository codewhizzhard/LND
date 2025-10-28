import { jsx as _jsx } from "react/jsx-runtime";
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Web3AuthProvider } from "@web3auth/modal/react";
import web3AuthContextConfig from './services/web3Auth/web3Auth.ts';
import { WagmiProvider } from "@web3auth/modal/react/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import './index.css';
import App from './App.tsx';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { mainnet, polygon, optimism, arbitrum, base, } from 'wagmi/chains';
const config = getDefaultConfig({
    appName: 'My RainbowKit App',
    projectId: 'YOUR_PROJECT_ID',
    chains: [mainnet, polygon, optimism, arbitrum, base],
    ssr: true, // If your dApp uses server side rendering (SSR)
});
const queryClient = new QueryClient();
createRoot(document.getElementById('root')).render(_jsx(StrictMode, { children: _jsx(Web3AuthProvider, { config: web3AuthContextConfig, children: _jsx(QueryClientProvider, { client: queryClient, children: _jsx(WagmiProvider, { config: config, children: _jsx(RainbowKitProvider, { children: _jsx(App, {}) }) }) }) }) }));
