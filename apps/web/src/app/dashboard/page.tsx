'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Package,
  Plug,
  RefreshCw,
} from 'lucide-react';
import { useWeb3ModalAccount } from '@web3modal/ethers/react';
import CardSlider from '@/components/ui/card-slider';
import useScrollReveal from '@/hooks/useScrollReveal';
import { useYieldGuard } from '@/hooks/useYieldGuard';
import { explorerAddress } from '@/lib/explorer';
import DepositModal from '@/components/deposit-modal';
import WithdrawModal from '@/components/withdraw-modal';
import {
  EmptyState,
  LoadingState,
  SectionHeader,
  StatusBadge,
} from '@/components/ui/empty-state';
import WithdrawalQueuePanel from '@/components/panels/withdrawal-queue';
import RiskScorePanel from '@/components/panels/risk-score';
import FeeTrackerPanel, { useFeeTracker } from '@/components/panels/fee-tracker';
import AutoCompoundPanel from '@/components/panels/auto-compound';
import AlertPanel, { useAlerts } from '@/components/panels/alert-panel';
import { computePortfolioRisk } from '@/lib/risk-score';
import { XLAYER_TESTNET, isSupportedYieldGuardChain } from '@/lib/xlayer';

export const dynamic = 'force-dynamic';

function HealthGauge({ value }: { value: number }) {
  const color = value > 1.5 ? '#22c55e' : value > 1.0 ? '#f59e0b' : '#f43f5e';
  const angle = Math.min(value / 2.5, 1) * 180;
  return (
    <div className="flex flex-col items-center">
      <svg width="112" height="66" viewBox="0 0 112 66">
        <path
          d="M8 58 A48 48 0 0 1 104 58"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M8 58 A48 48 0 0 1 104 58"
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${(angle / 360) * 2 * Math.PI * 48} ${2 * Math.PI * 48}`}
          transform="rotate(180 56 58)"
        />
        <text x="56" y="52" textAnchor="middle" fontSize="16" fontWeight="700" fill="white" fontFamily="var(--font-syne), sans-serif">
          {value > 100 ? '∞' : value.toFixed(2)}
        </text>
      </svg>
      <span className="mt-0.5 text-[10px] uppercase tracking-wider text-surface-500">Health factor</span>
    </div>
  );
}

function riskBadge(hf: number) {
  if (hf > 2.0 || hf > 100) return { label: 'Safe', tone: 'success' as const };
  if (hf > 1.5) return { label: 'Stable', tone: 'success' as const };
  if (hf > 1.0) return { label: 'Monitor', tone: 'warning' as const };
  return { label: 'Danger', tone: 'error' as const };
}

function DiversificationBar({ strategies, total }: { strategies: any[]; total: number }) {
  if (total === 0) {
    return (
      <div className="h-2.5 overflow-hidden rounded-full bg-surface-800">
        <div className="h-full w-full rounded-full bg-surface-700" />
      </div>
    );
  }
  const colors = ['bg-brand-500', 'bg-violet-500', 'bg-amber-500', 'bg-emerald-500'];
  const allocated = strategies.reduce((s: number, st: any) => s + parseFloat(st.totalAssets), 0);
  return (
    <div className="flex h-2.5 overflow-hidden rounded-full bg-surface-800">
      {strategies.map((s: any, i: number) => {
        const pct = (parseFloat(s.totalAssets) / total) * 100;
        return pct > 0 ? (
          <div
            key={s.address}
            className={`${colors[i % colors.length]} h-full transition-all`}
            style={{ width: `${pct}%` }}
            title={`${s.protocol}: ${pct.toFixed(1)}%`}
          />
        ) : null;
      })}
      {allocated < total && (
        <div
          className="h-full bg-surface-600"
          style={{ width: `${((total - allocated) / total) * 100}%` }}
          title={`Unallocated: ${(((total - allocated) / total) * 100).toFixed(1)}%`}
        />
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { address, isConnected, chainId } = useWeb3ModalAccount();
  const {
    getVaultData,
    allocateToStrategy,
    harvestAll,
    emergencyDeallocate,
    isOwner: checkOwner,
  } = useYieldGuard();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [allocating, setAllocating] = useState<string | null>(null);
  const [allocAmounts, setAllocAmounts] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const feeTracker = useFeeTracker();
  const alerts = useAlerts(data);

  const refreshVaultData = useCallback(async () => {
    const vaultData = await getVaultData();
    setData(vaultData);
    feeTracker.refresh();
    return vaultData;
  }, [getVaultData, feeTracker]);

  const switchToTestnet = useCallback(async () => {
    const eth = (window as any).ethereum;
    if (typeof window === 'undefined' || !eth) {
      window.alert('Open a wallet that supports network switching and add X Layer Testnet (chain 1952).');
      return;
    }

    try {
      await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: XLAYER_TESTNET.chainIdHex }],
      });
    } catch (error: any) {
      if (error?.code === 4902) {
        await eth.request({
          method: 'wallet_addEthereumChain',
          params: [XLAYER_TESTNET],
        });
        return;
      }

      setActionError(error?.message || 'Failed to switch network');
    }
  }, []);

  useEffect(() => {
    if (!isConnected || !address) {
      setLoading(false);
      return;
    }
    let mounted = true;
    async function load() {
      try {
        const vaultData = await getVaultData();
        if (!mounted) return;
        setData(vaultData);
        setError(null);
        setActionError(null);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.shortMessage || e?.message || 'Failed to load on-chain data');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [address, isConnected, getVaultData]);

  useEffect(() => {
    if (!data) {
      setIsOwner(false);
      return;
    }
    checkOwner().then(setIsOwner).catch(() => setIsOwner(false));
  }, [data, checkOwner]);

  const harvest = useCallback(async () => {
    try {
      await harvestAll();
      await refreshVaultData();
      setActionMessage('Harvest completed. Vault metrics refreshed.');
      setActionError(null);
    } catch (e: any) {
      setActionError(e?.shortMessage || e?.message || 'Harvest failed');
    }
  }, [harvestAll, refreshVaultData]);

  const handleAllocate = useCallback(
    async (strategy: string, label: string) => {
      if (!data) return;
      const idle = data.vault.idleBalance || '0';
      const amt = allocAmounts[label] || idle;
      if (!amt || parseFloat(amt) <= 0) {
        setActionError('Enter an amount before allocating.');
        return;
      }
      setAllocating(label);
      try {
        await allocateToStrategy(strategy, amt);
        await refreshVaultData();
        setAllocAmounts((prev) => ({ ...prev, [label]: '' }));
        setActionMessage(`Allocated ${amt} USDC to ${label}.`);
        setActionError(null);
      } catch (e: any) {
        setActionError(e?.shortMessage || e?.message || 'Allocation failed');
      }
      setAllocating(null);
    },
    [data, allocAmounts, allocateToStrategy, refreshVaultData],
  );

  const totalValue = data ? parseFloat(data.vault.totalAssets) : 0;
  const avgApy = data?.strategies?.length
    ? data.strategies.reduce((s: number, st: any) => s + parseFloat(st.apy), 0) /
      data.strategies.length
    : 0;
  const hf = data ? parseFloat(data.vault.healthFactor) : 0;
  const totalAllocated = data?.strategies
    ? data.strategies.reduce((s: number, st: any) => s + parseFloat(st.totalAssets), 0)
    : 0;
  const vaultIdle = data ? parseFloat(data.vault.idleBalance || '0') : 0;
  const unallocated = vaultIdle;

  // Compute risk
  const portfolioRisk = data?.strategies
    ? computePortfolioRisk(data.strategies, totalValue)
    : null;

  const cards = [
    {
      label: 'Vault TVL',
      value: `$${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      hint: 'On-chain total',
      up: true,
    },
    {
      label: 'Average APY',
      value: `${avgApy.toFixed(2)}%`,
      hint: `${data?.strategies?.length || 0} strategies`,
      up: true,
    },
    {
      label: 'Active protocols',
      value: `${data?.strategies?.length || 0}`,
      hint: data?.strategies?.map((s: any) => s.protocol).join(' · ') || '—',
      up: false,
    },
    {
      label: 'Portfolio risk',
      value: portfolioRisk ? `${portfolioRisk.overallScore}/100 ${portfolioRisk.overallGrade}` : '—',
      hint: portfolioRisk?.concentrationRisk !== undefined
        ? `Concentration ${portfolioRisk.concentrationRisk}/100 · ${portfolioRisk.volatility} vol`
        : '—',
      up: portfolioRisk ? portfolioRisk.overallScore >= 60 : false,
    },
  ];
  const cardsRef = useScrollReveal<HTMLDivElement>({ stagger: true, threshold: 0.2 });
  const chartRef = useScrollReveal<HTMLDivElement>({ animation: 'fade-left', delay: 100 });
  const healthRef = useScrollReveal<HTMLDivElement>({ animation: 'fade-right', delay: 200 });
  const diversRef = useScrollReveal<HTMLDivElement>({ animation: 'fade-up', threshold: 0.15 });
  const panelsRow1Ref = useScrollReveal<HTMLDivElement>({ animation: 'fade-up', delay: 150, threshold: 0.1 });
  const panelsRow2Ref = useScrollReveal<HTMLDivElement>({ animation: 'fade-up', delay: 200, threshold: 0.1 });

  if (!isConnected) {
    return (
      <EmptyState icon={Plug} title="Connect wallet" description="Connect your wallet to view vault positions, allocation, and health on X Layer." />
    );
  }

  if (loading) return <LoadingState />;

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Connection error"
        description={error}
        action={
          <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-brand-600">
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
        }
      />
    );
  }

  if (!data) {
    const chainLabels: Record<number, string> = { 1: 'Ethereum', 196: 'X Layer Mainnet', 1952: 'X Layer Testnet' };
    const isWrongNet = chainId && !isSupportedYieldGuardChain(chainId);
    return (
      <EmptyState
        icon={Package}
        title="No vault deployed"
        description={chainId ? `Connected to ${chainLabels[chainId] || chainId}. YieldGuard vaults are on X Layer Testnet (chain 1952).` : 'No YieldGuard vault found on this network.'}
        action={isWrongNet ? <button onClick={switchToTestnet} className="rounded-full bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-brand-600">Switch network</button> : undefined}
      />
    );
  }

  return (
    <div className="space-y-6">
      {actionError && (
        <div className="rounded-2xl border border-error/25 bg-error/10 px-4 py-3 text-sm text-error">
          {actionError}
        </div>
      )}

      {actionMessage && (
        <div className="rounded-2xl border border-success/25 bg-success/10 px-4 py-3 text-sm text-success">
          {actionMessage}
        </div>
      )}

      {/* Toast from alerts */}
      {alerts.lastToast && (
        <div className="animate-slide-up fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl border border-warning/30 bg-surface-900 p-4 shadow-2xl shadow-black/40">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-white">YieldGuard Alert</p>
              <p className="mt-0.5 text-xs text-surface-300">{alerts.lastToast}</p>
            </div>
            <button onClick={() => alerts.clearToast()} className="text-surface-500 hover:text-white">
              ✕
            </button>
          </div>
        </div>
      )}

      <SectionHeader
        title="Overview"
        subtitle={`${data.vault.name} · ${data.assetSymbol} vault on X Layer`}
        action={
          <div className="flex items-center gap-2">
            <button onClick={() => setDepositOpen(true)} className="inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_24px_-10px_rgba(238,127,26,0.8)] transition-all hover:bg-brand-600 active:scale-[0.98]">
              <ArrowDownToLine className="h-3.5 w-3.5" /> Deposit
            </button>
            <button onClick={() => setWithdrawOpen(true)} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-semibold text-surface-200 transition-all hover:border-white/20 hover:bg-white/[0.06]">
              <ArrowUpFromLine className="h-3.5 w-3.5" /> Withdraw
            </button>
          </div>
        }
      />

      {/* ══════ Metric cards (Slider) ══════ */}
      <div ref={cardsRef}>
        <CardSlider
          cards={cards.map((card) => ({
            id: card.label,
            content: (
              <div className="rounded-2xl border border-white/5 bg-surface-900/50 p-5 transition-all hover:border-brand-500/25 hover:bg-surface-900/80 hover:shadow-lg hover:shadow-brand-500/5">
                <div className="text-[11px] font-medium uppercase tracking-wider text-surface-500">{card.label}</div>
                <div className="mt-2 font-display text-2xl font-bold tracking-tight">{card.value}</div>
                <div className={`mt-2 text-xs ${card.up ? 'text-success' : 'text-surface-400'}`}>{card.hint}</div>
              </div>
            ),
          }))}
          slidesPerView={2}
          autoPlayInterval={5000}
        />
      </div>

      {/* ══════ Main grid: Vault + Health + Alerts ══════ */}
      <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
        <div ref={chartRef} className="rounded-2xl border border-white/5 bg-surface-900/50 p-6 lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-display text-sm font-semibold">Vault value</h3>
              <p className="mt-0.5 text-xs text-surface-500">Total value locked · live share price</p>
            </div>
            <StatusBadge tone="brand" label={data.assetSymbol} />
          </div>
          <div className="flex flex-col items-center justify-center py-6">
            <div className="font-display text-5xl font-bold tracking-tight text-white sm:text-6xl">
              ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1.5">
              <span className="font-mono text-xs text-brand-300">
                Share price ${parseFloat(data.vault.sharePrice).toFixed(4)}
              </span>
            </div>
          </div>
        </div>

        <div ref={healthRef} className="rounded-2xl border border-white/5 bg-surface-900/50 p-6">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="font-display text-sm font-semibold">Portfolio health</h3>
              <p className="mt-0.5 text-xs text-surface-500">Strategy risk snapshot</p>
            </div>
            <StatusBadge tone={hf > 1.5 ? 'success' : hf > 1.0 ? 'warning' : 'error'} label={hf > 1.5 ? 'Healthy' : hf > 1.0 ? 'Monitor' : 'Danger'} pulse />
          </div>
          <div className="mb-5 flex justify-center">
            <HealthGauge value={hf} />
          </div>
          <div className="space-y-2">
            {data.strategies.map((s: any) => {
              const badge = riskBadge(parseFloat(s.healthFactor));
              return (
                <div key={s.address} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{s.protocol}</span>
                      <span className="text-[10px] text-surface-500">{s.apy}% APY</span>
                    </div>
                    <StatusBadge tone={badge.tone} label={badge.label} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-surface-500">
                    <span className="font-mono">${parseFloat(s.totalAssets).toLocaleString()}</span>
                    <span>HF: {parseFloat(s.healthFactor) > 100 ? '∞' : parseFloat(s.healthFactor).toFixed(2)}</span>
                  </div>
                  {parseFloat(s.healthFactor) < 1.0 && parseFloat(s.healthFactor) > 0 && (
                    <button
                      onClick={async () => {
                        if (window.confirm(`Emergency deallocate ${s.protocol}? All capital will be pulled back to vault.`)) {
                          try {
                            await emergencyDeallocate(s.address);
                            await refreshVaultData();
                            setActionMessage(`Emergency deallocation sent for ${s.protocol}.`);
                            setActionError(null);
                          }
                          catch (e: any) {
                            setActionError(e?.shortMessage || e?.message || 'Failed');
                          }
                        }
                      }}
                      className="mt-2 w-full rounded-lg border border-error/30 bg-error/10 py-1.5 text-[10px] font-medium text-error transition-all hover:bg-error/20"
                    >
                      ⚠ Emergency deallocate
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══════ NEW PANELS ROW 1: Risk Score + Alert + Fee ══════ */}
      <div ref={panelsRow1Ref} className="grid gap-4 lg:grid-cols-3 lg:gap-6">
        {/* Risk Score (6) */}
        <RiskScorePanel risk={portfolioRisk} />

        {/* Smart Alerts (5) */}
        <AlertPanel data={data} alerts={alerts} />

        {/* Yield earned (7) */}
        <FeeTrackerPanel metrics={feeTracker.metrics} tvl={totalValue} />
      </div>

      {/* ══════ NEW PANELS ROW 2: Withdrawal Queue + Auto-Compound ══════ */}
      <div ref={panelsRow2Ref} className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        {/* Withdrawal Queue (6) */}
        <WithdrawalQueuePanel strategies={data.strategies} unallocated={unallocated} totalValue={totalValue} />

        {/* Auto-Compound (1) */}
        <AutoCompoundPanel isOwner={isOwner} vaultAddress={data.vault.address} onHarvest={harvest} hasAllocatedCapital={totalAllocated > 0} />
      </div>

      {/* ══════ Diversification + Allocation ══════ */}
      <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
        <div ref={diversRef} className="rounded-2xl border border-white/5 bg-surface-900/50 p-6 lg:col-span-2">
          <div className="mb-4">
            <h3 className="font-display text-sm font-semibold">Capital diversification</h3>
            <p className="mt-0.5 text-xs text-surface-500">Share of vault TVL by strategy</p>
          </div>
          <DiversificationBar strategies={data.strategies} total={totalValue} />
          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {data.strategies.map((s: any, i: number) => {
              const pct = totalValue > 0 ? (parseFloat(s.totalAssets) / totalValue) * 100 : 0;
              const colors = ['bg-brand-500', 'bg-violet-500', 'bg-amber-500', 'bg-emerald-500'];
              return (
                <div key={s.address} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <div className={`h-2 w-2 rounded-full ${colors[i % 4]}`} />
                    <span className="text-xs font-medium">{s.protocol}</span>
                  </div>
                  <div className="font-display text-sm font-bold font-mono">{pct.toFixed(1)}%</div>
                  <div className="text-[10px] text-surface-500">${parseFloat(s.totalAssets).toLocaleString()}</div>
                </div>
              );
            })}
            {unallocated > 0 && (
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-surface-500" />
                  <span className="text-xs font-medium">Unallocated</span>
                </div>
                <div className="font-display text-sm font-bold font-mono text-surface-300">{((unallocated / totalValue) * 100).toFixed(1)}%</div>
                <div className="text-[10px] text-surface-500">${unallocated.toLocaleString()}</div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-surface-900/50 p-6">
          <div className="mb-4">
            <h3 className="font-display text-sm font-semibold">Strategy allocation</h3>
            <p className="mt-0.5 text-xs text-surface-500">{isOwner ? 'Owner: allocate idle capital' : 'Read-only strategy balances'}</p>
          </div>
          <div className="space-y-4">
            {data.strategies.map((s: any, i: number) => (
              <div key={i} className="space-y-1.5 border-b border-white/5 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">{s.protocol}</span>
                  <span className={`text-xs font-semibold ${s.isHealthy ? 'text-success' : 'text-error'}`}>{s.apy}% APY</span>
                </div>
                <div className="flex items-center justify-between text-xs text-surface-500">
                  <span className="font-mono">${parseFloat(s.totalAssets).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  <span>HF {parseFloat(s.healthFactor).toFixed(1)}</span>
                </div>
                {isOwner && unallocated > 0 && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-[10px] text-surface-500">Vault idle</span>
                        <span className="font-mono text-[10px] text-brand-400">${unallocated.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-surface-500">$</span>
                        <input type="number" value={allocAmounts[s.protocol] || ''} onChange={(e) => setAllocAmounts((prev) => ({ ...prev, [s.protocol]: e.target.value }))} placeholder={unallocated.toLocaleString()} className="w-full rounded-lg border border-white/10 bg-surface-800 px-2 py-1.5 text-[11px] transition-colors focus:border-brand-500/50 focus:outline-none" />
                        <button onClick={() => handleAllocate(s.address, s.protocol)} disabled={allocating === s.protocol} className="shrink-0 whitespace-nowrap rounded-lg border border-brand-500/20 bg-brand-500/10 px-2.5 py-1.5 text-[10px] font-medium text-brand-400 transition-all hover:bg-brand-500/20 disabled:opacity-50">
                          {allocating === s.protocol ? '…' : 'Allocate'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════ Strategies Table ══════ */}
      <div className="rounded-2xl border border-white/5 bg-surface-900/50 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-sm font-semibold">Strategies</h3>
            <p className="mt-0.5 text-xs text-surface-500">Deployed strategy contracts</p>
          </div>
          <a
            href={explorerAddress(chainId || 1952, data.vault.address)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[11px] text-surface-500 transition-colors hover:text-brand-400"
          >
            {data.vault.address.slice(0, 6)}…{data.vault.address.slice(-4)}
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-[11px] uppercase tracking-wider text-surface-500">
                <th className="pb-3 font-medium">Protocol</th>
                <th className="pb-3 font-medium">Strategy</th>
                <th className="pb-3 font-medium">Allocated</th>
                <th className="pb-3 font-medium">APY</th>
                <th className="pb-3 font-medium">Risk</th>
                <th className="pb-3 font-medium">Health</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.strategies.map((s: any, i: number) => {
                const ss = portfolioRisk?.strategyScores?.[i];
                return (
                  <tr key={i} className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
                    <td className="py-3.5 font-medium">{s.protocol}</td>
                    <td className="py-3.5">
                      <a
                        href={explorerAddress(chainId || 1952, s.address)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-surface-300 transition-colors hover:text-brand-400"
                      >
                        {s.name}
                      </a>
                    </td>
                    <td className="py-3.5 font-mono">${parseFloat(s.totalAssets).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                    <td className="py-3.5 font-mono text-success">{s.apy}%</td>
                    <td className="py-3.5 font-mono">{ss ? `${ss.score}/100 ${ss.grade}` : '—'}</td>
                    <td className="py-3.5 font-mono">{parseFloat(s.healthFactor).toFixed(1)}</td>
                    <td className="py-3.5"><StatusBadge tone={s.isHealthy ? 'success' : 'error'} label={s.isHealthy ? 'Active' : 'Warning'} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════ Telegram Bot Link ══════ */}
      <div className="rounded-2xl border border-white/5 bg-surface-900/50 p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-500/10">
            <svg className="h-6 w-6 text-brand-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2.5L2.5 10.5L9.5 13.5" />
              <path d="M9.5 13.5L13.5 21.5L21.5 2.5" />
              <path d="M9.5 13.5L16.5 8.5" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-sm font-semibold">📱 Monitor your deposits from Telegram</h3>
            <p className="mt-1 text-xs text-surface-400">
              Check your balance, vault health, and strategy performance — no dashboard needed.
              Just link your wallet once and you're set.
            </p>
            <div className="mt-3 flex items-center gap-4 rounded-lg border border-white/5 bg-white/[0.02] p-3">
              <div className="flex items-center gap-2 text-xs text-surface-400">
                <span className="text-brand-400">➜</span>
                Open <strong className="text-white">@yieldguard_bot</strong>
              </div>
              <div className="flex items-center gap-2 text-xs text-surface-400">
                <span className="text-brand-400">➜</span>
                Send <code className="rounded bg-surface-800 px-1.5 py-0.5 font-mono text-brand-300">{address?.slice(0, 10)}...{address?.slice(-6) || '0x...'}</code>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full bg-success/10 px-2.5 py-1 text-[10px] font-medium text-success">/balance</span>
              <span className="rounded-full bg-success/10 px-2.5 py-1 text-[10px] font-medium text-success">/status</span>
              <span className="rounded-full bg-success/10 px-2.5 py-1 text-[10px] font-medium text-success">/strategies</span>
              <span className="rounded-full bg-warning/10 px-2.5 py-1 text-[10px] font-medium text-warning">⚠️ HF alerts</span>
            </div>
          </div>
          <a
            href={`https://t.me/yieldguard_bot?start=${address || ''}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 self-center rounded-xl bg-brand-500 px-5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-brand-600"
          >
            Connect Telegram ↗
          </a>
        </div>
      </div>

      <DepositModal open={depositOpen} onClose={() => setDepositOpen(false)} onSuccess={() => { void refreshVaultData(); setActionMessage('Deposit confirmed. Vault data refreshed.'); setActionError(null); }} />
      <WithdrawModal open={withdrawOpen} onClose={() => setWithdrawOpen(false)} onSuccess={() => { void refreshVaultData(); setActionMessage('Withdrawal confirmed. Vault data refreshed.'); setActionError(null); }} />
    </div>
  );
}
