export default function SimulatePage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold">Run Simulation</h2>
        <p className="text-sm text-surface-400 mt-1">Configure and execute yield optimization simulations</p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Configuration */}
        <div className="bg-surface-900/50 border border-white/5 rounded-xl p-6 space-y-6">
          <h3 className="text-sm font-semibold">Configuration</h3>

          <div>
            <label className="text-xs text-surface-400 block mb-2">Initial Capital</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 text-sm">$</span>
              <input
                type="text"
                defaultValue="10,000"
                className="w-full bg-surface-800 border border-white/10 rounded-lg pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:border-brand-500/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-surface-400 block mb-2">Duration (days)</label>
            <input
              type="range"
              min="30"
              max="365"
              defaultValue="180"
              className="w-full accent-brand-500"
            />
            <div className="flex justify-between text-xs text-surface-500 mt-1">
              <span>30</span>
              <span>180</span>
              <span>365</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-surface-400 block mb-2">Risk Profile</label>
            <div className="grid grid-cols-3 gap-2">
              {["Conservative", "Moderate", "Aggressive"].map((r) => (
                <button
                  key={r}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                    r === "Conservative"
                      ? "bg-brand-500/10 border-brand-500/30 text-brand-400"
                      : "bg-surface-800 border-white/10 text-surface-400 hover:border-white/20"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-surface-400 block mb-2">Market Condition</label>
            <select className="w-full bg-surface-800 border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500/50 transition-colors">
              <option>Bull Market</option>
              <option>Bear Market</option>
              <option>Volatile</option>
              <option>Normal</option>
            </select>
          </div>

          <button className="w-full bg-brand-500 hover:bg-brand-600 text-white py-3 rounded-lg text-sm font-medium transition-all">
            Run Simulation
          </button>
        </div>

        {/* Results Preview */}
        <div className="bg-surface-900/50 border border-white/5 rounded-xl p-6">
          <h3 className="text-sm font-semibold mb-4">Results</h3>
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <p className="text-sm text-surface-400">Configure and run a simulation to see results</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
