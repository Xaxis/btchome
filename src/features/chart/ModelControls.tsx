import React from 'react';
import { useStore } from '../../state/store';

export default function ModelControls() {
  const model = useStore((st)=> st.model);
  const timeframeYears = useStore((st)=> st.timeframeYears);
  const set = (useStore as any).setState;
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-secondary">Projection Model</label>
        <select
          className="px-3 py-2 rounded-lg bg-surface-2 border border-default text-primary focus-ring hover:border-strong transition-all duration-200 min-w-[140px]"
          value={model}
          onChange={(e)=> set({ model: e.target.value as any })}
        >
          <option value="power-law">Power Law</option>
          <option value="saylor">Saylor Model</option>
          <option value="log-reg">Log Regression</option>
          <option value="s2f">Stock-to-Flow</option>
          <option value="metcalfe">Metcalfe's Law</option>
        </select>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-secondary">Timeframe</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={50}
            className="w-20 px-3 py-2 rounded-lg bg-surface-2 border border-default text-primary focus-ring hover:border-strong transition-all duration-200 text-center"
            value={timeframeYears}
            onChange={(e)=> set({ timeframeYears: Math.max(1, Math.min(50, parseInt(e.target.value,10) || 1)) })}
          />
          <span className="text-sm text-muted">years</span>
        </div>
      </div>
    </div>
  );
}

