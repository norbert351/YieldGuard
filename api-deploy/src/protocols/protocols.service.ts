import { Injectable } from '@nestjs/common';
import { BlockchainService } from '../blockchain/blockchain.service';

@Injectable()
export class ProtocolsService {
  constructor(private readonly blockchain: BlockchainService) {}

  async getAll() {
    const vaultAddress = process.env.MAINNET_VAULT_ADDRESS || process.env.VAULT_ADDRESS || '';
    if (!vaultAddress) return [];
    const provider = this.blockchain.getProvider();
    if (!provider) return [];

    try {
      const { ethers } = await import('ethers');
      const vault = new ethers.Contract(vaultAddress, ['function getStrategies() view returns (address[])'], provider);
      const strategies = await vault.getStrategies() as string[];
      const stratAbi = ['function name() view returns (string)', 'function protocol() view returns (string)', 'function totalAssets() view returns (uint256)', 'function apy() view returns (uint256)'];

      const protocols = await Promise.all(
        strategies.map(async (addr: string) => {
          try {
            const s = new ethers.Contract(addr, stratAbi, provider);
            const [name, protocol] = await Promise.all([s.name(), s.protocol()]);
            return { id: protocol.toLowerCase().replace(/\s+/g, ''), name: protocol, address: addr, supportedAssets: 1 };
          } catch { return null; }
        }),
      );
      return protocols.filter(Boolean);
    } catch { return []; }
  }

  async getRates() {
    const vaultAddress = process.env.MAINNET_VAULT_ADDRESS || process.env.VAULT_ADDRESS || '';
    if (!vaultAddress) return [];
    const provider = this.blockchain.getProvider();
    if (!provider) return [];

    try {
      const { ethers } = await import('ethers');
      const vault = new ethers.Contract(vaultAddress, ['function getStrategies() view returns (address[])'], provider);
      const strategies = await vault.getStrategies() as string[];
      const stratAbi = ['function protocol() view returns (string)', 'function apy() view returns (uint256)'];

      const rates = await Promise.all(
        strategies.map(async (addr: string) => {
          try {
            const s = new ethers.Contract(addr, stratAbi, provider);
            const [protocol, apy] = await Promise.all([s.protocol(), s.apy()]);
            const apyPct = parseFloat(ethers.formatEther(apy)) * 100;
            return { asset: protocol, protocol: protocol, apy: apyPct };
          } catch { return null; }
        }),
      );
      return rates.filter(Boolean);
    } catch { return []; }
  }
}
