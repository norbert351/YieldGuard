// ── Protocol Types ──
export interface Protocol {
  id: string;
  name: string;
  color: string;
  tvl: string;
  supportedAssets: number;
}

export interface ProtocolRates {
  asset: string;
  aave: number;
  morpho: number;
  compound: number;
  best: string;
}

// ── Position Types ──
export interface Position {
  protocol: string;
  asset: string;
  deposited: number;
  apy: number;
  healthFactor: number;
  status: 'Active' | 'Warning' | 'Liquidating';
}

export interface PortfolioOverview {
  totalValue: number;
  avgApy: number;
  activeProtocols: number;
  healthFactor: number;
  status: string;
}

// ── Simulation Types ──
export interface SimulationConfig {
  capital: number;
  duration: number;
  risk: 'Conservative' | 'Moderate' | 'Aggressive';
  market: 'Bull Market' | 'Bear Market' | 'Volatile' | 'Normal';
}

export interface SimulationResults {
  finalValue: number;
  totalReturn: number;
  annualizedReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  volatility: number;
}

export interface SimulationRun {
  id: string;
  config: SimulationConfig;
  status: string;
  results: SimulationResults;
  createdAt: string;
}

// ── Analytics Types ──
export interface AnalyticsMetrics {
  totalReturn: number;
  annualizedReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  volatility: number;
  bestPerformer: string;
  worstPerformer: string;
}

export interface HistoryPoint {
  day: number;
  value: number;
  change: number;
}
