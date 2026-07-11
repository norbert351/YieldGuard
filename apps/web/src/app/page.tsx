'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  GitCompareArrows,
  LineChart,
  Link2,
  ShieldCheck,
  Vault,
  ArrowDownToLine,
  Activity,
  Wallet,
  Network,
} from 'lucide-react';
import CardSlider from '@/components/ui/card-slider';
import useScrollReveal from '@/hooks/useScrollReveal';
import { WalletConnect } from '@/components/wallet/wallet-connect';
import { deployedContracts } from '@/lib/contracts';

export const dynamic = 'force-dynamic';

const FEATURES = [
  {
    icon: BarChart3,
    title: 'Portfolio Simulation',
    desc: 'Model allocation outcomes using current strategy yields and clear assumptions before moving capital.',
  },
  {
    icon: LineChart,
    title: 'On-chain Analytics',
    desc: 'Track vault TVL, share price, health factor, and strategy balances from deployed contracts.',
  },
  {
    icon: ShieldCheck,
    title: 'Risk Oversight',
    desc: 'Surface health warnings, idle capital, and emergency controls in one operator console.',
  },
  {
    icon: GitCompareArrows,
    title: 'Protocol Comparison',
    desc: 'Inspect Aave and Morpho side by side with allocation share, health, and current APY.',
  },
  {
    icon: Vault,
    title: 'Vault Operations',
    desc: 'Deposit, withdraw, allocate, harvest, and rebalance directly from connected wallets.',
  },
  {
    icon: Link2,
    title: 'Wallet Integration',
    desc: 'Use OKX, MetaMask, or Rabby to manage positions on X Layer Testnet without leaving the app.',
  },
];

const PROTOCOLS = [
  {
    name: 'Aave V3',
    desc: 'Lending market used by the deployed vault for stablecoin strategy exposure.',
    badge: 'Deployed strategy',
    accent: 'from-violet-500/20 via-violet-500/5 to-transparent',
    border: 'hover:border-violet-400/30',
    chip: 'bg-violet-500/15 text-violet-300 border-violet-500/25',
  },
  {
    name: 'Morpho Blue',
    desc: 'Higher-yield venue paired with Aave for comparative allocation and risk monitoring.',
    badge: 'Deployed strategy',
    accent: 'from-sky-500/20 via-sky-500/5 to-transparent',
    border: 'hover:border-sky-400/30',
    chip: 'bg-sky-500/15 text-sky-300 border-sky-500/25',
  },
];

const START_STEPS = [
  {
    icon: Wallet,
    title: 'Connect a wallet',
    desc: 'Open WalletConnect, MetaMask, Rabby, or OKX Wallet from the header.',
  },
  {
    icon: Network,
    title: 'Switch to X Layer Testnet',
    desc: 'YieldGuard is deployed on chain 1952. The app will prompt you if you are on the wrong network.',
  },
  {
    icon: ArrowDownToLine,
    title: 'Fund and deposit testnet USDC',
    desc: 'Approve USDC, mint shares, then manage allocation from the dashboard.',
  },
];

export default function HomePage() {
  const featuresRef = useScrollReveal<HTMLDivElement>({ stagger: true, threshold: 0.12 });
  const protocolsRef = useScrollReveal<HTMLDivElement>({ stagger: true });
  const ctaRef = useScrollReveal<HTMLDivElement>({ animation: 'scale-in' });
  const howRef = useScrollReveal<HTMLDivElement>({ stagger: true });

  const testnet = deployedContracts.xlayerTestnet;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0f] text-white">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      <div className="pointer-events-none fixed left-[-8%] top-[-12%] h-[48%] w-[48%] rounded-full bg-brand-500/10 blur-[160px]" />
      <div className="pointer-events-none fixed bottom-[-10%] right-[-6%] h-[36%] w-[36%] rounded-full bg-brand-500/6 blur-[140px]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(238,127,26,0.06),transparent_50%)]" />

      <nav className="fixed top-0 z-50 w-full border-b border-white/[0.04] bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6">
          <Link href="/" className="group flex items-center gap-2.5">
            <img src="/logo-icon.jpg" alt="" className="h-7 w-7 rounded-lg transition-transform group-hover:scale-105" />
            <span className="font-display text-lg font-bold tracking-tight">YieldGuard</span>
          </Link>
          <div className="hidden items-center gap-8 text-sm text-surface-400 md:flex">
            <a href="#features" className="transition-colors hover:text-white">Features</a>
            <a href="#how-it-works" className="transition-colors hover:text-white">How it works</a>
            <a href="#protocols" className="transition-colors hover:text-white">Protocols</a>
          </div>
          <WalletConnect />
        </div>
      </nav>

      <section className="relative px-5 pb-24 pt-32 sm:px-6 sm:pt-36">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-12">
            <div className="animate-slide-up lg:col-span-5">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/8 px-3.5 py-1.5 text-[11px] font-medium text-brand-400">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                Deployed on X Layer Testnet · Chain 1952
              </div>

              <h1 className="font-display text-[clamp(2.5rem,7vw,5rem)] font-extrabold leading-[1.02] tracking-tight">
                Guard
                <br />
                your capital.
                <br />
                <span className="bg-gradient-to-r from-brand-300 via-brand-400 to-brand-500 bg-clip-text text-transparent">
                  Operate
                </span>{' '}
                the vault.
              </h1>

              <p className="mt-6 max-w-md text-[15px] leading-relaxed text-surface-500">
                YieldGuard is a live testnet vault console for USDC allocation across Aave and Morpho.
                Connect a wallet, switch to X Layer Testnet, and manage deposits, withdrawals, and strategy actions from one place.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/30 bg-brand-500/8 px-3.5 py-2 text-[11px] font-medium text-brand-300">
                  <Wallet className="h-3 w-3" />
                  Connect wallet
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-surface-600" />
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.04] px-3.5 py-2 text-[11px] font-medium text-surface-300">
                  <Network className="h-3 w-3" />
                  Switch to X Layer Testnet
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-surface-600" />
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.04] px-3.5 py-2 text-[11px] font-medium text-surface-300">
                  <Activity className="h-3 w-3" />
                  Operate the vault
                </span>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Link
                  href="/dashboard"
                  className="group inline-flex items-center gap-2 rounded-full bg-brand-500 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_12px_40px_-12px_rgba(238,127,26,0.65)] transition-all hover:bg-brand-600 hover:shadow-[0_16px_48px_-12px_rgba(238,127,26,0.75)] active:scale-[0.98]"
                >
                  Launch Dashboard
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-7 py-3.5 text-sm font-medium text-surface-400 transition-all hover:border-white/20 hover:bg-white/[0.04] hover:text-white"
                >
                  First steps
                </a>
              </div>
            </div>

            <div className="relative animate-slide-up lg:col-span-7" style={{ animationDelay: '0.12s' }}>
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(238,127,26,0.15),transparent_55%)] blur-3xl" />
              <div className="relative perspective-1000">
                <div className="-rotate-[3deg] transform-gpu overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0d0d14]/90 p-1 shadow-2xl shadow-black/50 backdrop-blur-md transition-all hover:-rotate-[1deg] hover:scale-[1.01]">
                  <div className="rounded-[14px] border border-white/[0.04] bg-[#0a0a10]/80 p-4 sm:p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/12">
                          <ShieldCheck className="h-4.5 w-4.5 text-brand-400" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">Vault status</div>
                          <div className="text-[10px] text-surface-500">Live contract endpoints only</div>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/15 bg-warning/8 px-2.5 py-1 text-[10px] font-medium text-warning">
                        Testnet
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        { label: 'Factory', value: `${testnet.factory.slice(0, 6)}…${testnet.factory.slice(-4)}`, sub: 'Deployed' },
                        { label: 'Vault', value: `${testnet.vault.slice(0, 6)}…${testnet.vault.slice(-4)}`, sub: 'Deployed' },
                        { label: 'Strategies', value: 'Aave + Morpho', sub: 'Configured' },
                        { label: 'Asset', value: testnet.usdcLabel, sub: 'Testnet token' },
                      ].map((card) => (
                        <div
                          key={card.label}
                          className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-3 transition-colors hover:border-brand-500/20"
                        >
                          <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-surface-500">{card.label}</div>
                          <div className="mt-1 font-display text-sm font-bold tracking-tight">{card.value}</div>
                          <div className="mt-0.5 text-[10px] text-surface-500">{card.sub}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 rounded-xl border border-white/[0.04] bg-white/[0.015] p-3">
                      <div className="mb-2 flex items-center justify-between text-[10px] text-surface-500">
                        <span>Before you start</span>
                        <span className="text-brand-400">No mock analytics</span>
                      </div>
                      <div className="space-y-2 text-[11px] text-surface-300">
                        <div className="flex items-start gap-2">
                          <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-brand-400" />
                          <span>Dashboard values load from deployed contracts after wallet connection.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-brand-400" />
                          <span>Simulation uses current strategy APY with explicit assumptions, not hidden random data.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-brand-400" />
                          <span>Owner-only controls appear only when the connected wallet owns the vault.</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 rounded-lg border border-white/[0.04] bg-white/[0.01] p-2.5">
                      <div className="mb-2 flex items-center justify-between text-[9px] font-semibold uppercase tracking-[0.12em] text-surface-500">
                        <span>Contracts</span>
                        <span className="rounded-full border border-brand-500/15 bg-brand-500/8 px-1.5 py-0.5 text-[8px] text-brand-400">X Layer</span>
                      </div>
                      <div className="space-y-[3px] text-[10px] text-surface-400">
                        <div className="flex items-center justify-between rounded-md bg-white/[0.02] px-2.5 py-1.5">
                          <span>Factory</span>
                          <span className="font-mono text-surface-300">{testnet.factory.slice(0, 8)}…</span>
                        </div>
                        <div className="flex items-center justify-between rounded-md bg-white/[0.02] px-2.5 py-1.5">
                          <span>Vault</span>
                          <span className="font-mono text-surface-300">{testnet.vault.slice(0, 8)}…</span>
                        </div>
                        <div className="flex items-center justify-between rounded-md bg-white/[0.02] px-2.5 py-1.5">
                          <span>USDC</span>
                          <span className="font-mono text-surface-300">{testnet.usdc.slice(0, 8)}…</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-10 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-4">
          {[
            { label: 'Vault TVL', value: 'Read on dashboard', sub: 'Wallet connection required' },
            { label: 'Active strategies', value: '2', sub: 'Aave + Morpho' },
            { label: 'Protocol fee', value: '10%', sub: 'Performance only' },
            { label: 'Network', value: 'X Layer Testnet', sub: 'Chain 1952' },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/5 bg-surface-900/40 p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-surface-500">{item.label}</div>
              <div className="mt-2 font-display text-2xl font-bold tracking-tight text-white">{item.value}</div>
              <div className="mt-1 text-xs text-surface-500">{item.sub}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" ref={featuresRef} className="px-5 py-16 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-400">Features</div>
            <h2 className="font-display text-3xl font-bold tracking-tight">Built for vault operators</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-surface-500">
              YieldGuard focuses on real vault operations, explicit testnet assumptions, and clear separation between live chain reads and estimated modelling.
            </p>
          </div>
          <CardSlider
            cards={FEATURES.map((feature) => ({
              id: feature.title,
              content: (
                <div className="h-full rounded-2xl border border-white/6 bg-surface-900/50 p-5">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/12 text-brand-400">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-base font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-surface-500">{feature.desc}</p>
                </div>
              ),
            }))}
            slidesPerView={3}
            autoPlayInterval={5000}
          />
        </div>
      </section>

      <section id="how-it-works" ref={howRef} className="px-5 py-16 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-400">How it works</div>
            <h2 className="font-display text-3xl font-bold tracking-tight">Three steps from wallet to vault</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {START_STEPS.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-white/5 bg-surface-900/40 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-surface-500">0{index + 1}</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/12 text-brand-400">
                    <step.icon className="h-4.5 w-4.5" />
                  </div>
                </div>
                <h3 className="font-display text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-surface-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="protocols" ref={protocolsRef} className="px-5 py-16 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-400">Protocols</div>
            <h2 className="font-display text-3xl font-bold tracking-tight">Strategy venues</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-surface-500">
              Rates are read inside the dashboard from deployed contracts. The landing page only describes the venues so users do not confuse preview text with live vault performance.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {PROTOCOLS.map((protocol) => (
              <div
                key={protocol.name}
                className={`rounded-2xl border border-white/5 bg-gradient-to-br ${protocol.accent} ${protocol.border} p-5 transition-all`}
              >
                <div className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium ${protocol.chip}`}>
                  {protocol.badge}
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold text-white">{protocol.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-surface-500">{protocol.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section ref={ctaRef} className="px-5 pb-20 pt-8 sm:px-6">
        <div className="mx-auto max-w-7xl rounded-3xl border border-white/6 bg-surface-900/50 p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-400">Powered by smart contracts</div>
              <h2 className="font-display text-3xl font-bold tracking-tight">Open the console with clear expectations.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-surface-500">
                Dashboard pages load live vault state after connection. Where the app estimates outcomes, it now says so directly.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-600"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
