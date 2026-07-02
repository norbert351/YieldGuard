import { Injectable } from '@nestjs/common';

@Injectable()
export class PortfolioService {
  private positions = [
    { protocol: 'Aave V3', asset: 'USDC', deposited: 50000, apy: 6.2, healthFactor: 2.8, status: 'Active' },
    { protocol: 'Morpho', asset: 'USDC', deposited: 35000, apy: 8.9, healthFactor: 3.1, status: 'Active' },
    { protocol: 'Compound', asset: 'DAI', deposited: 25000, apy: 5.4, healthFactor: 2.5, status: 'Active' },
    { protocol: 'Aave V3', asset: 'WETH', deposited: 14582, apy: 4.1, healthFactor: 2.2, status: 'Active' },
  ];

  getOverview() {
    const totalValue = this.positions.reduce((sum, p) => sum + p.deposited, 0);
    const avgApy = this.positions.reduce((sum, p) => sum + p.apy, 0) / this.positions.length;
    const minHealth = Math.min(...this.positions.map((p) => p.healthFactor));
    const protocols = [...new Set(this.positions.map((p) => p.protocol))];

    return {
      totalValue: Math.round(totalValue * 100) / 100,
      avgApy: Math.round(avgApy * 100) / 100,
      activeProtocols: protocols.length,
      healthFactor: Math.round(minHealth * 10) / 10,
      status: 'healthy',
    };
  }

  getPositions() {
    return this.positions;
  }
}
