'use client';

import { Info, Shield } from 'lucide-react';

interface RiskScorePanelProps {
  risk: any; // PortfolioRisk
}

function RiskRing({ score }: { score: number }) {
  const color =
    score >= 70 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#f43f5e';
  const r = 38;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  return (
    <svg width="100" height="100" viewBox="0 0 100 100" className="shrink-0">
      <circle
        cx="50" cy="50" r={r}
        fill="none" stroke="rgba(255,255,255,0.06)"
        strokeWidth="8"
      />
      <circle
        cx="50" cy="50" r={r}
        fill="none" stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 50 50)"
        className="transition-all duration-700"
      />
      <text
        x="50" y="48"
        textAnchor="middle"
        fontSize="26"
        fontWeight="700"
        fill="white"
        fontFamily="var(--font-syne), sans-serif"
      >
        {score}
      </text>
      <text
        x="50" y="62"
        textAnchor="middle"
        fontSize="10"
        fill="#91919f"
      >
        /100
      </text>
    </svg>
  );
}

function GradeBadge({ grade }: { grade: string }) {
  const colors: Record<string, string> = {
    'A': 'bg-success/15 text-success border-success/25',
    'A-': 'bg-success/12 text-success border-success/20',
    'B+': 'bg-success/10 text-success border-success/15',
    'B': 'bg-success/8 text-success border-success/12',
    'B-': 'bg-warning/10 text-warning border-warning/20',
    'C+': 'bg-warning/15 text-warning border-warning/25',
    'C': 'bg-warning/20 text-warning border-warning/30',
    'C-': 'bg-error/15 text-error border-error/25',
    'D': 'bg-error/20 text-error border-error/30',
  };
  return (
    <span className={`rounded-lg border px-2 py-1 font-display text-lg font-bold ${colors[grade] || colors['B']}`}>
      {grade}
    </span>
  );
}

export default function RiskScorePanel({ risk }: RiskScorePanelProps) {
  if (!risk || risk.strategyScores.length === 0) {
    return (
      <div className="rounded-2xl border border-white/5 bg-surface-900/50 p-5">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-brand-400" strokeWidth={1.85} />
          <h3 className="font-display text-sm font-semibold">Risk score</h3>
        </div>
        <p className="mt-4 text-xs text-surface-500">Deploy strategies to see risk analysis.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-surface-900/50 p-5">
      <div className="mb-1 flex items-center gap-2">
        <Shield className="h-4 w-4 text-brand-400" strokeWidth={1.85} />
        <h3 className="font-display text-sm font-semibold">Risk score</h3>
      </div>

      <div className="mt-3 flex items-center gap-4">
        <RiskRing score={risk.overallScore} />
        <div className="space-y-1.5">
          <GradeBadge grade={risk.overallGrade} />
          <div className="text-xs text-surface-400">
            Weighted APY <span className="font-mono text-surface-200">{risk.weightedApy}%</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-surface-400">Volatility</span>
            <span
              className={`font-medium ${
                risk.volatility === 'low'
                  ? 'text-success'
                  : risk.volatility === 'moderate'
                    ? 'text-warning'
                    : 'text-error'
              }`}
            >
              {risk.volatility}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-surface-400">Concentration</span>
            <span
              className={`font-medium ${
                risk.concentrationRisk < 30
                  ? 'text-success'
                  : risk.concentrationRisk < 60
                    ? 'text-warning'
                    : 'text-error'
              }`}
            >
              {risk.concentrationRisk}/100
            </span>
          </div>
        </div>
      </div>

      {/* Per-strategy breakdown */}
      <div className="mt-4 space-y-2.5">
        {risk.strategyScores.map((ss: any) => (
          <div key={ss.protocol} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">{ss.protocol}</span>
                <span className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-mono text-surface-400">
                  {ss.grade}
                </span>
              </div>
              <span className="font-display text-base font-bold text-white">{ss.score}</span>
            </div>
            <div className="space-y-1">
              {ss.factors.map((f: any) => (
                <div key={f.label} className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-800">
                    <div
                      className={`h-full rounded-full transition-all ${
                        f.score >= 60 ? 'bg-success' : f.score >= 40 ? 'bg-warning' : 'bg-error'
                      }`}
                      style={{ width: `${f.score}%` }}
                    />
                  </div>
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span className="truncate text-[10px] text-surface-400" title={f.detail}>
                      {f.label}
                    </span>
                    <span className="shrink-0 text-[10px] font-mono text-surface-500">{f.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-start gap-1.5 rounded-lg bg-white/[0.01] p-2.5">
        <Info className="mt-0.5 h-3 w-3 shrink-0 text-surface-500" />
        <p className="text-[10px] leading-relaxed text-surface-500">
          Score blends health factor, protocol quality, APY stability, and diversification. Higher = safer.
        </p>
      </div>
    </div>
  );
}
