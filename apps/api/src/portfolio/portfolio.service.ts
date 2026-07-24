import { Injectable } from '@nestjs/common';
import { BlockchainService } from '../blockchain/blockchain.service';

@Injectable()
export class PortfolioService {
  constructor(private readonly blockchain: BlockchainService) {}

  async getOverview() {
    const vaultAddress = process.env.MAINNET_VAULT_ADDRESS || process.env.VAULT_ADDRESS || '';
    if (!vaultAddress) {
      return { status: 'unconfigured', message: 'Set VAULT_ADDRESS env var to read live data' };
    }
    try {
      const info = await this.blockchain.getVaultInfo(vaultAddress);
      if (!info) return { status: 'unavailable', message: 'Vault not found on chain' };
      return {
        totalValue: parseFloat(info.totalAssets),
        sharePrice: parseFloat(info.sharePrice),
        healthFactor: parseFloat(info.healthFactor),
        vaultName: info.name,
        asset: info.asset,
        status: 'healthy',
      };
    } catch {
      return { status: 'error', message: 'Failed to read blockchain data' };
    }
  }

  async getPositions() {
    const vaultAddress = process.env.MAINNET_VAULT_ADDRESS || process.env.VAULT_ADDRESS || '';
    if (!vaultAddress) return [];
    try {
      const info = await this.blockchain.getVaultInfo(vaultAddress);
      if (!info) return [];
      const provider = this.blockchain.getProvider();
      if (!provider) return [];
      // Read strategies from vault to build positions
      const vaultAbi = ['function getStrategies() view returns (address[])', 'function strategyCount() view returns (uint256)'];
      const { ethers } = await import('ethers');
      const vault = new ethers.Contract(vaultAddress, vaultAbi, provider);
      const strategies = await vault.getStrategies() as string[];
      const positions = await Promise.all(
        strategies.map(async (addr: string) => {
          const stratAbi = ['function name() view returns (string)', 'function protocol() view returns (string)', 'function totalAssets() view returns (uint256)', 'function apy() view returns (uint256)', 'function healthFactor() view returns (uint256)', 'function isHealthy() view returns (bool)'];
          const s = new ethers.Contract(addr, stratAbi, provider);
          try {
            const [name, protocol, totalAsset, apy, hf] = await Promise.all([s.name(), s.protocol(), s.totalAssets(), s.apy(), s.healthFactor()]);
            return {
              protocol,
              asset: info.asset,
              deposited: parseFloat(ethers.formatEther(totalAsset)),
              apy: parseFloat(ethers.formatEther(apy)) * 100,
              healthFactor: parseFloat(ethers.formatEther(hf)),
              status: 'Active',
            };
          } catch {
            return null;
          }
        }),
      );
      return positions.filter(Boolean);
    } catch {
      return [];
    }
  }
}
