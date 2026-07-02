export default function HistoryPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold">Simulation History</h2>
        <p className="text-sm text-surface-400 mt-1">Browse and compare past simulation runs</p>
      </div>

      <div className="bg-surface-900/50 border border-white/5 rounded-xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-surface-400 text-xs border-b border-white/5">
                <th className="pb-3 font-medium">ID</th>
                <th className="pb-3 font-medium">Strategy</th>
                <th className="pb-3 font-medium">Capital</th>
                <th className="pb-3 font-medium">Duration</th>
                <th className="pb-3 font-medium">Return</th>
                <th className="pb-3 font-medium">Sharpe</th>
                <th className="pb-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: "SIM-001", strategy: "Conservative", capital: "$10,000", duration: "180d", ret: "+22.5%", sharpe: "2.1", date: "2026-06-15" },
                { id: "SIM-002", strategy: "Moderate", capital: "$10,000", duration: "90d", ret: "+18.2%", sharpe: "1.8", date: "2026-06-10" },
                { id: "SIM-003", strategy: "Aggressive", capital: "$25,000", duration: "365d", ret: "+45.8%", sharpe: "1.4", date: "2026-06-01" },
              ].map((row) => (
                <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-3.5 font-mono text-xs text-brand-400">{row.id}</td>
                  <td className="py-3.5 font-medium">{row.strategy}</td>
                  <td className="py-3.5">{row.capital}</td>
                  <td className="py-3.5 text-surface-300">{row.duration}</td>
                  <td className="py-3.5 text-success">{row.ret}</td>
                  <td className="py-3.5">{row.sharpe}</td>
                  <td className="py-3.5 text-surface-400">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
