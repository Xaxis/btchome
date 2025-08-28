import React from 'react';
import { useStore } from '../../state/store';
import InfoIcon from '../../components/InfoIcon';
import { useScreenSize } from '../../hooks/useScreenSize';

export default function ChartControls() {
  const view = useStore((s) => s.chartView);
  const vis = useStore((s) => s.visibleSeries);
  const setState = (useStore as any).setState;
  const screenSize = useScreenSize();

  return (
    <div className="border-b border-subtle bg-surface-2/50">
      <div className="px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-6">
          {/* View Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-secondary">Chart View:</span>
              <InfoIcon
                title="Chart View Modes"
                content="Absolute shows actual dollar values. Relative compares all strategies against holding Bitcoin (baseline at $0). Percentage shows each strategy as a percentage gain/loss from the initial investment."
              />
            </div>
            <div className="flex gap-1 p-1 bg-surface-1 rounded-lg border border-subtle shadow-sm">
              {(['absolute','relative','percentage'] as const).map((v) => (
                <button
                  key={v}
                  onClick={()=> setState({ chartView: v })}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 focus-ring ${
                    view === v
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                      : 'text-secondary hover:text-primary hover:bg-surface-2'
                  }`}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Series Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-secondary hidden sm:inline">Show Series:</span>
              <span className="text-sm font-medium text-secondary sm:hidden">Series:</span>
              <InfoIcon
                title="Strategy Series"
                content="Hold Bitcoin: Keep all Bitcoin without selling. Buy House: Sell Bitcoin for down payment and buy real estate. Rent Forever: Keep Bitcoin while paying rent. Opportunity Cost: Shows the difference between the best and worst strategies."
              />
            </div>
            <div className="flex gap-1 sm:gap-2">
              {([
                {key:'hodl', label:'Hold Bitcoin', shortLabel: 'Hold', color: 'border-orange-500', bgColor: 'bg-orange-50 dark:bg-orange-500/10'},
                {key:'buy', label:'Buy House', shortLabel: 'Buy', color: 'border-emerald-500', bgColor: 'bg-emerald-50 dark:bg-emerald-500/10'},
                {key:'rent', label:'Rent Forever', shortLabel: 'Rent', color: 'border-sky-500', bgColor: 'bg-sky-50 dark:bg-sky-500/10'},
                {key:'opportunity', label:'Opportunity Cost', shortLabel: 'Opp', color: 'border-red-500', bgColor: 'bg-red-50 dark:bg-red-500/10'},
              ] as const).map((s) => (
                <button
                  key={s.key}
                  onClick={()=> setState({ visibleSeries: { ...vis, [s.key]: !(vis as any)[s.key] } })}
                  className={`px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium border-2 transition-all duration-200 focus-ring ${s.color} ${
                    (vis as any)[s.key]
                      ? `${s.bgColor} text-primary shadow-sm border-opacity-100`
                      : 'bg-surface-1 text-muted border-opacity-30 hover:border-opacity-60 hover:text-secondary'
                  }`}
                >
                  <span className="flex items-center gap-1 sm:gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      s.key === 'hodl' ? 'bg-orange-500' :
                      s.key === 'buy' ? 'bg-emerald-500' :
                      s.key === 'rent' ? 'bg-sky-500' : 'bg-red-500'
                    } ${(vis as any)[s.key] ? 'opacity-100' : 'opacity-30'}`}></span>
                    <span className="hidden sm:inline">{s.label}</span>
                    <span className="sm:hidden">{s.shortLabel}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

