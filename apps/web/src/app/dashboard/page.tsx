export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Status cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Portfolio Value", value: "$124,582.34", change: "+8.2%", positive: true },
          { label: "Average APY", value: "8.47%", change: "+2.1%", positive: true },
          { label: "Active Protocols", value: "4", change: "", positive: true },
          { label: "Health Factor", value: "2.8", change: "Low Risk", positive: true },
        ].map((card) => (
          <div key={card.label} className="bg-surface-900/50 border border-white/5 rounded-xl p-5">
            <div className="text-xs text-surface-400 mb-1">{card.label}</div>
            <div className="text-2xl font-bold">{card.value}</div>
            {card.change && (
              <div className={`mt-2 flex items-center gap-1 text-xs ${card.positive ? 'text-success' : 'text-error'}`}>
                {card.change}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Portfolio Chart */}
      <div className="bg-surface-900/50 border border-white/5 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold">Portfolio Performance</h2>
          <div className="flex items-center gap-2">
            {["7D", "1M", "3M", "1Y"].map((p) => (
              <button key={p} className={`px-3 py-1 text-xs rounded-full ${p === "1M" ? "bg-brand-500/20 text-brand-400" : "text-surface-400 hover:text-white"}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="h-64 flex items-center justify-center text-surface-500 text-sm">
          {/* Chart placeholder — will be replaced with Recharts */}
          <div className="flex items-end gap-1 h-48 w-full">
            {[40, 55, 48, 62, 58, 70, 65, 78, 72, 82, 88, 85, 92, 88, 95].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-gradient-to-t from-brand-500 to-brand-400 rounded-t-sm transition-all hover:opacity-80"
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Positions */}
      <div className="bg-surface-900/50 border border-white/5 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Active Positions</h2>
          <button className="text-xs text-brand-400 hover:text-brand-300">View All →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-surface-400 text-xs border-b border-white/5">
                <th className="pb-3 font-medium">Protocol</th>
                <th className="pb-3 font-medium">Asset</th>
                <th className="pb-3 font-medium">Deposited</th>
                <th className="pb-3 font-medium">APY</th>
                <th className="pb-3 font-medium">Health</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { protocol: "Aave V3", asset: "USDC", deposited: "$50,000", apy: "6.2%", health: "2.8", status: "Active" },
                { protocol: "Morpho", asset: "USDC", deposited: "$35,000", apy: "8.9%", health: "3.1", status: "Active" },
                { protocol: "Compound", asset: "DAI", deposited: "$25,000", apy: "5.4%", health: "2.5", status: "Active" },
                { protocol: "Aave V3", asset: "WETH", deposited: "$14,582", apy: "4.1%", health: "2.2", status: "Active" },
              ].map((row) => (
                <tr key={row.protocol + row.asset} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-3.5 font-medium">{row.protocol}</td>
                  <td className="py-3.5 text-surface-300">{row.asset}</td>
                  <td className="py-3.5">{row.deposited}</td>
                  <td className="py-3.5 text-success">{row.apy}</td>
                  <td className="py-3.5">{row.health}</td>
                  <td className="py-3.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 border border-success/20 text-success text-xs">
                      <span className="w-1 h-1 rounded-full bg-success" />
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
