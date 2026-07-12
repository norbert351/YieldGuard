'use client';

import { useCallback } from 'react';
import { JsonRpcProvider, Contract, formatUnits, parseUnits } from 'ethers';
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react';
import { deployedContracts } from '@/lib/contracts';

const FACTORY_ABI = ['function getVaults() view returns (address[])', 'function vaultCount() view returns (uint256)', 'function vaults(uint256) view returns (address)'];
const VAULT_ABI = ['function vaultName() view returns (string)', 'function asset() view returns (address)', 'function totalAssets_() view returns (uint256)', 'function totalShares() view returns (uint256)', 'function sharePrice() view returns (uint256)', 'function healthFactor() view returns (uint256)', 'function balanceOf(address) view returns (uint256)', 'function getStrategies() view returns (address[])', 'function deposit(uint256) returns (uint256)', 'function deallocateFromStrategy(address,uint256)', 'function emergencyDeallocate(address)'];
const STRATEGY_ABI = ['function name() view returns (string)', 'function protocol() view returns (string)', 'function totalAssets() view returns (uint256)', 'function apy() view returns (uint256)', 'function healthFactor() view returns (uint256)', 'function isHealthy() view returns (bool)'];
const ERC20_ABI = ['function symbol() view returns (string)', 'function decimals() view returns (uint8)', 'function approve(address,uint256) returns (bool)', 'function balanceOf(address) view returns (uint256)', 'function allowance(address,address) view returns (uint256)'];
const RPC_URLS: Record<number, string> = { 1952: 'https://testrpc.xlayer.tech', 196: 'https://rpc.xlayer.tech' };

export function useYieldGuard() {
  const { address, chainId } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const isTestnet = chainId === 1952;
  const cfg = isTestnet ? deployedContracts.xlayerTestnet : deployedContracts.xlayerMainnet;

  const getVaultData = useCallback(async () => {
    if (!cfg.factory) return null;
    const rpcUrl = RPC_URLS[chainId || 0] || RPC_URLS[1952];
    const provider = new JsonRpcProvider(rpcUrl);
    const factory = new Contract(cfg.factory, FACTORY_ABI, provider);
    const vaultCount = Number(await factory.vaultCount());
    if (vaultCount === 0) return null;
    const vaultAddr = await factory.vaults(0);
    const vault = new Contract(vaultAddr, VAULT_ABI, provider);
    const [name, assetAddr, totalAssets_, totalShares, sharePrice, hf, strategies] = await Promise.all([
      vault.vaultName(), vault.asset(), vault.totalAssets_(), vault.totalShares(), vault.sharePrice(), vault.healthFactor(), vault.getStrategies(),
    ]);
    const vaultData: any = { address: vaultAddr, name, asset: assetAddr, totalAssets: formatUnits(totalAssets_, 18), totalShares: formatUnits(totalShares, 18), sharePrice: formatUnits(sharePrice, 18), healthFactor: formatUnits(hf, 18), strategyCount: strategies.length };
    const strategyData = await Promise.all(strategies.map(async (sAddr: string) => {
      const s = new Contract(sAddr, STRATEGY_ABI, provider);
      const [sName, protocol, sAssets, sApy, sHf, healthy] = await Promise.all([s.name(), s.protocol(), s.totalAssets(), s.apy(), s.healthFactor(), s.isHealthy()]);
      return { address: sAddr, name: sName, protocol, totalAssets: formatUnits(sAssets, 18), apy: (Number(sApy) / 1e16).toFixed(2), healthFactor: formatUnits(sHf, 18), isHealthy: healthy };
    }));
    const strategyAssetsSum = strategyData.reduce((sum: number, s: any) => sum + parseFloat(s.totalAssets), 0);
    vaultData.totalAssets = (parseFloat(vaultData.totalAssets) + strategyAssetsSum).toFixed(6);
    let assetSymbol = 'USDC'; let assetDecimals = 18;
    try { const token = new Contract(assetAddr, ERC20_ABI, provider); assetSymbol = await token.symbol(); assetDecimals = await token.decimals(); } catch {}
    let userBalance = '0';
    if (address) { try { const raw = await vault.balanceOf(address); userBalance = formatUnits(raw, assetDecimals); } catch {} }
    // Vault idle balance = actual USDC sitting in the vault contract
    let vaultIdleBalance = '0';
    try {
      const token = new Contract(assetAddr, ERC20_ABI, provider);
      const raw = await token.balanceOf(vaultAddr);
      vaultIdleBalance = formatUnits(raw, assetDecimals);
    } catch {}
    return { vault: { ...vaultData, idleBalance: vaultIdleBalance }, strategies: strategyData, assetSymbol, userBalance };
  }, [cfg.factory, address, chainId]);

  const rpcForTx = useCallback(() => { return new JsonRpcProvider(RPC_URLS[chainId || 0] || RPC_URLS[1952]); }, [chainId]);

  const sendAndWait = useCallback(async (to: string, data: string, from: string) => {
    if (!walletProvider) throw new Error('Not connected');
    // Retry for WalletConnect provider initialization race condition
    let lastErr: any;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const txHash = await walletProvider.request({ method: 'eth_sendTransaction', params: [{ from, to, data }] });
        const rpc = rpcForTx();
        for (let i = 0; i < 60; i++) { const receipt = await rpc.send('eth_getTransactionReceipt', [txHash]); if (receipt) return receipt; await new Promise(r => setTimeout(r, 2000)); }
        throw new Error('Transaction timeout');
      } catch (err: any) {
        const msg = err?.message || '';
        if (msg.includes('not ready') || msg.includes('Not connected') || err?.code === -32002) {
          await new Promise(r => setTimeout(r, 1500));
          lastErr = err;
          continue;
        }
        throw err;
      }
    }
    throw lastErr || new Error('Transaction failed after retries');
  }, [walletProvider, rpcForTx]);

  const deposit = useCallback(async (amount: string) => {
    if (!address || !cfg.vault) throw new Error('Not connected');
    const { Interface } = await import('ethers');
    return sendAndWait(cfg.vault, new Interface(['function deposit(uint256) returns (uint256)']).encodeFunctionData('deposit', [parseUnits(amount, 18)]), address);
  }, [cfg.vault, address, sendAndWait]);

  const approve = useCallback(async (amount: string) => {
    if (!address || !cfg.vault || !cfg.usdc) throw new Error('Not connected');
    const { Interface } = await import('ethers');
    return sendAndWait(cfg.usdc, new Interface(['function approve(address,uint256) returns (bool)']).encodeFunctionData('approve', [cfg.vault, parseUnits(amount, 18)]), address);
  }, [cfg.vault, cfg.usdc, address, sendAndWait]);

  const getUserBalance = useCallback(async () => {
    if (!address || !cfg.usdc) return '0';
    const token = new Contract(cfg.usdc, ERC20_ABI, new JsonRpcProvider(RPC_URLS[chainId || 0] || RPC_URLS[1952]));
    return formatUnits(await token.balanceOf(address), 18);
  }, [cfg.usdc, address, chainId]);

  const getUserShares = useCallback(async () => {
    if (!address || !cfg.vault) return '0';
    const vault = new Contract(cfg.vault, ['function balanceOf(address) view returns (uint256)'], new JsonRpcProvider(RPC_URLS[chainId || 0] || RPC_URLS[1952]));
    return formatUnits(await vault.balanceOf(address), 18);
  }, [cfg.vault, address, chainId]);

  const withdraw = useCallback(async (shares: string) => {
    if (!address || !cfg.vault) throw new Error('Not connected');
    const { Interface } = await import('ethers');
    return sendAndWait(cfg.vault, new Interface(['function withdraw(uint256) returns (uint256)']).encodeFunctionData('withdraw', [parseUnits(shares, 18)]), address);
  }, [cfg.vault, address, sendAndWait]);

  const allocateToStrategy = useCallback(async (strategyAddr: string, amount: string) => {
    if (!address || !cfg.vault) throw new Error('Not connected');
    const { Interface } = await import('ethers');
    return sendAndWait(cfg.vault, new Interface(['function allocateToStrategy(address,uint256)']).encodeFunctionData('allocateToStrategy', [strategyAddr, parseUnits(amount, 18)]), address);
  }, [cfg.vault, address, sendAndWait]);

  const harvestAll = useCallback(async () => {
    if (!address || !cfg.vault) throw new Error('Not connected');
    const { Interface } = await import('ethers');
    return sendAndWait(cfg.vault, new Interface(['function harvestAll() returns (uint256)']).encodeFunctionData('harvestAll'), address);
  }, [cfg.vault, address, sendAndWait]);

  const isOwner = useCallback(async () => {
    if (!address || !cfg.vault) return false;
    try { const owner = await new Contract(cfg.vault, ['function owner() view returns (address)'], new JsonRpcProvider(RPC_URLS[chainId || 0] || RPC_URLS[1952])).owner(); return owner.toLowerCase() === address.toLowerCase(); } catch { return false; }
  }, [cfg.vault, address, chainId]);

  const getVaultEvents = useCallback(async (days = 30) => {
    if (!cfg.vault) return [];
    const rpc = rpcForTx();
    try {
      const currentBlock = await rpc.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - (days * 6500));

      const { Interface } = await import('ethers');
      const eventInterface = new Interface([
        'event Deposited(address indexed user,uint256 amount,uint256 shares)',
        'event Withdrawn(address indexed user,uint256 amount,uint256 shares)',
        'event Harvested(uint256 totalYield,uint256 fees)',
        'event Rebalanced(address indexed strategy,uint256 amount)',
      ]);
      const eventNames = ['Deposited', 'Withdrawn', 'Harvested', 'Rebalanced'];
      const eventSigs = Object.fromEntries(
        eventNames.map((name) => [eventInterface.getEvent(name)!.topicHash, name]),
      );

      const BATCH = 100;
      const events: any[] = [];

      for (let start = fromBlock; start <= currentBlock; start += BATCH) {
        const end = Math.min(start + BATCH - 1, currentBlock);
        try {
          const raw = await rpc.send('eth_getLogs', [{
            address: cfg.vault,
            fromBlock: '0x' + start.toString(16),
            toBlock: '0x' + end.toString(16),
          }]);
          for (const log of (raw || [])) {
            const sig = log.topics?.[0] || '';
            const name = eventSigs[sig];
            if (!name) continue;
            const parsed = eventInterface.decodeEventLog(name, log.data, log.topics);
            events.push({ name, args: parsed, block: parseInt(log.blockNumber, 16), tx: log.transactionHash });
          }
        } catch {}
      }

      events.sort((a: any, b: any) => b.block - a.block);
      return events.slice(0, 50);
    } catch { return []; }
  }, [cfg.vault, rpcForTx]);

  const rebalance = useCallback(async (fromStrategy: string, toStrategy: string, amount: string) => {
    if (!address || !cfg.vault) throw new Error('Not connected');
    const { Interface } = await import('ethers');
    return sendAndWait(cfg.vault, new Interface(['function rebalance(address,address,uint256)']).encodeFunctionData('rebalance', [fromStrategy, toStrategy, parseUnits(amount, 18)]), address);
  }, [cfg.vault, address, sendAndWait]);

  const deallocateFromStrategy = useCallback(async (strategyAddr: string, amount: string) => {
    if (!address || !cfg.vault) throw new Error('Not connected');
    const { Interface } = await import('ethers');
    return sendAndWait(cfg.vault, new Interface(['function deallocateFromStrategy(address,uint256)']).encodeFunctionData('deallocateFromStrategy', [strategyAddr, parseUnits(amount, 18)]), address);
  }, [cfg.vault, address, sendAndWait]);

  const emergencyDeallocate = useCallback(async (strategyAddr: string) => {
    if (!address || !cfg.vault) throw new Error('Not connected');
    const { Interface } = await import('ethers');
    return sendAndWait(cfg.vault, new Interface(['function emergencyDeallocate(address)']).encodeFunctionData('emergencyDeallocate', [strategyAddr]), address);
  }, [cfg.vault, address, sendAndWait]);

  return { getVaultData, deposit, approve, getUserBalance, getUserShares, withdraw, isOwner, allocateToStrategy, deallocateFromStrategy, emergencyDeallocate, rebalance, harvestAll, getVaultEvents, cfg, isTestnet };
}
