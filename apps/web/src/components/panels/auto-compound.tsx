'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  AlertTriangle,
  Clock,
  Play,
  RefreshCcw,
  Sprout,
  Timer,
  TimerOff,
} from 'lucide-react';
import { useYieldGuard } from '@/hooks/useYieldGuard';
import { StatusBadge } from '@/components/ui/empty-state';

interface CompoundState {
  enabled: boolean;
  intervalHours: number;
  lastHarvest: number | null;
  nextHarvest: number | null;
  harvesting: boolean;
  harvestCount: number;
  yieldAccumulated: number;
}

const STORAGE_KEY = 'yg_autocompound_config';

function loadState(): Partial<CompoundState> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

export default function AutoCompoundPanel({
  isOwner,
  vaultAddress,
  onHarvest,
  hasAllocatedCapital,
}: {
  isOwner: boolean;
  vaultAddress: string;
  onHarvest: () => Promise<void>;
  hasAllocatedCapital: boolean;
}) {
  const { getVaultEvents } = useYieldGuard();
  const [state, setState] = useState<CompoundState>({
    enabled: false,
    intervalHours: 6,
    lastHarvest: null,
    nextHarvest: null,
    harvesting: false,
    harvestCount: 0,
    yieldAccumulated: 0,
  });
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const [nextIn, setNextIn] = useState<string>('—');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const harvestedRef = useRef(false);

  // Load saved state + events on mount
  useEffect(() => {
    const saved = loadState();
    if (saved.enabled) {
      setState((s) => ({
        ...s,
        enabled: true,
        intervalHours: saved.intervalHours || 6,
        lastHarvest: saved.lastHarvest || null,
        nextHarvest: saved.nextHarvest || null,
        harvestCount: saved.harvestCount || 0,
        yieldAccumulated: saved.yieldAccumulated || 0,
      }));
    }
    refreshYieldFromChain();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function refreshYieldFromChain() {
    try {
      const events = await getVaultEvents(90);
      const harvests = events.filter((e: any) => e.name === 'Harvested');
      const totalYield = harvests.reduce(
        (s: number, e: any) => s + (Number(e.args?.totalYield) / 1e18 || 0),
        0,
      );
      setState((s) => ({
        ...s,
        harvestCount: harvests.length,
        yieldAccumulated: Math.round(totalYield * 10000) / 10000,
      }));
    } catch {}
  }

  // Countdown tick
  useEffect(() => {
    if (state.nextHarvest && state.enabled) {
      const tick = () => {
        const diff = Math.max(0, state.nextHarvest! - Date.now());
        if (diff <= 0) {
          setNextIn('Now');
          return;
        }
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setNextIn(`${h}h ${m}m ${s}s`);
      };
      tick();
      countdownRef.current = setInterval(tick, 1000);
      return () => {
        if (countdownRef.current) clearInterval(countdownRef.current);
      };
    } else {
      setNextIn('—');
    }
  }, [state.nextHarvest, state.enabled]);

  // Use a ref to always have the latest executeHarvest in the timer callback
  const executeRef = useRef<() => Promise<void>>(async () => {});

  const executeHarvest = useCallback(async () => {
    if (state.harvesting) return;
    setErrorMsg(null);
    setState((s) => ({ ...s, harvesting: true }));
    try {
      await onHarvest();
      harvestedRef.current = true;
      const now = Date.now();
      save({
        harvesting: false,
        lastHarvest: now,
        nextHarvest: now + state.intervalHours * 3600000,
      });
      // Refresh real on-chain yield after successful harvest
      await refreshYieldFromChain();
    } catch (e: any) {
      setErrorMsg(e?.shortMessage || e?.message || 'Harvest transaction failed');
      setState((s) => ({ ...s, harvesting: false }));
    }
  }, [state.harvesting, state.intervalHours, onHarvest]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep ref in sync so timer always calls latest executeHarvest
  executeRef.current = executeHarvest;

  // Auto-harvest timer — uses ref to avoid stale closure
  useEffect(() => {
    if (!state.enabled || !isOwner) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Fire once immediately if nextHarvest is overdue
    if (state.nextHarvest && Date.now() >= state.nextHarvest && !harvestedRef.current) {
      executeRef.current();
    }

    const ms = state.intervalHours * 3600000;
    timerRef.current = setInterval(async () => {
      await executeRef.current();
    }, ms);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.enabled, state.intervalHours, isOwner, state.nextHarvest]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = useCallback((patch: Partial<CompoundState>) => {
    setState((s) => {
      const next = { ...s, ...patch };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  function toggle() {
    setErrorMsg(null);
    if (state.enabled) {
      if (timerRef.current) clearInterval(timerRef.current);
      save({ enabled: false, nextHarvest: null });
    } else {
      const now = Date.now();
      harvestedRef.current = false;
      save({
        enabled: true,
        lastHarvest: state.lastHarvest || null,
        nextHarvest: now + state.intervalHours * 3600000,
      });
    }
  }

  function changeInterval(h: number) {
    setErrorMsg(null);
    save({ intervalHours: h });
    // Reset nextHarvest so the new interval takes effect
    if (state.enabled) {
      const now = Date.now();
      save({ nextHarvest: now + h * 3600000 });
    }
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-surface-900/50 p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCcw className="h-4 w-4 text-brand-400" strokeWidth={1.85} />
          <h3 className="font-display text-sm font-semibold">Auto-compound</h3>
        </div>
        {state.enabled ? (
          <StatusBadge tone="success" label="Active" pulse />
        ) : (
          <StatusBadge tone="neutral" label="Manual" />
        )}
      </div>

      {!isOwner ? (
        <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-3">
          <Clock className="h-4 w-4 text-surface-500" />
          <p className="text-xs text-surface-400">
            Auto-compound controls require vault owner access.
          </p>
        </div>
      ) : !hasAllocatedCapital ? (
        <div className="flex items-center gap-2 rounded-lg border border-warning/20 bg-warning/5 p-3">
          <RefreshCcw className="h-4 w-4 text-warning" />
          <div>
            <p className="text-xs font-medium text-warning/90">No capital deployed</p>
            <p className="mt-0.5 text-[11px] text-warning/70">
              Allocate USDC to a strategy (Aave, Morpho) first before enabling auto-compound.
            </p>
          </div>
        </div>
      ) : (
        <>
          {errorMsg && (
            <div className="mb-3 flex items-start gap-2 rounded-lg border border-error/20 bg-error/5 p-2.5">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-error" />
              <p className="text-[11px] text-error/90">{errorMsg}</p>
            </div>
          )}

          <div className="mb-3 flex items-center gap-2">
            <button
              onClick={toggle}
              className={`flex-1 rounded-xl border py-3 text-sm font-semibold transition-all ${
                state.enabled
                  ? 'border-success/30 bg-success/10 text-success hover:bg-success/15'
                  : 'border-brand-500/30 bg-brand-500/10 text-brand-400 hover:bg-brand-500/15'
              }`}
            >
              {state.enabled ? (
                <span className="flex items-center justify-center gap-2">
                  <TimerOff className="h-4 w-4" />
                  Stop auto-compound
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Timer className="h-4 w-4" />
                  Enable auto-compound
                </span>
              )}
            </button>
            {state.harvesting && (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500/30 border-t-brand-500" />
              </span>
            )}
          </div>

          {state.enabled && (
            <>
              <div className="mb-3 flex items-center gap-2">
                {[4, 6, 12, 24].map((h) => (
                  <button
                    key={h}
                    onClick={() => changeInterval(h)}
                    className={`flex-1 rounded-lg border py-1.5 text-[11px] font-medium transition-all ${
                      state.intervalHours === h
                        ? 'border-brand-500/30 bg-brand-500/10 text-brand-400'
                        : 'border-white/10 text-surface-400 hover:border-white/20'
                    }`}
                  >
                    {h}h
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.01] px-3 py-2 text-xs">
                  <span className="flex items-center gap-1.5 text-surface-400">
                    <Clock className="h-3 w-3" />
                    Next harvest
                  </span>
                  <span className="font-mono font-semibold text-surface-200">{nextIn}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.01] px-3 py-2 text-xs">
                  <span className="flex items-center gap-1.5 text-surface-400">
                    <Sprout className="h-3 w-3" />
                    Cumulative yield
                  </span>
                  <span className="font-mono font-semibold text-success">
                    {state.yieldAccumulated.toFixed(4)} USDC
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.01] px-3 py-2 text-xs">
                  <span className="flex items-center gap-1.5 text-surface-400">
                    <RefreshCcw className="h-3 w-3" />
                    Harvests executed
                  </span>
                  <span className="font-mono font-semibold text-surface-200">{state.harvestCount}</span>
                </div>
              </div>
            </>
          )}

          {!state.enabled && (
            <button
              onClick={async () => {
                await executeHarvest();
                await refreshYieldFromChain();
              }}
              disabled={state.harvesting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand-500/20 bg-brand-500/10 py-2.5 text-xs font-medium text-brand-400 transition-all hover:bg-brand-500/20 disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5" />
              {state.harvesting ? 'Harvesting…' : 'Harvest now (one-shot)'}
            </button>
          )}
        </>
      )}

      <p className="mt-3 text-[10px] text-surface-500">
        Auto-compound harvests yield and re-invests into strategies on a recurring schedule.
      </p>
    </div>
  );
}
