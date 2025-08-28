import React from 'react';
import { useStore } from '../state/store';
import { House, Calendar, CurrencyDollar } from '@phosphor-icons/react';
import { LabelWithInfo } from '../components/InfoIcon';
import { formatCurrencyFull } from '../utils/format';

export default function PurchasePlanningSection() {
  const homePrice = useStore((s) => s.homePrice);
  const downPct = useStore((s) => s.downPct);
  const purchaseTiming = useStore((s) => s.purchaseTiming);
  const setState = (useStore as any).setState;

  const downPaymentAmount = homePrice * downPct;

  return (
    <section className="purchase-gradient border-y border-subtle">
      <div className="mx-auto max-w-7xl px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600">
              <House size={32} weight="duotone" />
            </div>
            <h2 className="text-3xl font-bold text-primary">Purchase Planning</h2>
          </div>
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            Configure your home purchase parameters and timing to see how it affects your Bitcoin strategy.
          </p>
        </div>

        {/* Home Purchase Inputs */}
        <div className="bg-surface-1 rounded-2xl border border-default shadow-lg p-8 mb-12">
          <h3 className="text-xl font-semibold text-primary mb-6 flex items-center gap-3">
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <CurrencyDollar size={24} weight="duotone" />
            </span>
            Home Purchase Details
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Home Price */}
            <div className="space-y-4">
              <LabelWithInfo 
                label="Home Price"
                infoTitle="Home Purchase Price"
                infoContent="The total purchase price of the home you're considering. This affects how much Bitcoin you'll need to sell for the down payment and your overall mortgage amount. Consider your local market conditions and future appreciation potential."
                className="mb-3"
              />
              
              <div className="space-y-3">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-medium text-muted">$</span>
                  <input 
                    type="number" 
                    step="10000"
                    className="w-full text-2xl font-bold pl-8 pr-4 py-4 rounded-xl bg-surface-2 border border-default text-primary focus-ring hover:border-strong transition-all duration-200 text-center"
                    value={homePrice}
                    onChange={(e) => setState({ homePrice: Math.max(0, parseFloat(e.target.value) || 0) })}
                    placeholder="500000"
                  />
                </div>
                
                <div className="p-3 rounded-lg bg-surface-3 border border-subtle">
                  <div className="text-xs text-muted mb-1">Formatted Price</div>
                  <div className="text-lg font-bold text-emerald-600">{formatCurrencyFull(homePrice)}</div>
                </div>
              </div>
            </div>

            {/* Down Payment Percentage */}
            <div className="space-y-4">
              <LabelWithInfo 
                label="Down Payment Percentage"
                infoTitle="Down Payment Percentage"
                infoContent="The percentage of the home price you'll pay upfront. Higher down payments reduce monthly mortgage payments and eliminate PMI, but require selling more Bitcoin. Typical ranges are 10-20% (with PMI) or 20%+ (no PMI)."
                className="mb-3"
              />
              
              <div className="space-y-4">
                <div className="relative">
                  <input 
                    type="range" 
                    min="5" 
                    max="50" 
                    step="1"
                    className="w-full h-3 bg-surface-3 rounded-lg appearance-none cursor-pointer slider"
                    value={Math.round(downPct * 100)}
                    onChange={(e) => setState({ downPct: parseInt(e.target.value, 10) / 100 })}
                  />
                  <div className="flex justify-between text-xs text-muted mt-2">
                    <span>5%</span>
                    <span>50%</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">{Math.round(downPct * 100)}%</div>
                  <div className="text-sm text-muted">of home price</div>
                </div>
                
                <div className="p-3 rounded-lg bg-surface-3 border border-subtle text-center">
                  <div className="text-xs text-muted mb-1">Down Payment Amount</div>
                  <div className="text-lg font-bold text-primary">{formatCurrencyFull(downPaymentAmount)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Purchase Timing */}
        <div className="bg-surface-1 rounded-2xl border border-default shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <Calendar size={24} weight="duotone" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-primary">Purchase Timing</h3>
              <p className="text-sm text-muted">When do you plan to buy this house?</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {[
              { value: 'now', label: 'Buy Now', description: 'Purchase immediately', year: 0 },
              { value: 'year-1', label: 'Year 1', description: 'Buy in 1 year', year: 1 },
              { value: 'year-2', label: 'Year 2', description: 'Buy in 2 years', year: 2 },
              { value: 'year-3', label: 'Year 3', description: 'Buy in 3 years', year: 3 },
              { value: 'year-5', label: 'Year 5', description: 'Buy in 5 years', year: 5 },
            ].map((option) => {
              const isSelected = purchaseTiming === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => setState({ purchaseTiming: option.value as any })}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-center group ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 shadow-lg'
                      : 'border-border-default hover:border-emerald-300 bg-surface-2 hover:shadow-md'
                  }`}
                >
                  <div className={`text-lg font-bold mb-1 transition-colors duration-200 ${
                    isSelected ? 'text-emerald-600' : 'text-primary group-hover:text-emerald-600'
                  }`}>
                    {option.label}
                  </div>
                  <div className="text-sm text-muted">{option.description}</div>
                  
                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="mt-2 w-2 h-2 bg-emerald-500 rounded-full mx-auto" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
            <div className="text-sm text-emerald-700 dark:text-emerald-300">
              <strong>Impact:</strong> {purchaseTiming === 'now' 
                ? 'Buying now means selling Bitcoin immediately for the down payment, but you stop paying rent right away.'
                : `Waiting ${purchaseTiming.split('-')[1]} year(s) allows your Bitcoin to appreciate more, but you'll continue paying rent during this time.`
              }
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
