'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-[48vh] items-center justify-center px-4">
      <div className="max-w-sm text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-surface-900 shadow-[0_0_40px_-12px_rgba(238,127,26,0.35)]">
          <Icon className="h-6 w-6 text-brand-400" strokeWidth={1.75} />
        </div>
        <h2 className="font-display text-xl font-semibold tracking-tight text-white">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-surface-400">{description}</p>
        {action && <div className="mt-6 flex justify-center">{action}</div>}
      </div>
    </div>
  );
}

export function LoadingState({ label = 'Loading on-chain data…' }: { label?: string }) {
  return (
    <div className="flex min-h-[48vh] items-center justify-center">
      <div className="text-center">
        <span className="mx-auto mb-4 block h-9 w-9 animate-spin rounded-full border-2 border-brand-500/25 border-t-brand-500" />
        <p className="text-sm text-surface-400">{label}</p>
      </div>
    </div>
  );
}

export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="font-display text-xl font-semibold tracking-tight text-white sm:text-2xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-surface-400">{subtitle}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}

export function StatusBadge({
  tone = 'success',
  label,
  pulse = false,
}: {
  tone?: 'success' | 'warning' | 'error' | 'brand' | 'neutral';
  label: string;
  pulse?: boolean;
}) {
  const tones = {
    success: 'bg-success/10 border-success/20 text-success',
    warning: 'bg-warning/10 border-warning/20 text-warning',
    error: 'bg-error/10 border-error/20 text-error',
    brand: 'bg-brand-500/10 border-brand-500/20 text-brand-400',
    neutral: 'bg-white/5 border-white/10 text-surface-300',
  };
  const dots = {
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error',
    brand: 'bg-brand-500',
    neutral: 'bg-surface-400',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${tones[tone]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dots[tone]} ${pulse ? 'animate-pulse' : ''}`} />
      {label}
    </span>
  );
}
