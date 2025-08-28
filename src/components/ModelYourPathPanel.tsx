import React, { useState } from 'react';
import { useStore } from '../state/store';
import { Sliders, CaretDown, CaretUp } from '@phosphor-icons/react';
import { formatCurrencyFull } from '../utils/format';

function clampNum(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val || 0));
}

export default function ModelYourPathPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'bitcoin' | 'home' | 'rent' | 'analysis'>('bitcoin');
  
  // All state values
  const btcAmount = useStore((s) => s.btcAmount);
  const btcPrice = useStore((s) => s.btcPrice);
  const model = useStore((s) => s.model);
  const modelConfidence = useStore((s) => s.modelConfidence);
  const dcaAmount = useStore((s) => s.dcaAmount);
  const dcaPeriod = useStore((s) => s.dcaPeriod);
  const homePrice = useStore((s) => s.homePrice);
  const downPct = useStore((s) => s.downPct);
  const purchaseTiming = useStore((s) => s.purchaseTiming);
  const mortgageRate = useStore((s) => s.mortgageRate);
  const monthlyRent = useStore((s) => s.monthlyRent);
  const rentGrowthRate = useStore((s) => s.rentGrowthRate);
  const timeframeYears = useStore((s) => s.timeframeYears);
  const chartView = useStore((s) => s.chartView);
  
  const setState = (useStore as any).setState;

  const tabs = [
    { id: 'bitcoin', label: 'Bitcoin', color: 'blue' },
    { id: 'home', label: 'Home', color: 'blue' },
    { id: 'rent', label: 'Rent', color: 'blue' },
    { id: 'analysis', label: 'Analysis', color: 'blue' },
  ] as const;

  return (
    <div className="relative z-10 bg-surface-1 rounded-2xl border border-default shadow-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 text-left hover:bg-surface-2 transition-colors duration-200 focus-ring"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
              <Sliders size={24} weight="duotone" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-primary mb-1">
                Adjust Your Path
              </h2>
              <p className="text-secondary text-sm">
                Adjust all parameters and see instant results on the chart above
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-muted">
            <span className="text-xs font-medium">
              {isExpanded ? 'Collapse' : 'Expand'}
            </span>
            {isExpanded ? (
              <CaretUp size={20} weight="bold" />
            ) : (
              <CaretDown size={20} weight="bold" />
            )}
          </div>
        </div>
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="border-t border-subtle">
          {/* Tabs */}
          <div className="border-b border-subtle">
            <div className="flex">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-6 py-4 border-b-2 transition-all duration-200 focus-ring font-medium ${
                      isActive
                        ? 'border-blue-500 text-blue-600 bg-blue-500/5'
                        : 'border-transparent text-secondary hover:text-primary hover:bg-surface-2'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'bitcoin' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* BTC Amount */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-secondary">BTC Holdings</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.1"
                        value={btcAmount}
                        onChange={(e) => setState({ btcAmount: parseFloat(e.target.value) })}
                        className="flex-1 projection-slider"
                      />
                      <span className="text-sm font-mono text-secondary min-w-[60px]">{btcAmount.toFixed(1)} BTC</span>
                    </div>
                  </div>

                  {/* Model */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-secondary">Projection Model</label>
                    <select
                      value={model}
                      onChange={(e) => setState({ model: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-default text-primary focus-ring text-sm"
                    >
                      <option value="power-law">Power Law</option>
                      <option value="saylor">Saylor Model</option>
                      <option value="log-reg">Log Regression</option>
                      <option value="s2f">Stock-to-Flow</option>
                      <option value="metcalfe">Metcalfe's Law</option>
                    </select>
                  </div>

                  {/* Model Confidence */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-secondary">Confidence</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="50"
                        max="150"
                        step="5"
                        value={Math.round(modelConfidence * 100)}
                        onChange={(e) => setState({ modelConfidence: parseInt(e.target.value) / 100 })}
                        className="flex-1 projection-slider"
                      />
                      <span className="text-sm font-medium text-blue-600 min-w-[50px]">{Math.round(modelConfidence * 100)}%</span>
                    </div>
                  </div>

                  {/* DCA */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-secondary">DCA Amount</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="2000"
                        step="50"
                        value={dcaAmount}
                        onChange={(e) => setState({ dcaAmount: parseInt(e.target.value) })}
                        className="flex-1 projection-slider"
                      />
                      <span className="text-sm font-mono text-secondary min-w-[60px]">${dcaAmount}</span>
                      <select
                        value={dcaPeriod}
                        onChange={(e) => setState({ dcaPeriod: e.target.value })}
                        className="px-2 py-1 rounded bg-surface-2 border border-default text-xs"
                      >
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'home' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Home Price */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-secondary">Home Price</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="200000"
                        max="2000000"
                        step="25000"
                        value={homePrice}
                        onChange={(e) => setState({ homePrice: parseInt(e.target.value) })}
                        className="flex-1 projection-slider"
                      />
                      <span className="text-sm font-mono text-secondary min-w-[80px]">{formatCurrencyFull(homePrice)}</span>
                    </div>
                  </div>

                  {/* Down Payment */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-secondary">Down Payment</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="5"
                        max="50"
                        step="1"
                        value={Math.round(downPct * 100)}
                        onChange={(e) => setState({ downPct: parseInt(e.target.value) / 100 })}
                        className="flex-1 projection-slider"
                      />
                      <span className="text-sm font-medium text-blue-600 min-w-[40px]">{Math.round(downPct * 100)}%</span>
                    </div>
                  </div>

                  {/* Mortgage Rate */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-secondary">Mortgage Rate</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="3"
                        max="10"
                        step="0.1"
                        value={mortgageRate * 100}
                        onChange={(e) => setState({ mortgageRate: parseFloat(e.target.value) / 100 })}
                        className="flex-1 projection-slider"
                      />
                      <span className="text-sm font-mono text-secondary min-w-[50px]">{(mortgageRate * 100).toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Purchase Timing */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-secondary">Purchase Timing</label>
                    <div className="flex gap-1">
                      {[
                        { value: 'now', label: 'Now' },
                        { value: 'year-1', label: 'Y1' },
                        { value: 'year-2', label: 'Y2' },
                        { value: 'year-3', label: 'Y3' },
                        { value: 'year-5', label: 'Y5' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setState({ purchaseTiming: option.value })}
                          className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
                            purchaseTiming === option.value
                              ? 'bg-blue-500 text-white'
                              : 'bg-surface-2 text-secondary hover:bg-surface-3'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'rent' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Monthly Rent */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-secondary">Monthly Rent</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="1000"
                        max="8000"
                        step="100"
                        value={monthlyRent}
                        onChange={(e) => setState({ monthlyRent: parseInt(e.target.value) })}
                        className="flex-1 projection-slider"
                      />
                      <span className="text-sm font-mono text-secondary min-w-[70px]">${monthlyRent.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Rent Growth */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-secondary">Rent Growth</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="8"
                        step="0.1"
                        value={rentGrowthRate * 100}
                        onChange={(e) => setState({ rentGrowthRate: parseFloat(e.target.value) / 100 })}
                        className="flex-1 projection-slider"
                      />
                      <span className="text-sm font-medium text-blue-600 min-w-[50px]">{(rentGrowthRate * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analysis' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Timeframe */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-secondary">Analysis Timeframe</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="5"
                        max="30"
                        step="1"
                        value={timeframeYears}
                        onChange={(e) => setState({ timeframeYears: parseInt(e.target.value) })}
                        className="flex-1 projection-slider"
                      />
                      <span className="text-sm font-medium text-blue-600 min-w-[60px]">{timeframeYears} years</span>
                    </div>
                  </div>

                  {/* Chart View */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-secondary">Chart View</label>
                    <div className="flex gap-1">
                      {[
                        { value: 'absolute', label: 'Absolute' },
                        { value: 'relative', label: 'Relative' },
                        { value: 'percentage', label: 'Percentage' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setState({ chartView: option.value })}
                          className={`flex-1 px-3 py-2 rounded text-xs font-medium transition-all duration-200 ${
                            chartView === option.value
                              ? 'bg-blue-500 text-white'
                              : 'bg-surface-2 text-secondary hover:bg-surface-3'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
