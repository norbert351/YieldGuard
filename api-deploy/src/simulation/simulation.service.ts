import { Injectable } from '@nestjs/common';

@Injectable()
export class SimulationService {
  private simulations: any[] = [];

  findAll() {
    return this.simulations;
  }

  run(config: { capital: number; duration: number; risk: string; market: string }) {
    const simulation = {
      id: `SIM-${String(this.simulations.length + 1).padStart(3, '0')}`,
      config,
      status: 'completed',
      results: this.generateResults(config),
      createdAt: new Date().toISOString(),
    };

    this.simulations.push(simulation);
    return simulation;
  }

  private generateResults(config: { capital: number; duration: number; risk: string; market: string }) {
    const riskMultiplier: Record<string, number> = { Conservative: 0.08, Moderate: 0.15, Aggressive: 0.25 };
    const marketMultiplier: Record<string, number> = { 'Bull Market': 1.5, 'Bear Market': 0.5, Volatile: 0.8, Normal: 1.0 };

    const baseReturn = (riskMultiplier[config.risk] || 0.08) *
                       (marketMultiplier[config.market] || 1.0) *
                       (config.duration / 365);

    const finalValue = config.capital * (1 + baseReturn);
    const totalReturn = ((finalValue - config.capital) / config.capital) * 100;

    // Deterministic drawdown estimate based on risk profile
    const drawdownMap: Record<string, number> = { Conservative: -2.0, Moderate: -4.0, Aggressive: -7.0 };
    const maxDrawdown = drawdownMap[config.risk] || -3.0;

    // Deterministic Sharpe based on risk profile
    const sharpeMap: Record<string, number> = { Conservative: 2.5, Moderate: 1.8, Aggressive: 1.2 };
    const sharpeRatio = sharpeMap[config.risk] || 1.5;

    // Volatility based on risk
    const volMap: Record<string, number> = { Conservative: 0.5, Moderate: 1.2, Aggressive: 2.5 };
    const volatility = volMap[config.risk] || 1.0;

    return {
      finalValue: Math.round(finalValue * 100) / 100,
      totalReturn: Math.round(totalReturn * 100) / 100,
      annualizedReturn: Math.round(((totalReturn / config.duration) * 365) * 100) / 100,
      maxDrawdown,
      sharpeRatio,
      volatility,
    };
  }
}
