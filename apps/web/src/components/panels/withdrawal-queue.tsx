'use client';

import { Coins, Vault } from 'lucide-react';
import { StatusBadge } from '@/components/ui/empty-state';

interface WithdrawalQueuePanelProps {
  strategies: any[];
  unallocated: number;
  totalValue: number;
}

export default function WithdrawalQueuePanel({
  strategies,
  unallocated,
  totalValue,
}: WithdrawalQueuePanelProps) {
  const totalAllocated = strategies.reduce(
    (s: number, st: any) => s + parseFloat(st.totalAssets),
    0,
  );

  // Estimate withdrawal speed per strategy
  const strategyItems = strategies.map((s: any) => {
    const alloc = parseFloat(s.totalAssets);
    const pct = totalValue > 0 ? (alloc / totalValue) * 100 : 0;
    // Simulated unwind time: Aave = ~12s (1 block), Morpho = ~12s
    const blocks = 1;
    return {
      protocol: s.protocol,
      allocated: alloc,
      pct,
      blocksToFree: blocks,
      estimatedTime: `${blocks} block${blocks > 1 ? 's' : ''}`,
      canWithdraw: true,
    };
  });

  return (
    <div className="rounded-2xl border border-white/5 bg-surface-900/50 p-5">
      <div className="mb-3 flex items-center gap-2">
        <Coins className="h-4 w-4 text-brand-400" strokeWidth={1.85} />
        <h3 className="font-display text-sm font-semibold">Liquidity breakdown</h3>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-surface-400">
            <Vault className="h-3 w-3" />
            Idle in vault
          </div>
          <div className="font-display mt-1 text-lg font-bold text-success">
            ${unallocated.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
          <div className="mt-0.5 text-[10px] text-surface-500">
            {totalValue > 0
              ? `${((unallocated / totalValue) * 100).toFixed(1)}% of TVL`
              : '—'}
          </div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-surface-400">
            <Coins className="h-3 w-3" />
            In strategies
          </div>
          <div className="font-display mt-1 text-lg font-bold text-brand-300">
            ${totalAllocated.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
          <div className="mt-0.5 text-[10px] text-surface-500">
            {totalValue > 0
              ? `${((totalAllocated / totalValue) * 100).toFixed(1)}% of TVL`
              : '—'}
          </div>
        </div>
      </div>

      {/* Strategy detail breakdown */}
      <div className="space-y-2">
        {strategyItems.map((item) => (
          <div
            key={item.protocol}
            className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5"
          >
            <div className="flex items-center gap-2">
              <div className="text-xs font-medium">{item.protocol}</div>
              <StatusBadge tone="success" label={`${item.blocksToFree} block`} />
            </div>
            <div className="text-right">
              <div className="text-xs font-mono font-medium">
                ${item.allocated.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div className="text-[10px] text-surface-500">{item.pct.toFixed(1)}% of TVL</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-lg border border-white/5 bg-white/[0.01] px-3 py-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-surface-400">Estimated total withdrawal time</span>
          <span className="font-mono text-surface-200">1 block (~12s)</span>
        </div>
        <p className="mt-1 text-[10px] leading-relaxed text-surface-500">
          All strategies support instant withdrawal. Large amounts may require sequential blocks.
        </p>
      </div>
    </div>
  );
}
