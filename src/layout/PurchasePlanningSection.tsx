import React from 'react';
import { useStore } from '../state/store';
import { House, Calendar, CurrencyDollar } from '@phosphor-icons/react';
import { LabelWithInfo } from '../components/InfoIcon';
import { formatCurrencyFull, formatBTC } from '../utils/format';

export default function PurchasePlanningSection() {
  const homePrice = useStore((s) => s.homePrice);
  const downPct = useStore((s) => s.downPct);
  const purchaseTiming = useStore((s) => s.purchaseTiming);
  const btcPrice = useStore((s) => s.btcPrice);
  const setState = (useStore as any).setState;

  const downPaymentAmount = homePrice * downPct;
  const homePriceInBTC = homePrice / btcPrice;
  const downPaymentInBTC = downPaymentAmount / btcPrice;

  return (
    <section className="purchase-gradient relative">
      {/* Local spine segment - behind cards but visible under text */}
      <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-0 bottom-0 z-[1]">
        <div className="spine-line absolute left-1/2 -translate-x-1/2 h-full"></div>
      </div>
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        {/* Header */}
        <div className="text-center mb-12 spine-text-area">
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

        {/* Unified Home Purchase Panel */}
        <div className="relative z-10 bg-surface-1 rounded-2xl border border-default shadow-lg p-8 mb-12">
          <h3 className="text-xl font-semibold text-primary mb-8 flex items-center gap-3">
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <CurrencyDollar size={24} weight="duotone" />
            </span>
            Purchase Details
          </h3>

          {/* Input Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Home Price Input */}
            <div className="space-y-4">
              <LabelWithInfo
                label="Home Price"
                infoTitle="Home Purchase Price"
                infoContent="The total purchase price of the home you're considering. This affects how much Bitcoin you'll need to sell for the down payment and your overall mortgage amount. Consider your local market conditions and future appreciation potential."
                className="mb-3"
              />

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
            </div>

            {/* Down Payment Percentage Input */}
            <div className="space-y-4">
              <LabelWithInfo
                label="Down Payment Percentage"
                infoTitle="Down Payment Percentage"
                infoContent="The percentage of the home price you'll pay upfront. Higher down payments reduce monthly mortgage payments and eliminate PMI, but require selling more Bitcoin. Typical ranges are 10-20% (with PMI) or 20%+ (no PMI)."
                className="mb-3"
              />

              <div className="relative">
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="1"
                  className="purchase-slider w-full cursor-pointer"
                  value={Math.round(downPct * 100)}
                  onChange={(e) => setState({ downPct: parseInt(e.target.value, 10) / 100 })}
                />
                <div className="flex justify-between text-xs text-muted mt-2">
                  <span>5%</span>
                  <span>50%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Row */}
          <div className="mt-8 pt-6 border-t border-subtle">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Home Price - USD & BTC */}
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-center">
              <div className="text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-2">Home Price</div>
              <div className="text-xl font-bold text-emerald-600 mb-1">{formatCurrencyFull(homePrice)}</div>
              <div className="text-sm font-medium text-emerald-600/70">{formatBTC(homePriceInBTC, 2)}</div>
            </div>

            {/* Down Payment Percentage Display */}
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-center">
              <div className="text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-2">Down Payment</div>
              <div className="text-xl font-bold text-emerald-600">{Math.round(downPct * 100)}%</div>
              <div className="text-xs text-emerald-600/80">of home price</div>
            </div>

            {/* Down Payment Amount - USD & BTC */}
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-center">
              <div className="text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-2">Amount Needed</div>
              <div className="text-xl font-bold text-emerald-600 mb-1">{formatCurrencyFull(downPaymentAmount)}</div>
              <div className="text-sm font-medium text-emerald-600/70">{formatBTC(downPaymentInBTC, 3)}</div>
            </div>
          </div>
          </div>
        </div>

        {/* Purchase Timing */}
        <div className="relative z-10 bg-surface-1 rounded-2xl border border-default shadow-lg p-8">
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
              <strong>Strategy:</strong> {purchaseTiming === 'now'
                ? 'Immediate purchase maximizes time building home equity and eliminates rent payments, but requires selling Bitcoin at current prices.'
                : `Delaying ${purchaseTiming.split('-')[1]} year(s) allows Bitcoin to potentially appreciate while you continue renting, creating a timing vs. opportunity cost trade-off.`
              }
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
