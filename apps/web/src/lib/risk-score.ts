/* ═══════════════════════════════════════
   YieldGuard — Risk Score Engine
   Computes 0-100 score per strategy & overall
   ═══════════════════════════════════════ */

export interface RiskFactorDetail {
  label: string;
  score: number; // 0-100
  weight: number; // 0-1
  detail: string;
}

export interface StrategyRisk {
  protocol: string;
  score: number;
  grade: string;
  factors: RiskFactorDetail[];
  apy: number;
  healthFactor: number;
  allocationPct: number;
}

export interface PortfolioRisk {
  overallScore: number;
  overallGrade: string;
  weightedApy: number;
  volatility: 'low' | 'moderate' | 'high';
  concentrationRisk: number; // 0-100
  strategyScores: StrategyRisk[];
}

function grade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'A-';
  if (score >= 70) return 'B+';
  if (score >= 60) return 'B';
  if (score >= 50) return 'B-';
  if (score >= 40) return 'C+';
  if (score >= 30) return 'C';
  if (score >= 20) return 'C-';
  return 'D';
}

export function computePortfolioRisk(
  strategies: any[],
  totalValue: number,
): PortfolioRisk {
  const n = strategies.length;
  if (n === 0) {
    return {
      overallScore: 50,
      overallGrade: 'B-',
      weightedApy: 0,
      volatility: 'low',
      concentrationRisk: 0,
      strategyScores: [],
    };
  }

  const strategyScores: StrategyRisk[] = strategies.map((s) => {
    const hf = parseFloat(s.healthFactor);
    const apy = parseFloat(s.apy);
    const alloc = totalValue > 0 ? (parseFloat(s.totalAssets) / totalValue) * 100 : 0;

    // Health factor score (0-40)
    const hfNorm = Math.min(hf / 3.0, 1);
    const hfScore = hfNorm * 40;

    // Protocol score (0-25)
    const protocolName = (s.protocol || '').toLowerCase();
    const protocolScore =
      protocolName.includes('aave')
        ? 22
        : protocolName.includes('morpho')
          ? 18
          : 15;

    // APY stability (0-20)
    // Higher APY = slightly less stable, but healthy = stable
    const apyStability = s.isHealthy
      ? Math.max(20 - apy * 0.5, 5)
      : 5;

    // Concentration penalty (0-15)
    // Over 50% in one strategy = penalty
    const concScore = alloc > 80 ? 3 : alloc > 60 ? 7 : alloc > 40 ? 10 : 13;

    const total = Math.round(hfScore + protocolScore + apyStability + concScore);
    const clamped = Math.min(Math.max(total, 0), 100);

    return {
      protocol: s.protocol,
      score: clamped,
      grade: grade(clamped),
      factors: [
        {
          label: 'Health Factor',
          score: Math.round(hfScore),
          weight: 0.4,
          detail: `HF ${hf > 100 ? '∞' : hf.toFixed(2)} / 3.0`,
        },
        {
          label: 'Protocol Quality',
          score: Math.round(protocolScore),
          weight: 0.25,
          detail: `${s.protocol} · audited`,
        },
        {
          label: 'APY Stability',
          score: Math.round(apyStability),
          weight: 0.2,
          detail: `${apy.toFixed(1)}% APY · ${s.isHealthy ? 'healthy' : 'warning'}`,
        },
        {
          label: 'Diversification',
          score: Math.round(concScore),
          weight: 0.15,
          detail: `${alloc.toFixed(1)}% of vault`,
        },
      ],
      apy,
      healthFactor: hf,
      allocationPct: alloc,
    };
  });

  // Overall score = weighted by allocation
  const totalAlloc = strategyScores.reduce((s, ss) => s + ss.allocationPct, 0);
  const overallScore =
    totalAlloc > 0
      ? Math.round(
          strategyScores.reduce(
            (s, ss) => s + ss.score * (ss.allocationPct / totalAlloc),
            0,
          ),
        )
      : 0;

  // Weighted APY
  const weightedApy =
    totalAlloc > 0
      ? strategyScores.reduce(
          (s, ss) => s + ss.apy * (ss.allocationPct / totalAlloc),
          0,
        )
      : 0;

  // Concentration risk: 0 if evenly split, 100 if 1 strategy dominates
  const idealSplit = 100 / n;
  const concRisk =
    n > 1
      ? Math.round(
          strategyScores.reduce(
            (s, ss) => s + Math.abs(ss.allocationPct - idealSplit),
            0,
          ) / 2,
        )
      : n === 1
        ? 80
        : 0;

  // Volatility estimate
  const apySpread = Math.max(...strategyScores.map((s) => s.apy)) - Math.min(...strategyScores.map((s) => s.apy));
  const volatility =
    apySpread > 5 ? 'high' : apySpread > 2 ? 'moderate' : 'low';

  return {
    overallScore: Math.min(overallScore, 100),
    overallGrade: grade(Math.min(overallScore, 100)),
    weightedApy: Math.round(weightedApy * 100) / 100,
    volatility,
    concentrationRisk: concRisk,
    strategyScores,
  };
}
