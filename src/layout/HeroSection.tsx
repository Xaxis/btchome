import React, { useState } from 'react';
import { useStore } from '../state/store';
import { formatCurrencyFull } from '../utils/format';
import { TrendUp, Coins, Calendar, ChartLineUp } from '@phosphor-icons/react';
import { LabelWithInfo } from '../components/InfoIcon';
import StrategyConfigurationPanel from '../components/StrategyConfigurationPanel';

export default function HeroSection() {
  const btcPrice = useStore((s) => s.btcPrice);
  const btcAmount = useStore((s) => s.btcAmount);
  const model = useStore((s) => s.model);
  const timeframeYears = useStore((s) => s.timeframeYears);
  const modelConfidence = useStore((s) => s.modelConfidence);
  const fetchPrice = useStore((s) => s.fetchPrice);
  const setState = (useStore as any).setState;

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function refreshPrice() {
    setLoading(true);
    setErr(null);
    try {
      await fetchPrice();
    } catch (e: any) {
      setErr(e?.message || 'Failed to fetch price');
    }
    setLoading(false);
  }

  const currentValue = btcAmount * btcPrice;

  return (
    <section className="hero-gradient relative">
      {/* Local spine segment - behind cards but visible under text */}
      <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-0 bottom-0 z-[1]">
        <div className="spine-line absolute left-1/2 -translate-x-1/2 h-full"></div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        {/* Header */}

        <div className="text-center mb-12 spine-text-area">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-orange-500/10 text-orange-600">
              <ChartLineUp size={32} weight="duotone" />
            </div>
            <h1 className="text-4xl font-bold text-primary">Bitcoin vs Real Estate Strategy</h1>
          </div>
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            Compare holding Bitcoin against buying a house or renting forever.
            Make informed financial decisions with data-driven projections.
          </p>
        </div>

        {/* Primary Inputs */}
        <div className="relative z-10 bg-surface-1 rounded-2xl border border-default shadow-lg p-8">
          <h2 className="text-xl font-semibold text-primary mb-6 flex items-center gap-3">
            <span className="p-2 rounded-lg bg-orange-500/10 text-orange-600">
              <Coins size={24} weight="duotone" />
            </span>
            Start Your Analysis
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Bitcoin Holdings */}
            <div className="space-y-4">
              <LabelWithInfo
                label="Your Bitcoin Holdings"
                infoTitle="Bitcoin Holdings"
                infoContent="Enter the amount of Bitcoin you currently own. This will be used as the baseline for all strategy comparisons. You can enter fractional amounts (e.g., 0.5 BTC). The current USD value will be calculated automatically using live market prices."
                className="mb-3"
              />

              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="number"
                    step="0.001"
                    className="w-full text-2xl font-bold px-4 py-4 rounded-xl bg-surface-2 border border-default text-primary focus-ring hover:border-strong transition-all duration-200 text-center"
                    value={btcAmount}
                    onChange={(e) => setState({ btcAmount: Math.max(0, parseFloat(e.target.value) || 0) })}
                    placeholder="1.0"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-medium text-muted">BTC</span>
                </div>



                {err && (
                  <div className="text-sm text-red-600 flex items-center gap-1">
                    ⚠️ {err}
                  </div>
                )}
              </div>
            </div>

            {/* Projection Model */}
            <div className="space-y-4">
              <LabelWithInfo
                label="Projection Model"
                infoTitle="Bitcoin Projection Models"
                infoContent="Choose how Bitcoin's future price should be projected. Power Law uses historical growth patterns (most optimistic). Saylor Model reflects institutional adoption scenarios. Log Regression assumes diminishing returns over time. Stock-to-Flow is based on Bitcoin's scarcity and halving cycles. Metcalfe's Law correlates price with network adoption."
                className="mb-3"
              />

              <select
                className="w-full text-lg font-medium px-4 py-4 rounded-xl bg-surface-2 border border-default text-primary focus-ring hover:border-strong transition-all duration-200"
                value={model}
                onChange={(e) => setState({ model: e.target.value as any })}
              >
                <option value="power-law">Power Law (Aggressive)</option>
                <option value="saylor">Saylor Model (Moderate)</option>
                <option value="log-reg">Log Regression (Conservative)</option>
                <option value="s2f">Stock-to-Flow (Cyclical)</option>
                <option value="metcalfe">Metcalfe's Law (Network)</option>
              </select>


            </div>

            {/* Timeframe */}
            <div className="space-y-4">
              <LabelWithInfo
                label="Analysis Timeframe"
                infoTitle="Analysis Timeframe"
                infoContent="Set how many years into the future to project. Longer timeframes show the power of compound growth but become less reliable. Most financial advisors recommend 5-10 year horizons for major decisions like home purchases. Consider your personal timeline and risk tolerance."
                className="mb-3"
              />

              <div className="relative">
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  className="hero-slider w-full cursor-pointer"
                  value={timeframeYears}
                  onChange={(e) => setState({ timeframeYears: parseInt(e.target.value, 10) })}
                />
                <div className="flex justify-between text-xs text-muted mt-2">
                  <span>1 year</span>
                  <span>30 years</span>
                </div>
              </div>
            </div>

            {/* Model Confidence */}
            <div className="space-y-4">
              <LabelWithInfo
                label="Model Confidence"
                infoTitle="Model Confidence Level"
                infoContent="Adjust how conservative or aggressive the projection model should be. 100% uses the model as-is. Lower values (50-90%) create more conservative projections, while higher values (110-150%) create more optimistic scenarios. This helps account for uncertainty and your risk tolerance."
                className="mb-3"
              />

              <div className="relative">
                <input
                  type="range"
                  min="50"
                  max="150"
                  step="5"
                  className="hero-slider w-full cursor-pointer"
                  value={Math.round(modelConfidence * 100)}
                  onChange={(e) => setState({ modelConfidence: parseInt(e.target.value, 10) / 100 })}
                />
                <div className="flex justify-between text-xs text-muted mt-2">
                  <span>Conservative</span>
                  <span>Aggressive</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contextual Information Bar */}
          <div className="mt-8 p-4 rounded-xl bg-surface-2 border border-subtle">
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
              {/* Left: Live Price */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-muted">Live BTC:</span>
                  <span className="font-mono font-semibold text-primary">{formatCurrencyFull(btcPrice)}</span>
                </div>
                <button
                  onClick={refreshPrice}
                  disabled={loading}
                  className="p-1.5 rounded-lg bg-surface-3 hover:bg-surface-1 text-muted hover:text-secondary transition-all duration-200 disabled:opacity-50"
                  title="Refresh price"
                >
                  {loading ? '⟳' : '↻'}
                </button>
              </div>

              {/* Center: Model & Period */}
              <div className="flex items-center gap-6 text-muted">
                <div className="flex items-center gap-2">
                  <span>Model:</span>
                  <span className="text-secondary font-medium">
                    {model === 'power-law' && 'Power Law'}
                    {model === 'saylor' && 'Saylor'}
                    {model === 'log-reg' && 'Log Regression'}
                    {model === 's2f' && 'Stock-to-Flow'}
                    {model === 'metcalfe' && 'Metcalfe'}
                  </span>
                </div>
                <div className="hidden sm:block w-px h-4 bg-border-default"></div>
                <div className="flex items-center gap-2">
                  <span>Period:</span>
                  <span className="text-secondary font-medium">{new Date().getFullYear()}-{new Date().getFullYear() + timeframeYears}</span>
                </div>
              </div>

              {/* Right: Confidence */}
              <div className="flex items-center gap-2">
                <span className="text-muted">Confidence:</span>
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                  modelConfidence < 1 ? 'bg-blue-500/10 text-blue-600' :
                  modelConfidence > 1 ? 'bg-red-500/10 text-red-600' :
                  'bg-green-500/10 text-green-600'
                }`}>
                  {modelConfidence < 1 ? 'Conservative' : modelConfidence > 1 ? 'Aggressive' : 'Standard'}
                </span>
              </div>
            </div>
          </div>

          {/* Row 3: Summary Cards - Aligned with columns above */}
          <div className="mt-8 pt-6 border-t border-subtle">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Bitcoin Holdings Card */}
              <div className="p-4 rounded-lg bg-surface-2 text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">{btcAmount.toFixed(3)}</div>
                <div className="text-sm text-muted">Bitcoin Holdings</div>
              </div>

              {/* Current Value Card */}
              <div className="p-4 rounded-lg bg-surface-2 text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">{formatCurrencyFull(currentValue)}</div>
                <div className="text-sm text-muted">Current Value</div>
              </div>

              {/* Analysis Period Card */}
              <div className="p-4 rounded-lg bg-surface-2 text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">{timeframeYears}Y</div>
                <div className="text-sm text-muted">Analysis Period</div>
              </div>

              {/* Model Confidence Card */}
              <div className="p-4 rounded-lg bg-surface-2 text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">{Math.round(modelConfidence * 100)}%</div>
                <div className="text-sm text-muted">Model Confidence</div>
              </div>
            </div>
          </div>
        </div>

        {/* Strategy Configuration Panel */}
        <div className="mt-12 relative z-10">
          <StrategyConfigurationPanel />
        </div>
      </div>
    </section>
  );
}
