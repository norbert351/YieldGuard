import { Injectable } from '@nestjs/common';

@Injectable()
export class AnalyticsService {
  getMetrics() {
    return {
      totalReturn: 22.5,
      annualizedReturn: 45.6,
      maxDrawdown: -3.2,
      sharpeRatio: 2.1,
      volatility: 0.8,
      bestPerformer: 'Morpho',
      worstPerformer: 'Compound',
    };
  }

  getHistory(days: number) {
    const data = [];
    let value = 10000;
    for (let i = 0; i < days; i++) {
      const change = (Math.random() - 0.48) * 200;
      value += change;
      data.push({
        day: i + 1,
        value: Math.round(value * 100) / 100,
        change: Math.round(change * 100) / 100,
      });
    }
    return data;
  }
}
