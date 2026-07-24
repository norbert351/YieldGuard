import { Injectable, OnModuleInit } from '@nestjs/common';
import { ethers } from 'ethers';

@Injectable()
export class BlockchainService implements OnModuleInit {
  private provider: ethers.JsonRpcProvider | null = null;
  private signer: ethers.Wallet | null = null;

  private vaultAbi = [
    'function deposit(uint256 _amount) external returns (uint256)',
    'function withdraw(uint256 _shares) external returns (uint256)',
    'function balanceOf(address _user) view returns (uint256)',
    'function totalAssets() view returns (uint256)',
    'function totalShares() view returns (uint256)',
    'function sharePrice() view returns (uint256)',
    'function healthFactor() view returns (uint256)',
    'function asset() view returns (address)',
    'function vaultName() view returns (string)',
    'function getStrategies() view returns (address[])',
  ];

  async onModuleInit() {
    const rpcUrl = process.env.RPC_URL || process.env.X_LAYER_RPC || 'http://127.0.0.1:8545';
    const privateKey = process.env.PRIVATE_KEY || '';
    try {
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      if (privateKey) this.signer = new ethers.Wallet(privateKey, this.provider);
      console.log(`Blockchain provider: ${rpcUrl}`);
    } catch { console.warn('Blockchain unavailable (simulation mode)'); }
  }

  isConnected(): boolean { return this.provider !== null; }
  getProvider(): ethers.JsonRpcProvider | null { return this.provider; }

  async getVaultInfo(vaultAddress: string) {
    if (!this.provider) return null;
    const c = new ethers.Contract(vaultAddress, this.vaultAbi, this.provider);
    try {
      const [name, asset, totalAssets, totalShares, hf] = await Promise.all([
        c.vaultName(), c.asset(), c.totalAssets(), c.totalShares(), c.healthFactor(),
      ]);
      return {
        address: vaultAddress, name, asset,
        totalAssets: ethers.formatEther(totalAssets),
        totalShares: ethers.formatEther(totalShares),
        healthFactor: ethers.formatEther(hf),
        sharePrice: totalShares > 0n ? ethers.formatEther((totalAssets * 10n ** 18n) / totalShares) : '1.0',
      };
    } catch { return null; }
  }

  async depositToVault(vaultAddress: string, amount: string) {
    if (!this.signer) throw new Error('Signer not initialized');
    const c = new ethers.Contract(vaultAddress, this.vaultAbi, this.signer);
    const tx = await c.deposit(ethers.parseEther(amount));
    const r = await tx.wait();
    return { txHash: r.hash, blockNumber: r.blockNumber };
  }

  async withdrawFromVault(vaultAddress: string, shares: string) {
    if (!this.signer) throw new Error('Signer not initialized');
    const c = new ethers.Contract(vaultAddress, this.vaultAbi, this.signer);
    const tx = await c.withdraw(ethers.parseEther(shares));
    const r = await tx.wait();
    return { txHash: r.hash, blockNumber: r.blockNumber };
  }

  async getUserBalance(vaultAddress: string, userAddress: string) {
    if (!this.provider) return null;
    const c = new ethers.Contract(vaultAddress, this.vaultAbi, this.provider);
    return ethers.formatEther(await c.balanceOf(userAddress));
  }
}
