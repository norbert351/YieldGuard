'use client';

import { useEffect, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  Inbox,
  Plug,
  RefreshCcw,
  Sprout,
} from 'lucide-react';
import { useWeb3ModalAccount } from '@web3modal/ethers/react';
import { useYieldGuard } from '@/hooks/useYieldGuard';
import { explorerTx } from '@/lib/explorer';
import {
  EmptyState,
  LoadingState,
  SectionHeader,
  StatusBadge,
} from '@/components/ui/empty-state';

const EVENT_META: Record<
  string,
  { icon: typeof ArrowDownLeft; tone: 'brand' | 'error' | 'success' | 'warning' | 'neutral'; label: string }
> = {
  Deposited: { icon: ArrowDownLeft, tone: 'brand', label: 'Deposit' },
  Withdrawn: { icon: ArrowUpRight, tone: 'error', label: 'Withdraw' },
  Harvested: { icon: Sprout, tone: 'success', label: 'Harvest' },
  Rebalanced: { icon: RefreshCcw, tone: 'warning', label: 'Rebalance' },
};

function formatAmount(name: string, args: any): string {
  try {
    if (name === 'Deposited')
      return `${args.amount ? Number(args.amount) / 1e18 : '?'} USDC → ${args.shares ? Number(args.shares) / 1e18 : '?'} shares`;
    if (name === 'Withdrawn') return `${args.amount ? Number(args.amount) / 1e18 : '?'} USDC`;
    if (name === 'Harvested')
      return `${args.totalYield ? Number(args.totalYield) / 1e18 : '?'} USDC yield (${args.fees ? Number(args.fees) / 1e18 : '?'} fees)`;
    if (name === 'Rebalanced')
      return `${args.amount ? Number(args.amount) / 1e18 : '?'} USDC → ${args.strategy?.slice(0, 6)}…${args.strategy?.slice(-4)}`;
    return '';
  } catch {
    return '';
  }
}

function shorten(addr: string) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function HistoryPage() {
  const { isConnected, chainId } = useWeb3ModalAccount();
  const { getVaultEvents } = useYieldGuard();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(7);

  useEffect(() => {
    if (!isConnected) {
      setLoading(false);
      return;
    }
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        setError(null);
        const evs = await getVaultEvents(days);
        if (mounted) {
          setEvents(evs);
          if (evs.length === 0) setError('No events found. Try fewer days or check that the vault has activity.');
        }
      } catch (e: any) {
        if (mounted) {
          setEvents([]);
          setError(e?.message || 'Failed to load events. Check browser console for details.');
        }
      }
      if (mounted) setLoading(false);
    }
    load();
  }, [isConnected, getVaultEvents, days]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Transaction timeline"
        subtitle={
          events.length > 0
            ? `${events.length} on-chain events in the last ${days} days`
            : 'Real vault activity from contract logs'
        }
        action={
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="rounded-xl border border-white/10 bg-surface-900 px-3 py-2 text-xs text-surface-200 focus:border-brand-500/50 focus:outline-none"
          >
            <option value={7}>7 days</option>
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
          </select>
        }
      />

      {!isConnected ? (
        <EmptyState
          icon={Plug}
          title="Connect wallet"
          description="Connect your wallet to load vault deposit, withdraw, harvest, and rebalance events."
        />
      ) : loading ? (
        <LoadingState label="Scanning vault events…" />
      ) : error ? (
        <EmptyState
          icon={Inbox}
          title="Nothing loaded"
          description={error}
        />
      ) : events.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No activity yet"
          description={`No vault events found in the last ${days} days. Deposits and harvests will appear here.`}
        />
      ) : (
        <div className="rounded-2xl border border-white/5 bg-surface-900/50 p-5 sm:p-6">
          <div className="relative">
            <div className="absolute bottom-0 left-[19px] top-0 w-px bg-gradient-to-b from-brand-500/40 via-white/10 to-transparent" />
            <div className="space-y-0">
              {events.map((ev, i) => {
                const meta = EVENT_META[ev.name] || {
                  icon: FileText,
                  tone: 'neutral' as const,
                  label: ev.name,
                };
                const Icon = meta.icon;
                return (
                  <div key={`${ev.tx}-${i}`} className="relative flex gap-4 pb-6 last:pb-0">
                    <div
                      className={`z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-surface-950 ${
                        meta.tone === 'brand'
                          ? 'border-brand-500/40 text-brand-400'
                          : meta.tone === 'error'
                            ? 'border-error/40 text-error'
                            : meta.tone === 'success'
                              ? 'border-success/40 text-success'
                              : meta.tone === 'warning'
                                ? 'border-warning/40 text-warning'
                                : 'border-white/15 text-surface-300'
                      }`}
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.85} />
                    </div>
                    <div className="min-w-0 flex-1 rounded-xl border border-white/5 bg-white/[0.02] p-3.5 pt-2.5 transition-colors hover:border-white/10">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold">{meta.label}</span>
                        <StatusBadge tone={meta.tone} label={`Block #${ev.block}`} />
                      </div>
                      <p className="font-mono text-xs text-surface-300">{formatAmount(ev.name, ev.args)}</p>
                      <p className="mt-1.5 truncate text-[10px] text-surface-500">
                        <a
                          href={explorerTx(chainId || 1952, ev.tx)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="transition-colors hover:text-brand-400"
                        >
                          Tx <span className="font-mono underline underline-offset-2 decoration-white/10">{shorten(ev.tx)}</span>
                        </a>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
