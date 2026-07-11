'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Bell, BellOff, ShieldAlert, Sprout, TrendingDown, TrendingUp } from 'lucide-react';

interface AlertConfig {
  hfThreshold: number;
  enabled: boolean;
}

const STORAGE_KEY = 'yg_alert_config';

function loadConfig(): AlertConfig {
  if (typeof window === 'undefined') return { hfThreshold: 1.3, enabled: false };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { hfThreshold: 1.3, enabled: false };
}

export function useAlerts(data: any) {
  const [config, setConfigRaw] = useState<AlertConfig>(loadConfig);
  const [lastToast, setLastToast] = useState<string | null>(null);
  const prevHf = useRef<Record<string, number>>({});
  const notifiedHf = useRef<Set<string>>(new Set());

  const setConfig = useCallback((patch: Partial<AlertConfig>) => {
    setConfigRaw((c) => {
      const next = { ...c, ...patch };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  useEffect(() => {
    if (!config.enabled || !data?.strategies) return;

    for (const s of data.strategies) {
      const hf = parseFloat(s.healthFactor);
      const key = `${s.address}-hf`;

      // First load — record baseline
      if (!prevHf.current[key]) {
        prevHf.current[key] = hf;
        continue;
      }

      const prev = prevHf.current[key];
      const dropped = prev - hf;

      // Alert on HF drop below threshold
      if (hf < config.hfThreshold && hf > 0 && !notifiedHf.current.has(key)) {
        notifiedHf.current.add(key);
        const msg = `⚠️ ${s.protocol} health factor dropped to ${hf.toFixed(2)}`;
        setLastToast(msg);
        // Browser notification
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification('YieldGuard Alert', { body: msg, icon: '/logo-icon.jpg' });
        }
      }

      // Large drop alert (10%+ decline in a single poll)
      if (dropped > prev * 0.1 && prev > 0) {
        const msg = `📉 ${s.protocol} HF dropped ${(dropped / prev * 100).toFixed(0)}% (${prev.toFixed(2)} → ${hf.toFixed(2)})`;
        setLastToast(msg);
      }

      // Harvest notification
      prevHf.current[key] = hf;
    }

    // Reset notified set periodically (every 30 min) so alerts can refire
    const resetInterval = setInterval(() => {
      notifiedHf.current.clear();
    }, 30 * 60 * 1000);

    return () => clearInterval(resetInterval);
  }, [data, config.enabled, config.hfThreshold]);

  return { config, setConfig, lastToast, clearToast: () => setLastToast(null) };
}

export default function AlertPanel({
  data,
  alerts,
}: {
  data: any;
  alerts: ReturnType<typeof useAlerts>;
}) {
  const { config, setConfig, lastToast } = alerts;

  return (
    <div className="rounded-2xl border border-white/5 bg-surface-900/50 p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-brand-400" strokeWidth={1.85} />
          <h3 className="font-display text-sm font-semibold">Smart alerts</h3>
        </div>
        <button
          onClick={() => {
            const next = !config.enabled;
            setConfig({ enabled: next });
            if (next && typeof Notification !== 'undefined' && Notification.permission === 'default') {
              Notification.requestPermission();
            }
          }}
          className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-all ${
            config.enabled
              ? 'border-success/30 bg-success/10 text-success'
              : 'border-white/10 text-surface-500 hover:text-white'
          }`}
          title={config.enabled ? 'Disable alerts' : 'Enable alerts'}
        >
          {config.enabled ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-surface-400">HF threshold</span>
          <span className="font-mono text-surface-200">{config.hfThreshold.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min={1.0}
          max={2.5}
          step={0.1}
          value={config.hfThreshold}
          onChange={(e) => setConfig({ hfThreshold: parseFloat(e.target.value) })}
          disabled={!config.enabled}
          className="w-full accent-brand-500 disabled:opacity-30"
        />
        <div className="flex justify-between text-[10px] text-surface-500">
          <span className="text-error">1.0</span>
          <span className="text-warning">1.75</span>
          <span className="text-success">2.5</span>
        </div>
      </div>

      {lastToast && (
        <div className="mt-3 flex animate-fade-up items-start gap-2 rounded-lg border border-warning/20 bg-warning/5 p-2.5">
          <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
          <p className="text-[11px] leading-relaxed text-warning/90">{lastToast}</p>
        </div>
      )}

      {!lastToast && config.enabled && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-success/10 bg-success/[0.03] p-2.5">
          <TrendingUp className="h-3.5 w-3.5 text-success" />
          <p className="text-[11px] text-success/70">Watching {data?.strategies?.length || 0} strategies</p>
        </div>
      )}

      <p className="mt-3 text-[10px] text-surface-500">
        Browser notifications pop when HF crosses threshold or drops sharply.
      </p>
    </div>
  );
}
