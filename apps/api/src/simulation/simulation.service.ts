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
    const riskMultiplier = { Conservative: 0.08, Moderate: 0.15, Aggressive: 0.25 };
    const marketMultiplier = { 'Bull Market': 1.5, 'Bear Market': 0.5, Volatile: 0.8, Normal: 1.0 };
    const baseReturn = (riskMultiplier[config.risk as keyof typeof riskMultiplier] || 0.08) * 
                       (marketMultiplier[config.market as keyof typeof marketMultiplier] || 1.0) *
                       (config.duration / 365);

    const finalValue = config.capital * (1 + baseReturn);
    const totalReturn = ((finalValue - config.capital) / config.capital) * 100;

    return {
      finalValue: Math.round(finalValue * 100) / 100,
      totalReturn: Math.round(totalReturn * 100) / 100,
      annualizedReturn: Math.round((totalReturn / config.duration * 365) * 100) / 100,
      maxDrawdown: Math.round((Math.random() * -5 - 1) * 100) / 100,
      sharpeRatio: Math.round((1.2 + Math.random() * 1.5) * 100) / 100,
      volatility: Math.round((Math.random() * 2 + 0.5) * 100) / 100,
    };
  }
}
