import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: "◉" },
  { href: "/dashboard/simulate", label: "Simulate", icon: "▶" },
  { href: "/dashboard/history", label: "History", icon: "◷" },
  { href: "/dashboard/protocols", label: "Protocols", icon: "⚡" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-950 flex">
      {/* Sidebar */}
      <aside className="w-60 border-r border-white/5 flex flex-col">
        <div className="h-16 flex items-center gap-2 px-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-brand-500" />
            <span className="text-lg font-semibold tracking-tight">YieldGuard</span>
          </Link>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-surface-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-xs text-brand-400 font-medium">
              YG
            </div>
            <div className="text-xs text-surface-400">
              <div className="text-white text-sm font-medium">YieldGuard</div>
              <div>v0.1.0</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8">
          <h1 className="text-sm font-medium">Dashboard</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-success/10 border border-success/20 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-xs text-success font-medium">All Systems Normal</span>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
