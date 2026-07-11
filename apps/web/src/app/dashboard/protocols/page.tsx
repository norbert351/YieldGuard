'use client';

import { useEffect, useState } from 'react';
import { Package, Plug, Scale } from 'lucide-react';
import { useWeb3ModalAccount } from '@web3modal/ethers/react';
import { useYieldGuard } from '@/hooks/useYieldGuard';
import { explorerAddress } from '@/lib/explorer';
import {
  EmptyState,
  LoadingState,
  SectionHeader,
  StatusBadge,
} from '@/components/ui/empty-state';

export default function ProtocolsPage() {
  const { isConnected, chainId } = useWeb3ModalAccount();
  const { getVaultData, rebalance, isOwner: checkOwner, cfg, getVaultEvents } = useYieldGuard();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [rebalancing, setRebalancing] = useState(false);
  const [rebalanceAmt, setRebalanceAmt] = useState(0);
  const [rebalanceDir, setRebalanceDir] = useState<'left' | 'right'>('right');
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    if (!isConnected) {
      setLoading(false);
      return;
    }
    let mounted = true;
    async function load() {
      try {
        const [vd, evs] = await Promise.all([getVaultData(), getVaultEvents(90)]);
        if (!mounted) return;
        setData(vd);
        setEvents(evs || []);
      } catch {
        if (mounted) setData(null);
      }
      if (mounted) setLoading(false);
    }
    load();
    const iv = setInterval(load, 30000);
    return () => {
      mounted = false;
      clearInterval(iv);
    };
  }, [isConnected, getVaultData, getVaultEvents]);

  useEffect(() => {
    if (!data) return;
    checkOwner().then(setIsOwner).catch(() => setIsOwner(false));
  }, [data, checkOwner]);

  const totalAllocated = data?.strategies
    ? data.strategies.reduce((s: number, st: any) => s + parseFloat(st.totalAssets), 0)
    : 0;
  const vaultTVL = data ? parseFloat(data.vault.totalAssets) : 0;

  const harvestYieldByProtocol: Record<string, number> = {};
  events
    .filter((e: any) => e.name === 'Harvested')
    .forEach((e: any) => {
      const yieldAmt = Number(e.args?.totalYield) / 1e18 || 0;
      harvestYieldByProtocol.all = (harvestYieldByProtocol.all || 0) + yieldAmt;
    });

  async function handleRebalance() {
    if (!data?.strategies || data.strategies.length < 2) return;
    const fromIdx = rebalanceDir === 'right' ? 0 : 1;
    const toIdx = rebalanceDir === 'right' ? 1 : 0;
    const fromAddr = data.strategies[fromIdx].address;
    const toAddr = data.strategies[toIdx].address;
    const amount = rebalanceAmt.toString();

    setRebalancing(true);
    try {
      await rebalance(fromAddr, toAddr, amount);
      window.location.reload();
    } catch (e: any) {
      alert(e?.shortMessage || e?.message || 'Rebalance failed');
    }
    setRebalancing(false);
  }

  if (!isConnected) {
    return (
      <EmptyState
        icon={Plug}
        title="Connect wallet"
        description="Connect to compare live strategy APY, allocation share, and health factors."
      />
    );
  }

  if (loading) return <LoadingState />;

  if (!data) {
    return (
      <EmptyState
        icon={Package}
        title="No vault found"
        description="Deploy a vault first to inspect protocol strategies and rebalance capital."
      />
    );
  }

  const sorted = [...data.strategies].sort(
    (a: any, b: any) => parseFloat(b.totalAssets) - parseFloat(a.totalAssets),
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Strategy performance"
        subtitle={`Live comparison from ${data.vault.name}`}
        action={
          harvestYieldByProtocol.all ? (
            <StatusBadge tone="success" label={`Harvested ${harvestYieldByProtocol.all.toFixed(4)} USDC`} />
          ) : (
            <StatusBadge tone="neutral" label="On-chain strategies" />
          )
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {sorted.map((s: any, i: number) => {
          const allocPct = totalAllocated > 0 ? (parseFloat(s.totalAssets) / totalAllocated) * 100 : 0;
          const tvlPct = vaultTVL > 0 ? (parseFloat(s.totalAssets) / vaultTVL) * 100 : 0;
          return (
            <div
              key={s.address}
              className={`rounded-2xl border p-5 transition-all ${
                s.isHealthy
                  ? 'border-white/5 bg-surface-900/50 hover:border-brand-500/20'
                  : 'border-error/30 bg-error/5'
              }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold ${
                      i === 0
                        ? 'bg-brand-500/15 text-brand-400'
                        : 'bg-violet-500/15 text-violet-300'
                    }`}
                  >
                    {s.protocol[0]}
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-semibold">{s.protocol}</h3>
                    <p className="font-mono text-[10px] text-surface-500">{s.name}</p>
                  </div>
                </div>
                <StatusBadge tone={s.isHealthy ? 'success' : 'error'} label={s.isHealthy ? 'Active' : 'Warning'} />
              </div>

              <div className="mb-4 grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
                  <div className="font-display text-lg font-bold text-success">{s.apy}%</div>
                  <div className="mt-0.5 text-[10px] text-surface-500">Current APY</div>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
                  <div className="font-display text-lg font-bold">
                    ${parseFloat(s.totalAssets).toLocaleString()}
                  </div>
                  <div className="mt-0.5 text-[10px] text-surface-500">Allocated</div>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
                  <div
                    className={`font-display text-lg font-bold ${
                      parseFloat(s.healthFactor) > 1.5
                        ? 'text-success'
                        : parseFloat(s.healthFactor) > 1.0
                          ? 'text-warning'
                          : 'text-error'
                    }`}
                  >
                    {parseFloat(s.healthFactor) > 100 ? '∞' : parseFloat(s.healthFactor).toFixed(2)}
                  </div>
                  <div className="mt-0.5 text-[10px] text-surface-500">Health</div>
                </div>
              </div>

              <div>
                <div className="mb-1 flex justify-between text-[10px] text-surface-500">
                  <span>Vault allocation {tvlPct.toFixed(1)}%</span>
                  <span>Of strategies {allocPct.toFixed(1)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      i === 0 ? 'bg-brand-500' : 'bg-violet-500'
                    }`}
                    style={{ width: `${tvlPct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isOwner && sorted.length >= 2 && (
        <div className="rounded-2xl border border-white/5 bg-surface-900/50 p-6">
          <div className="mb-1 flex items-center gap-2">
            <Scale className="h-4 w-4 text-brand-400" />
            <h3 className="font-display text-sm font-semibold">Rebalance allocation</h3>
          </div>
          <p className="mb-5 text-xs text-surface-400">
            Move funds between {sorted[0].protocol} and {sorted[1].protocol}
          </p>

          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-sm bg-brand-500" />
                <span className="font-medium">{sorted[0].protocol}</span>
                <span className="font-mono text-surface-400">
                  ${parseFloat(sorted[0].totalAssets).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-surface-400">
                  ${parseFloat(sorted[1].totalAssets).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
                <div className="h-2.5 w-2.5 rounded-sm bg-violet-500" />
                <span className="font-medium">{sorted[1].protocol}</span>
              </div>
            </div>
            <div className="flex h-3 overflow-hidden rounded-full bg-surface-800">
              <div
                className="h-full bg-brand-500 transition-all duration-200"
                style={{
                  width: `${totalAllocated > 0 ? (parseFloat(sorted[0].totalAssets) / totalAllocated) * 100 : 50}%`,
                }}
              />
              <div
                className="h-full bg-violet-500 transition-all duration-200"
                style={{
                  width: `${totalAllocated > 0 ? (parseFloat(sorted[1].totalAssets) / totalAllocated) * 100 : 50}%`,
                }}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-surface-400">Amount to move</span>
              <span className="font-mono font-semibold">${rebalanceAmt.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={1}
              max={Math.floor(
                Math.max(parseFloat(sorted[0].totalAssets), parseFloat(sorted[1].totalAssets)),
              )}
              value={rebalanceAmt}
              onChange={(e) => setRebalanceAmt(Number(e.target.value))}
              className="w-full accent-brand-500"
            />
            <div className="flex justify-between text-[10px] text-surface-500">
              <span>$1</span>
              <span>
                $
                {Math.floor(
                  Math.max(parseFloat(sorted[0].totalAssets), parseFloat(sorted[1].totalAssets)),
                ).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setRebalanceDir('right');
                  setRebalanceAmt(Math.floor(parseFloat(sorted[0].totalAssets) / 2));
                }}
                className={`flex-1 rounded-xl border px-3 py-2.5 text-xs font-medium transition-all ${
                  rebalanceDir === 'right'
                    ? 'border-brand-500/30 bg-brand-500/10 text-brand-400'
                    : 'border-white/10 bg-surface-800 text-surface-400 hover:border-white/20'
                }`}
              >
                {sorted[0].protocol} → {sorted[1].protocol}
              </button>
              <button
                onClick={() => {
                  setRebalanceDir('left');
                  setRebalanceAmt(Math.floor(parseFloat(sorted[1].totalAssets) / 2));
                }}
                className={`flex-1 rounded-xl border px-3 py-2.5 text-xs font-medium transition-all ${
                  rebalanceDir === 'left'
                    ? 'border-violet-500/30 bg-violet-500/10 text-violet-300'
                    : 'border-white/10 bg-surface-800 text-surface-400 hover:border-white/20'
                }`}
              >
                {sorted[1].protocol} → {sorted[0].protocol}
              </button>
            </div>

            <button
              onClick={handleRebalance}
              disabled={rebalancing || rebalanceAmt <= 0}
              className="mt-2 w-full rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-600 disabled:opacity-50"
            >
              {rebalancing
                ? 'Executing rebalance…'
                : `Move $${rebalanceAmt.toLocaleString()} ${
                    rebalanceDir === 'right'
                      ? `${sorted[0].protocol} → ${sorted[1].protocol}`
                      : `${sorted[1].protocol} → ${sorted[0].protocol}`
                  }`}
            </button>
          </div>
        </div>
      )}

      {sorted.length > 0 && (
        <div className="rounded-2xl border border-white/5 bg-surface-900/50 p-6">
          <h3 className="mb-4 font-display text-sm font-semibold">Strategy details</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-[11px] uppercase tracking-wider text-surface-500">
                  <th className="pb-3 font-medium">Protocol</th>
                  <th className="pb-3 font-medium">Address</th>
                  <th className="pb-3 font-medium">Allocated</th>
                  <th className="pb-3 font-medium">APY</th>
                  <th className="pb-3 font-medium">Health</th>
                  <th className="pb-3 font-medium">TVL share</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((s: any, i: number) => {
                  const tvlShare = vaultTVL > 0 ? (parseFloat(s.totalAssets) / vaultTVL) * 100 : 0;
                  return (
                    <tr key={s.address} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="py-3.5">
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold ${
                              i === 0
                                ? 'bg-brand-500/20 text-brand-400'
                                : 'bg-violet-500/20 text-violet-300'
                            }`}
                          >
                            {s.protocol[0]}
                          </div>
                          <span className="font-medium">{s.protocol}</span>
                        </div>
                      </td>
                      <td className="py-3.5 font-mono text-[11px] text-surface-400">
                        <a
                          href={explorerAddress(chainId || 1952, s.address)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="transition-colors hover:text-brand-400"
                        >
                          {s.address.slice(0, 8)}…
                        </a>
                      </td>
                      <td className="py-3.5 font-mono">${parseFloat(s.totalAssets).toLocaleString()}</td>
                      <td className="py-3.5 font-mono text-success">{s.apy}%</td>
                      <td className="py-3.5">
                        <span
                          className={`font-mono ${
                            parseFloat(s.healthFactor) > 1.5
                              ? 'text-success'
                              : parseFloat(s.healthFactor) > 1.0
                                ? 'text-warning'
                                : 'text-error'
                          }`}
                        >
                          {parseFloat(s.healthFactor) > 100
                            ? '∞'
                            : parseFloat(s.healthFactor).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-800">
                            <div
                              className={`h-full rounded-full ${i === 0 ? 'bg-brand-500' : 'bg-violet-500'}`}
                              style={{ width: `${tvlShare}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-surface-400">{tvlShare.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <StatusBadge
                          tone={s.isHealthy ? 'success' : 'error'}
                          label={s.isHealthy ? 'Active' : 'Warning'}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-white/5 bg-white/[0.015] p-4">
        <div className="flex flex-col gap-2 text-xs text-surface-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Vault:{' '}
            <span className="font-mono text-surface-400">{cfg.vault}</span>
          </span>
          <span className="font-mono">
            {data.assetSymbol} · {data.vault.name}
          </span>
        </div>
      </div>
    </div>
  );
}
