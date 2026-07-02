import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface-950">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-surface-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-brand-500" />
            <span className="text-lg font-semibold tracking-tight">YieldGuard</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-surface-300">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-white transition-colors">How it works</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2 rounded-full text-sm font-medium transition-all"
          >
            Launch App
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-medium mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                DeFi Yield Optimization
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                Optimize yields.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">
                  Automate growth.
                </span>
              </h1>
              <p className="mt-6 text-lg text-surface-400 leading-relaxed max-w-lg">
                Simulate, track, and optimize your DeFi treasury across multiple lending protocols.
                Real-time analytics, risk management, and automated rebalancing.
              </p>
              <div className="flex items-center gap-4 mt-8">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-full text-sm font-medium transition-all shadow-lg shadow-brand-500/25"
                >
                  Launch Dashboard
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium text-surface-300 border border-white/10 hover:border-white/20 hover:text-white transition-all"
                >
                  How it works
                </Link>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-radial from-brand-500/20 via-transparent to-transparent blur-3xl" />
              <div className="relative bg-surface-900/60 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-800/60 rounded-xl p-4 border border-white/5">
                    <div className="text-xs text-surface-400 mb-1">Total Value Locked</div>
                    <div className="text-2xl font-bold text-white">$12.4M</div>
                    <div className="mt-2 flex items-center gap-1 text-xs text-success">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6"/></svg>
                      +12.3%
                    </div>
                  </div>
                  <div className="bg-surface-800/60 rounded-xl p-4 border border-white/5">
                    <div className="text-xs text-surface-400 mb-1">Avg APY</div>
                    <div className="text-2xl font-bold text-white">8.47%</div>
                    <div className="mt-2 flex items-center gap-1 text-xs text-success">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6"/></svg>
                      +2.1%
                    </div>
                  </div>
                  <div className="bg-surface-800/60 rounded-xl p-4 border border-white/5">
                    <div className="text-xs text-surface-400 mb-1">Active Protocols</div>
                    <div className="text-2xl font-bold text-white">4</div>
                    <div className="mt-2 text-xs text-surface-400">Aave, Morpho, Compound</div>
                  </div>
                  <div className="bg-surface-800/60 rounded-xl p-4 border border-white/5">
                    <div className="text-xs text-surface-400 mb-1">Risk Score</div>
                    <div className="text-2xl font-bold text-white">Low</div>
                    <div className="mt-2 flex items-center gap-1 text-xs text-success">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      Protected
                    </div>
                  </div>
                </div>
                {/* Mini chart line */}
                <div className="mt-4 h-12 bg-surface-800/40 rounded-xl border border-white/5 flex items-center justify-center">
                  <div className="flex items-end gap-1 h-8 w-full px-4">
                    {[30, 45, 38, 52, 48, 62, 55, 68, 72, 65, 78, 82, 75, 88, 92].map((h, i) => (
                      <div key={i} className="flex-1 bg-brand-500/30 rounded-t-sm" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Enterprise-grade yield management</h2>
            <p className="mt-4 text-surface-400 max-w-2xl mx-auto">
              Everything you need to manage, simulate, and optimize your DeFi treasury in one place.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Portfolio Simulation", desc: "Run multi-protocol simulations with configurable risk parameters and market conditions.", icon: "📊" },
              { title: "Real-time Analytics", desc: "Track APY, TVL, health factors, and performance metrics across all your positions.", icon: "📈" },
              { title: "Risk Management", desc: "Monitor liquidation thresholds, health factors, and get early warnings on positions.", icon: "🛡️" },
              { title: "Protocol Comparison", desc: "Compare yields across Aave, Morpho, Compound and find the best opportunities.", icon: "⚖️" },
              { title: "Historical Tracking", desc: "Browse past simulations, compare strategies, and analyze performance over time.", icon: "📅" },
              { title: "Multi-chain Support", desc: "Deploy across Ethereum, Polygon, and other EVM chains from a single dashboard.", icon: "⛓️" },
            ].map((f) => (
              <div key={f.title} className="bg-surface-900/50 border border-white/5 rounded-xl p-6 hover:border-brand-500/30 transition-all group">
                <div className="text-2xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-surface-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold">Ready to optimize your yield?</h2>
          <p className="mt-4 text-surface-400 max-w-xl mx-auto">
            Launch the dashboard to simulate strategies, track performance, and manage your DeFi portfolio.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 mt-8 bg-brand-500 hover:bg-brand-600 text-white px-8 py-3.5 rounded-full text-sm font-medium transition-all shadow-lg shadow-brand-500/25"
          >
            Launch Dashboard
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-surface-500">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brand-500" />
            YieldGuard
          </div>
          <p>DeFi Yield Optimization System</p>
        </div>
      </footer>
    </div>
  );
}
