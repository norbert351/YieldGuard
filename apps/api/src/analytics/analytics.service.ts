import { Injectable } from '@nestjs/common';
import { BlockchainService } from '../blockchain/blockchain.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly blockchain: BlockchainService) {}

  async getMetrics() {
    const vaultAddress = process.env.MAINNET_VAULT_ADDRESS || process.env.VAULT_ADDRESS || '';
    const provider = this.blockchain.getProvider();
    if (!vaultAddress || !provider) {
      return { status: 'unconfigured', message: 'Set VAULT_ADDRESS env var' };
    }

    try {
      const info = await this.blockchain.getVaultInfo(vaultAddress);
      if (!info) return { status: 'unavailable' };

      // Read harvest events to compute yield metrics
      const { ethers } = await import('ethers');
      const currentBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 65000); // ~10 days

      const eventInterface = new ethers.Interface([
        'event Harvested(uint256 totalYield,uint256 fees)',
      ]);
      const topicHash = eventInterface.getEvent('Harvested')!.topicHash;

      const logs = await provider.send('eth_getLogs', [{
        address: vaultAddress,
        fromBlock: '0x' + fromBlock.toString(16),
        toBlock: '0x' + currentBlock.toString(16),
        topics: [topicHash],
      }]);

      let totalYield = 0n;
      let harvestCount = 0;

      for (const log of (logs || [])) {
        const parsed = eventInterface.decodeEventLog('Harvested', log.data, log.topics);
        totalYield += parsed.totalYield;
        harvestCount++;
      }

      const totalYieldNum = parseFloat(ethers.formatEther(totalYield));
      const tvl = parseFloat(info.totalAssets);
      const annualizedReturn = tvl > 0 ? (totalYieldNum / tvl) * 365 : 0;

      return {
        totalReturn: Math.round(totalYieldNum * 10000) / 10000,
        annualizedReturn: Math.round(annualizedReturn * 10000) / 10000,
        harvestCount,
        vaultName: info.name,
        sharePrice: parseFloat(info.sharePrice),
        healthFactor: parseFloat(info.healthFactor),
      };
    } catch {
      return { status: 'error', message: 'Failed to read on-chain data' };
    }
  }

  async getHistory(days: number) {
    const vaultAddress = process.env.MAINNET_VAULT_ADDRESS || process.env.VAULT_ADDRESS || '';
    const provider = this.blockchain.getProvider();
    if (!vaultAddress || !provider) return [];

    try {
      const { ethers } = await import('ethers');
      const currentBlock = await provider.getBlockNumber();
      const blocksPerDay = 6500;
      const fromBlock = Math.max(0, currentBlock - days * blocksPerDay);

      const eventInterface = new ethers.Interface([
        'event Harvested(uint256 totalYield,uint256 fees)',
        'event Deposited(address indexed user,uint256 amount,uint256 shares)',
        'event Withdrawn(address indexed user,uint256 amount,uint256 shares)',
      ]);

      const logs = await provider.send('eth_getLogs', [{
        address: vaultAddress,
        fromBlock: '0x' + fromBlock.toString(16),
        toBlock: '0x' + currentBlock.toString(16),
      }]);

      const dailyMap = new Map<string, { value: number; change: number }>();

      for (const log of (logs || [])) {
        const sig = log.topics?.[0] || '';
        let parsed: any;
        let eventName: string;

        try {
          parsed = eventInterface.decodeEventLog('Harvested', log.data, log.topics);
          eventName = 'Harvested';
        } catch {
          try {
            parsed = eventInterface.decodeEventLog('Deposited', log.data, log.topics);
            eventName = 'Deposited';
          } catch {
            try {
              parsed = eventInterface.decodeEventLog('Withdrawn', log.data, log.topics);
              eventName = 'Withdrawn';
            } catch { continue; }
          }
        }

        const day = Math.floor((currentBlock - parseInt(log.blockNumber, 16)) / blocksPerDay);
        const dayKey = `day-${day}`;
        const entry = dailyMap.get(dayKey) || { value: 0, change: 0 };

        if (eventName === 'Harvested') {
          entry.value += parseFloat(ethers.formatEther(parsed.totalYield));
          entry.change += parseFloat(ethers.formatEther(parsed.totalYield));
        } else if (eventName === 'Deposited') {
          entry.change += parseFloat(ethers.formatEther(parsed.amount));
        } else if (eventName === 'Withdrawn') {
          entry.change -= parseFloat(ethers.formatEther(parsed.amount));
        }

        dailyMap.set(dayKey, entry);
      }

      const data = [];
      let cumulative = 0;
      for (let d = 0; d < days; d++) {
        const key = `day-${d}`;
        const entry = dailyMap.get(key);
        const change = entry?.change || 0;
        cumulative += change;
        data.push({
          day: d + 1,
          value: Math.round(cumulative * 10000) / 10000,
          change: Math.round(change * 10000) / 10000,
        });
      }

      return data;
    } catch { return []; }
  }
}
