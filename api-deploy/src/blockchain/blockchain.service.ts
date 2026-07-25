import { Injectable, OnModuleInit } from '@nestjs/common';
import { ethers } from 'ethers';

@Injectable()
export class BlockchainService implements OnModuleInit {

  private vaultAbi = [
    'function deposit(uint256 _amount) external returns (uint256)',
    'function withdraw(uint256 _shares) external returns (uint256)',
    'function balances(address) view returns (uint256)',
    'function totalAssets_() view returns (uint256)',
    'function totalShares() view returns (uint256)',
    'function asset() view returns (address)',
    'function vaultName() view returns (string)',
    'function strategies(uint256) view returns (address)',
    'function strategyAllocation(address) view returns (uint256)',
    'function isStrategy(address) view returns (bool)',
  ];

  async onModuleInit() {
    console.log('Blockchain service initialized (lazy connect)');
  }

  private getConfig(network?: string) {
    const isTestnet = network === 'testnet';
    const rpcUrl = isTestnet
      ? (process.env.TESTNET_RPC_URL || 'http://127.0.0.1:8545')
      : (process.env.MAINNET_RPC_URL || process.env.X_LAYER_RPC || process.env.RPC_URL || 'http://127.0.0.1:8545');
    const vaultAddress = isTestnet
      ? (process.env.TESTNET_VAULT_ADDRESS || '')
      : (process.env.MAINNET_VAULT_ADDRESS || process.env.VAULT_ADDRESS || '');
    const privateKey = process.env.YIELDGUARD_WALLET_PK || process.env.FOUNDRY_WALLET_PK || process.env.PRIVATE_KEY || '';
    return { rpcUrl, vaultAddress, privateKey, isTestnet };
  }

  async getProvider(network?: string) {
    const { rpcUrl } = this.getConfig(network);
    return new ethers.JsonRpcProvider(rpcUrl);
  }

  private async getSigner(network?: string) {
    const { rpcUrl, privateKey } = this.getConfig(network);
    if (!privateKey) throw new Error('Wallet PK not set — set YIELDGUARD_WALLET_PK env var');
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    return new ethers.Wallet(privateKey, provider);
  }

  async isConnected(): Promise<boolean> {
    try {
      const provider = await this.getProvider();
      await provider.getBlockNumber();
      return true;
    } catch { return false; }
  }

  async getVaultInfo(vaultAddress: string, network?: string) {
    const provider = await this.getProvider(network);
    const c = new ethers.Contract(vaultAddress, this.vaultAbi, provider);
    try {
      const [name, asset, totalAssets, totalShares] = await Promise.all([
        c.vaultName(), c.asset(), c.totalAssets_(), c.totalShares(),
      ]);
      return {
        address: vaultAddress, name, asset,
        totalAssets: ethers.formatEther(totalAssets),
        totalShares: ethers.formatEther(totalShares),
        sharePrice: totalShares > 0n ? ethers.formatEther((totalAssets * 10n ** 18n) / totalShares) : '1.0',
      };
    } catch { return null; }
  }

  async depositToVault(vaultAddress: string, amount: string, network?: string) {
    const signer = await this.getSigner(network);
    const c = new ethers.Contract(vaultAddress, this.vaultAbi, signer);
    const tx = await c.deposit(ethers.parseEther(amount));
    const r = await tx.wait();
    return { txHash: r.hash, blockNumber: r.blockNumber, network: network || 'mainnet' };
  }

  async withdrawFromVault(vaultAddress: string, shares: string, network?: string) {
    const signer = await this.getSigner(network);
    const c = new ethers.Contract(vaultAddress, this.vaultAbi, signer);
    const tx = await c.withdraw(ethers.parseEther(shares));
    const r = await tx.wait();
    return { txHash: r.hash, blockNumber: r.blockNumber, network: network || 'mainnet' };
  }

  async getUserBalance(vaultAddress: string, userAddress: string, network?: string) {
    const provider = await this.getProvider(network);
    const c = new ethers.Contract(vaultAddress, this.vaultAbi, provider);
    const bal = ethers.formatEther(await c.balances(userAddress));
    return { address: userAddress, balance: bal, network: network || 'mainnet' };
  }
}
