'use client';

import { useWeb3Modal, useWeb3ModalAccount, useDisconnect } from '@web3modal/ethers/react';
import { formatEther } from 'ethers';
import { useEffect, useState } from 'react';
import { Wallet } from 'lucide-react';
import { XLAYER_TESTNET, isSupportedYieldGuardChain } from '@/lib/xlayer';

export default function WalletConnectInner() {
  const { address, chainId, isConnected } = useWeb3ModalAccount();
  const { open } = useWeb3Modal();
  const { disconnect } = useDisconnect();
  const [balance, setBalance] = useState<string | null>(null);
  const wrongNetwork = isConnected && !isSupportedYieldGuardChain(chainId);

  const switchToXLayerTestnet = async () => {
    const eth = (window as any).ethereum;
    if (typeof window === 'undefined' || !eth) {
      await open();
      return;
    }

    try {
      await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: XLAYER_TESTNET.chainIdHex }],
      });
    } catch (error: any) {
      if (error?.code === 4902) {
        await eth.request({
          method: 'wallet_addEthereumChain',
          params: [XLAYER_TESTNET],
        });
        return;
      }

      throw error;
    }
  };

  useEffect(() => {
    if (!isConnected || !address) {
      setBalance(null);
      return;
    }
    const chainNames: Record<number, { symbol: string; rpc: string }> = {
      1: { symbol: 'ETH', rpc: 'https://cloudflare-eth.com' },
      196: { symbol: 'OKB', rpc: 'https://rpc.xlayer.tech' },
      1952: { symbol: 'OKB', rpc: 'https://testrpc.xlayer.tech' },
    };
    const info = chainNames[chainId || 0] || { symbol: 'ETH', rpc: 'https://cloudflare-eth.com' };
    async function fetchBalance() {
      try {
        if (!address) return;
        const { JsonRpcProvider } = await import('ethers');
        const provider = new JsonRpcProvider(info.rpc);
        const bal = await provider.getBalance(address);
        setBalance(`${parseFloat(formatEther(bal)).toFixed(4)} ${info.symbol}`);
      } catch {}
    }
    fetchBalance();
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [address, isConnected, chainId]);

  const chainLabels: Record<number, string> = {
    1: 'Ethereum',
    196: 'X Layer',
    1952: 'X Layer Testnet',
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        {wrongNetwork && (
          <button
            onClick={switchToXLayerTestnet}
            className="rounded-full border border-warning/35 bg-warning/10 px-3 py-1.5 text-xs font-medium text-warning transition-all hover:bg-warning/15"
          >
            Switch to X Layer Testnet
          </button>
        )}
        <button
          onClick={() => open()}
          className="group flex items-center gap-2 rounded-full border border-white/8 bg-surface-900/80 px-3 py-1.5 text-xs transition-all hover:border-brand-500/35 hover:bg-surface-800"
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
          <span className="font-mono text-surface-200">
            {address.slice(0, 6)}…{address.slice(-4)}
          </span>
          {balance && <span className="hidden text-surface-500 sm:inline">{balance}</span>}
          {chainId && chainLabels[chainId] && (
            <span className="hidden rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-surface-400 md:inline">
              {chainLabels[chainId]}
            </span>
          )}
        </button>
        <button
          onClick={() => disconnect()}
          className="text-xs text-surface-500 transition-colors hover:text-error"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => open()}
      className="group inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_10px_28px_-12px_rgba(238,127,26,0.75)] transition-all hover:scale-[1.02] hover:bg-brand-600 active:scale-[0.98]"
    >
      <Wallet className="h-4 w-4 transition-transform group-hover:rotate-3" strokeWidth={1.85} />
      Connect Wallet
    </button>
  );
}
