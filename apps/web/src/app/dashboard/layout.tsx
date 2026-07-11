'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  FlaskConical,
  History,
  LayoutDashboard,
  Network,
} from 'lucide-react';
import { WalletConnect } from '@/components/wallet/wallet-connect';
import { StatusBadge } from '@/components/ui/empty-state';

export const dynamic = 'force-dynamic';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/protocols', label: 'Protocols', icon: Network },
  { href: '/dashboard/simulate', label: 'Simulate', icon: FlaskConical },
  { href: '/dashboard/history', label: 'History', icon: History },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';

  return (
    <div className="flex min-h-screen bg-surface-950 text-white">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-white/5 bg-[#0c0c10]/95 md:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-white/5 px-5">
          <Link href="/" className="group flex items-center gap-2.5">
            <img src="/logo.jpg" alt="" className="h-7 w-7 transition-transform group-hover:scale-105" />
            <span className="font-display text-lg font-bold tracking-tight">YieldGuard</span>
          </Link>
        </div>

        <div className="px-4 pt-5">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-surface-500">
            Console
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active =
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                    active
                      ? 'border border-brand-500/25 bg-brand-500/10 text-brand-300 shadow-[inset_0_0_0_1px_rgba(238,127,26,0.05)]'
                      : 'border border-transparent text-surface-400 hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${active ? 'text-brand-400' : 'text-surface-500 group-hover:text-surface-300'}`}
                    strokeWidth={1.85}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto border-t border-white/5 p-4">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <div className="flex items-center gap-3">
              <img src="/logo-icon.jpg" alt="" className="h-8 w-8" />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-white">YieldGuard</div>
                <div className="text-[11px] text-surface-500">X Layer · v0.1.0</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/5 bg-surface-950/75 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 md:hidden">
              <img src="/logo-icon.jpg" alt="" className="h-6 w-6" />
              <span className="font-display text-sm font-bold">YieldGuard</span>
            </Link>
            <div className="hidden md:block">
              <StatusBadge tone="warning" label="Testnet environment" pulse />
            </div>
            <div className="hidden items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.02] px-2.5 py-1 text-[11px] text-surface-400 lg:flex">
              <Activity className="h-3 w-3 text-brand-400" />
              On-chain reads after wallet connection
            </div>
          </div>
          <WalletConnect />
        </header>

        {/* Mobile nav */}
        <nav className="flex gap-1 overflow-x-auto border-b border-white/5 px-3 py-2 md:hidden">
          {navItems.map((item) => {
            const active =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs transition-all ${
                  active ? 'bg-brand-500/10 text-brand-400' : 'text-surface-400 hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.85} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
