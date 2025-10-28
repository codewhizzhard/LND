import React from 'react';
import { createRoot } from 'react-dom/client';
import { Web3AuthProvider } from "@web3auth/modal/react";
import web3AuthContextConfig from './services/web3Auth/web3Auth.ts';
import { WagmiProvider } from "@web3auth/modal/react/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import App from './App.tsx';
import './index.css';
import '@rainbow-me/rainbowkit/styles.css';
import { mainnet, polygon, optimism, arbitrum, base } from 'wagmi/chains';


// Wagmi + RainbowKit config
const config = getDefaultConfig({
  appName: 'My RainbowKit App',
  projectId: 'YOUR_PROJECT_ID',
  chains: [mainnet, polygon, optimism, arbitrum, base],
  ssr: true,
});

const queryClient = new QueryClient();

const root = createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
   

     <Web3AuthProvider config={web3AuthContextConfig}>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          <RainbowKitProvider>
            <App />
          </RainbowKitProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </Web3AuthProvider> 
  </React.StrictMode>
);
