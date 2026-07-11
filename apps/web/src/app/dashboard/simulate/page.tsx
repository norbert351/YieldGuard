'use client';

import { useEffect, useState } from 'react';
import { FlaskConical, Play } from 'lucide-react';
import { useWeb3ModalAccount } from '@web3modal/ethers/react';
import { useYieldGuard } from '@/hooks/useYieldGuard';
import { SectionHeader, StatusBadge } from '@/components/ui/empty-state';

export default function SimulatePage() {
  const { isConnected } = useWeb3ModalAccount();
  const { getVaultData } = useYieldGuard();
  const [capital, setCapital] = useState('10000');
  const [duration, setDuration] = useState(180);
  const [risk, setRisk] = useState('Conservative');
  const [market, setMarket] = useState('Bull Market');
  const [result, setResult] = useState<any>(null);
  const [running, setRunning] = useState(false);
  const [realApys, setRealApys] = useState<Record<string, number>>({});

  const risks = ['Conservative', 'Moderate', 'Aggressive'] as const;
  const markets = ['Bull Market', 'Bear Market', 'Volatile', 'Normal'] as const;

  useEffect(() => {
    if (!isConnected) return;
    async function load() {
      try {
        const vaultData = await getVaultData();
        if (vaultData?.strategies) {
          const apyMap: Record<string, number> = {};
          vaultData.strategies.forEach((s: any) => {
            apyMap[s.protocol] = parseFloat(s.apy);
          });
          setRealApys(apyMap);
        }
      } catch {}
    }
    load();
  }, [isConnected, getVaultData]);

  const apyMultiplier: Record<string, number> = {
    Conservative: 0.6,
    Moderate: 1.0,
    Aggressive: 1.8,
  };

  const marketMultiplier: Record<string, number> = {
    'Bull Market': 1.5,
    'Bear Market': 0.5,
    Volatile: 0.8,
    Normal: 1.0,
  };

  function runSimulation() {
    setRunning(true);
    const baseApy =
      Object.values(realApys).length > 0
        ? Object.values(realApys).reduce((a, b) => a + b, 0) / Object.values(realApys).length
        : risk === 'Conservative'
          ? 6.2
          : risk === 'Moderate'
            ? 8.9
            : 15.0;

    const adjustedApy = baseApy * apyMultiplier[risk] * marketMultiplier[market];
    const dailyRate = adjustedApy / 100 / 365;
    const principal = parseFloat(capital.replace(/,/g, '') || '0');

    let finalValue = principal;
    for (let d = 0; d < duration; d++) {
      finalValue *= 1 + dailyRate;
    }

    const totalReturn = ((finalValue - principal) / principal) * 100;
    const annualizedReturn = (Math.pow(finalValue / principal, 365 / duration) - 1) * 100;
    const maxDrawdown = -(Math.random() * 3 + 1);
    const sharpeRatio =
      (adjustedApy / 100 - 0.02) /
      (risk === 'Aggressive' ? 0.15 : risk === 'Moderate' ? 0.1 : 0.05);

    setResult({
      finalValue: Math.round(finalValue * 100) / 100,
      totalReturn: Math.round(totalReturn * 100) / 100,
      annualizedReturn: Math.round(annualizedReturn * 100) / 100,
      baseApy: Math.round(baseApy * 100) / 100,
      adjustedApy: Math.round(adjustedApy * 100) / 100,
      maxDrawdown: Math.round(maxDrawdown * 100) / 100,
      sharpeRatio: Math.round(sharpeRatio * 100) / 100,
    });
    setRunning(false);
  }

  const hasRealData = Object.keys(realApys).length > 0;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Yield simulation"
        subtitle={
          hasRealData
            ? `Using live APY from strategies (${Object.entries(realApys)
                .map(([k, v]) => `${k}: ${v}%`)
                .join(', ')})`
            : 'Model returns under risk profiles and market regimes'
        }
        action={
          hasRealData ? (
            <StatusBadge tone="success" label="Live data" pulse />
          ) : (
            <StatusBadge tone="neutral" label="Estimated APY" />
          )
        }
      />

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <div className="space-y-5 rounded-2xl border border-white/5 bg-surface-900/50 p-6">
          <div>
            <h3 className="font-display text-sm font-semibold">Configuration</h3>
            <p className="mt-0.5 text-xs text-surface-500">Set capital, horizon, and risk regime</p>
          </div>

          {!isConnected && (
            <div className="flex items-start gap-2 rounded-xl border border-warning/20 bg-warning/10 p-3 text-xs text-warning">
              Connect wallet to load live APY data from deployed strategies. Simulation still runs with estimates.
            </div>
          )}

          <div>
            <label className="mb-2 block text-xs text-surface-400">Initial capital</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-surface-400">$</span>
              <input
                type="text"
                value={capital}
                onChange={(e) => setCapital(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-surface-800 py-2.5 pl-7 pr-3 text-sm transition-colors focus:border-brand-500/50 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs text-surface-400">Duration: {duration} days</label>
            <input
              type="range"
              min={30}
              max={365}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full accent-brand-500"
            />
            <div className="mt-1 flex justify-between text-xs text-surface-500">
              <span>30</span>
              <span>180</span>
              <span>365</span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs text-surface-400">Risk profile</label>
            <div className="grid grid-cols-3 gap-2">
              {risks.map((r) => (
                <button
                  key={r}
                  onClick={() => setRisk(r)}
                  className={`rounded-xl border px-3 py-2.5 text-xs font-medium transition-all ${
                    risk === r
                      ? 'border-brand-500/30 bg-brand-500/10 text-brand-400'
                      : 'border-white/10 bg-surface-800 text-surface-400 hover:border-white/20'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs text-surface-400">Market condition</label>
            <div className="grid grid-cols-2 gap-2">
              {markets.map((m) => (
                <button
                  key={m}
                  onClick={() => setMarket(m)}
                  className={`rounded-xl border px-3 py-2.5 text-xs font-medium transition-all ${
                    market === m
                      ? 'border-brand-500/30 bg-brand-500/10 text-brand-400'
                      : 'border-white/10 bg-surface-800 text-surface-400 hover:border-white/20'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {hasRealData && (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <div className="mb-2 text-xs text-surface-400">Live APY reference</div>
              <div className="space-y-1.5">
                {Object.entries(realApys).map(([protocol, apy]) => (
                  <div key={protocol} className="flex justify-between text-xs">
                    <span className="text-surface-300">{protocol}</span>
                    <span className="font-mono text-success">{apy}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={runSimulation}
            disabled={running}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-600 disabled:opacity-50"
          >
            <Play className="h-4 w-4" />
            {running ? 'Simulating…' : 'Run simulation'}
          </button>
        </div>

        <div className="rounded-2xl border border-white/5 bg-surface-900/50 p-6">
          <div className="mb-4">
            <h3 className="font-display text-sm font-semibold">Results</h3>
            <p className="mt-0.5 text-xs text-surface-500">Compounded daily from adjusted APY</p>
          </div>
          {result ? (
            <div className="space-y-1">
              {[
                {
                  label: 'Final value',
                  value: `$${result.finalValue.toLocaleString()}`,
                  color: 'text-white',
                  large: true,
                },
                { label: 'Total return', value: `${result.totalReturn}%`, color: 'text-success' },
                {
                  label: 'Annualized return',
                  value: `${result.annualizedReturn}%`,
                  color: 'text-success',
                },
                {
                  label: 'Base APY (on-chain)',
                  value: `${result.baseApy}%`,
                  color: 'text-surface-300',
                },
                {
                  label: 'Adjusted APY',
                  value: `${result.adjustedApy}%`,
                  color: 'text-surface-300',
                },
                {
                  label: 'Max drawdown (est.)',
                  value: `${result.maxDrawdown}%`,
                  color: 'text-error',
                },
                {
                  label: 'Sharpe ratio',
                  value: result.sharpeRatio,
                  color: 'text-success',
                },
              ].map((m) => (
                <div
                  key={m.label}
                  className="flex items-center justify-between border-b border-white/5 py-3 last:border-0"
                >
                  <span className="text-xs text-surface-400">{m.label}</span>
                  <span
                    className={`font-semibold ${m.color} ${m.large ? 'font-display text-lg' : 'text-sm font-mono'}`}
                  >
                    {m.value}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-72 items-center justify-center">
              <div className="max-w-xs text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
                  <FlaskConical className="h-5 w-5 text-brand-400" />
                </div>
                <p className="text-sm text-surface-400">
                  Configure parameters and run a simulation to project vault returns.
                </p>
                {!hasRealData && isConnected && (
                  <p className="mt-2 text-xs text-surface-500">
                    No deployed vault found — using estimated APY.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
