export default function ProtocolsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold">Protocol Comparison</h2>
        <p className="text-sm text-surface-400 mt-1">Compare yields and risk parameters across lending protocols</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { name: "Aave V3", color: "from-purple-500/20 to-purple-600/10", border: "border-purple-500/30", assets: 5, tvl: "$12.4B", apy: "6.2%" },
          { name: "Morpho", color: "from-blue-500/20 to-blue-600/10", border: "border-blue-500/30", assets: 4, tvl: "$8.1B", apy: "8.9%" },
          { name: "Compound", color: "from-green-500/20 to-green-600/10", border: "border-green-500/30", assets: 3, tvl: "$3.2B", apy: "5.4%" },
        ].map((p) => (
          <div key={p.name} className={`bg-gradient-to-br ${p.color} ${p.border} border rounded-xl p-6`}>
            <h3 className="text-lg font-semibold mb-4">{p.name}</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-surface-400">Supported Assets</span>
                <span>{p.assets}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-surface-400">TVL</span>
                <span>{p.tvl}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-surface-400">Supply APY</span>
                <span className="text-success">{p.apy}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison table */}
      <div className="bg-surface-900/50 border border-white/5 rounded-xl p-6">
        <h3 className="text-sm font-semibold mb-4">Asset Rates Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-surface-400 text-xs border-b border-white/5">
                <th className="pb-3 font-medium">Asset</th>
                <th className="pb-3 font-medium">Aave</th>
                <th className="pb-3 font-medium">Morpho</th>
                <th className="pb-3 font-medium">Compound</th>
                <th className="pb-3 font-medium">Best</th>
              </tr>
            </thead>
            <tbody>
              {[
                { asset: "USDC", aave: "6.2%", morpho: "8.9%", compound: "5.4%", best: "Morpho" },
                { asset: "USDT", aave: "5.8%", morpho: "8.2%", compound: "5.1%", best: "Morpho" },
                { asset: "DAI", aave: "5.5%", morpho: "7.8%", compound: "4.9%", best: "Morpho" },
                { asset: "WETH", aave: "4.1%", morpho: "5.2%", compound: "3.8%", best: "Morpho" },
                { asset: "WBTC", aave: "3.2%", morpho: "4.5%", compound: "2.9%", best: "Morpho" },
              ].map((row) => (
                <tr key={row.asset} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-3.5 font-medium">{row.asset}</td>
                  <td className="py-3.5">{row.aave}</td>
                  <td className="py-3.5 text-success">{row.morpho}</td>
                  <td className="py-3.5">{row.compound}</td>
                  <td className="py-3.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 border border-success/20 text-success text-xs">
                      {row.best}
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
