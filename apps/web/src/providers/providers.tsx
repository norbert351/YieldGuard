'use client';

import { ReactNode } from 'react';
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

const xlayerMainnet = { chainId: 196, name: 'X Layer', currency: 'OKB', explorerUrl: 'https://www.oklink.com/xlayer', rpcUrl: 'https://rpc.xlayer.tech' };
const xlayerTestnet = { chainId: 1952, name: 'X Layer Testnet', currency: 'OKB', explorerUrl: 'https://www.oklink.com/xlayer-test', rpcUrl: 'https://testrpc.xlayer.tech' };
const ethereum = { chainId: 1, name: 'Ethereum', currency: 'ETH', explorerUrl: 'https://etherscan.io', rpcUrl: `https://eth-mainnet.g.alchemy.com/v2/${projectId}` };

const metadata = { name: 'YieldGuard', description: 'DeFi Yield Optimization', url: 'https://yieldguard.io', icons: ['/logo-icon.jpg'] };

createWeb3Modal({
  ethersConfig: defaultConfig({
    metadata,
    defaultChainId: 1952,
    enableCoinbase: false,
    enableInjected: true,
    enableEIP6963: true,
  }),
  chains: [xlayerTestnet, xlayerMainnet, ethereum],
  defaultChain: xlayerTestnet,
  projectId,
  enableEIP6963: true,
  featuredWalletIds: [
    // MetaMask
    'c57ca95b-ae9e-4d48-93e9-a26d89c189d3',
    // Rabby Wallet
    '869bb052-679f-4b6e-9d3b-a5e905d11f59',
    // OKX Wallet
    '38f5d18bd8522c244bdd70cb4a68e0e718865155811c043f052fb9f1c51de662',
  ],
  themeMode: 'dark',
  themeVariables: { '--w3m-color-mix': '#ee7f1a', '--w3m-color-mix-strength': 20, '--w3m-accent': '#ee7f1a', '--w3m-border-radius-master': '12px' },
});

export function Providers({ children }: { children: ReactNode }) { return <>{children}</>; }
