import React, { useState } from 'react';
import { useStore, shallowEq } from '../../state/store';
import { formatCurrencyFull } from '../../utils/format';
import { LabelWithInfo } from '../../components/InfoIcon';

export default function BitcoinSettings() {
  const btcPrice = useStore((st) => st.btcPrice);
  const btcAmount = useStore((st) => st.btcAmount);
  const dcaAmount = useStore((st) => st.dcaAmount);
  const dcaPeriod = useStore((st) => st.dcaPeriod);
  const modelConfidence = useStore((st) => st.modelConfidence);
  const capGainsTaxRate = useStore((st) => st.capGainsTaxRate);
  const loading = useStore((st) => st.loading);
  const refreshPrice = useStore((st) => st.refreshPrice);
  const setState = (useStore as any).setState;
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-secondary">BTC Holdings</label>
          <input
            type="number"
            step="0.001"
            className="w-full rounded-lg bg-surface-2 border border-default px-4 py-3 text-primary focus-ring hover:border-strong transition-all duration-200"
            value={btcAmount}
            onChange={(e)=> setState({ btcAmount: clampNum(parseFloat(e.target.value), 0, 1e6) })}
            placeholder="1.0"
          />
          <p className="text-xs text-muted">Amount of Bitcoin you currently hold</p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-secondary">Current BTC Price</label>
          <div className="flex gap-3">
            <input
              type="text"
              readOnly
              className="flex-1 rounded-lg bg-surface-3 border border-subtle px-4 py-3 text-primary font-mono"
              value={formatCurrencyFull(btcPrice)}
            />
            <button
              onClick={refreshPrice}
              disabled={loading}
              className="px-4 py-3 rounded-lg border border-default bg-surface-2 hover:bg-surface-3 focus-ring transition-all duration-200 text-sm font-medium disabled:opacity-50"
            >
              {loading ? '⟳' : '↻'}
            </button>
          </div>
          {err && <div className="text-sm text-red-600 mt-1 flex items-center gap-1">⚠️ {err}</div>}
          <p className="text-xs text-muted">Live price from CoinGecko</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <LabelWithInfo
            label="DCA Amount"
            infoTitle="Dollar Cost Averaging Amount"
            infoContent="The amount of USD you plan to invest in Bitcoin on a regular basis. DCA helps reduce the impact of volatility by spreading purchases over time. Higher amounts accelerate Bitcoin accumulation but require more cash flow. Set to $0 to disable DCA."
          />
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">$</span>
            <input
              type="number"
              className="w-full rounded-lg bg-surface-2 border border-default pl-8 pr-4 py-3 text-primary focus-ring hover:border-strong transition-all duration-200"
              value={dcaAmount}
              onChange={(e)=> setState({ dcaAmount: clampNum(parseFloat(e.target.value), 0, 1e9) })}
              placeholder="500"
            />
          </div>
          <p className="text-xs text-muted">Dollar cost average amount per period</p>
        </div>

        <div className="space-y-2">
          <LabelWithInfo
            label="DCA Frequency"
            infoTitle="DCA Purchase Frequency"
            infoContent="How often to make Bitcoin purchases. Weekly provides the most dollar-cost averaging benefit but requires more frequent transactions. Monthly is most common and practical. Quarterly reduces transaction frequency but provides less averaging benefit."
          />
          <select
            className="w-full rounded-lg bg-surface-2 border border-default px-4 py-3 text-primary focus-ring hover:border-strong transition-all duration-200"
            value={dcaPeriod}
            onChange={(e)=> setState({ dcaPeriod: e.target.value as any })}
          >
            <option value="weekly">Weekly (52x/year)</option>
            <option value="monthly">Monthly (12x/year)</option>
            <option value="quarterly">Quarterly (4x/year)</option>
          </select>
          <p className="text-xs text-muted">How often to purchase Bitcoin</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-secondary">Model Confidence</label>
          <div className="space-y-3">
            <input
              type="range"
              min={50}
              max={150}
              step={1}
              className="w-full h-2 bg-surface-3 rounded-lg appearance-none cursor-pointer strategy-slider"
              value={Math.round(modelConfidence * 100)}
              onChange={(e)=> setState({ modelConfidence: clampNum(parseInt(e.target.value,10)/100, 0.5, 1.5) })}
            />
            <div className="flex justify-between text-xs text-muted">
              <span>Conservative (50%)</span>
              <span className="font-medium text-orange-600">{Math.round(modelConfidence*100)}%</span>
              <span>Aggressive (150%)</span>
            </div>
          </div>
          <p className="text-xs text-muted">Adjust projection model confidence level</p>
        </div>

        <div className="space-y-2">
          <LabelWithInfo
            label="Capital Gains Tax Rate"
            infoTitle="Capital Gains Tax Rate"
            infoContent="The tax rate applied when selling Bitcoin for a home down payment. In the US, this is typically 0% (if held >1 year and low income), 15% (most people), or 20% (high income). Check your local tax laws and consider consulting a tax professional for your specific situation."
          />
          <div className="relative">
            <input
              type="number"
              min="0"
              max="50"
              step="0.1"
              className="w-full rounded-lg bg-surface-2 border border-default pr-8 pl-4 py-3 text-primary focus-ring hover:border-strong transition-all duration-200"
              value={Math.round(capGainsTaxRate * 100)}
              onChange={(e)=> setState({ capGainsTaxRate: clampNum(parseFloat(e.target.value)/100, 0, 0.5) })}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted">%</span>
          </div>
          <p className="text-xs text-muted">Tax rate applied when selling BTC for down payment</p>
        </div>
      </div>
    </div>
  );
}

function clampNum(n: number, min: number, max: number) {
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}

