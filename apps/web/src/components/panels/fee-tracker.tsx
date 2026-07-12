'use client';

import { useCallback, useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { useYieldGuard } from '@/hooks/useYieldGuard';

interface FeeMetrics {
  totalYield: number;
  feeRate: number;
  harvestCount: number;
}

export function useFeeTracker() {
  const { getVaultEvents } = useYieldGuard();
  const [metrics, setMetrics] = useState<FeeMetrics>({
    totalYield: 0,
    feeRate: 10,
    harvestCount: 0,
  });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const events = await getVaultEvents(90);
      const harvestEvents = events.filter((e: any) => e.name === 'Harvested');
      let totalY = 0;
      let totalF = 0;
      for (const e of harvestEvents) {
        totalY += Number(e.args?.totalYield) / 1e18 || 0;
        totalF += Number(e.args?.fees) / 1e18 || 0;
      }
      const actualRate = totalY > 0 ? Math.round((totalF / totalY) * 100) : 10;
      setMetrics({
        totalYield: Math.round(totalY * 10000) / 10000,
        feeRate: actualRate,
        harvestCount: harvestEvents.length,
      });
    } catch { /* keep defaults */ }
    setLoading(false);
  }, [getVaultEvents]);

  useEffect(() => { refresh(); }, [refresh]);

  return { metrics, loading, refresh };
}

export default function FeeTrackerPanel({
  metrics,
  tvl,
}: {
  metrics: FeeMetrics;
  tvl: number;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-surface-900/50 p-5">
      <div className="mb-3 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-brand-400" strokeWidth={1.85} />
        <h3 className="font-display text-sm font-semibold">Yield earned</h3>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="text-[10px] font-medium uppercase tracking-wider text-surface-500">Yield generated</div>
          <div className="mt-1 font-display text-lg font-bold text-success">
            {metrics.totalYield > 0 ? `${metrics.totalYield.toLocaleString()} USDC` : '—'}
          </div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="text-[10px] font-medium uppercase tracking-wider text-surface-500">Your share</div>
          <div className="mt-1 font-display text-lg font-bold text-white">
            {metrics.totalYield > 0
              ? `${(metrics.totalYield * (1 - metrics.feeRate / 100)).toLocaleString()} USDC`
              : '—'}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.01] px-3 py-2 text-xs">
          <span className="text-surface-400">Performance fee</span>
          <span className="font-mono font-semibold text-surface-200">{metrics.feeRate}%</span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.01] px-3 py-2 text-xs">
          <span className="text-surface-400">Harvest cycles</span>
          <span className="font-mono font-semibold text-surface-200">{metrics.harvestCount}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.01] px-3 py-2 text-xs">
          <span className="text-surface-400">Yield / TVL ratio</span>
          <span className="font-mono font-semibold text-surface-200">
            {tvl > 0
              ? `${((metrics.totalYield / tvl) * 100).toFixed(2)}%`
              : '—'}
          </span>
        </div>
      </div>

      {metrics.harvestCount > 0 && (
        <div className="mt-3 flex items-center gap-1.5 text-[10px] text-surface-500">
          <TrendingUp className="h-3 w-3" />
          Last {metrics.harvestCount} harvest{metrics.harvestCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
