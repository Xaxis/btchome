import React from 'react';
import ProjectionChart from '../features/chart/ProjectionChart';
import ChartControls from '../features/chart/ChartControls';
import KPIs from '../features/kpis/KPIs';
import StrategyConfiguration from './StrategyConfiguration';
import { StepSeparator, ConnectedSection } from '../components/VerticalStepper';
import { useStore } from '../state/store';

export default function BottomPane() {
  const timeframeYears = useStore((s) => s.timeframeYears);

  return (
    <div>
      {/* Step 3: Strategy Projection */}
      <ConnectedSection isActive={false}>
        <section className="projection-gradient border-y border-subtle">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-primary mb-4">Strategy Projection</h2>
              <p className="text-lg text-secondary">See how your Bitcoin compares to real estate over time</p>
            </div>

            {/* Chart with integrated controls */}
            <div className="bg-surface-1 rounded-2xl border border-default shadow-lg overflow-hidden">
              <ChartControls />
              <ProjectionChart />
            </div>
          </div>
        </section>
      </ConnectedSection>

      <StepSeparator
        title="Results & Configuration"
        isActive={false}
      />

      {/* Step 4: Results and Configuration */}
      <ConnectedSection isActive={false}>
        <section className="results-gradient">
          <div className="mx-auto max-w-7xl px-6 py-16">
            {/* KPIs Section */}
            <div className="mb-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-primary mb-4">Strategy Comparison</h2>
                <p className="text-lg text-secondary">Final wealth comparison after {timeframeYears} years</p>
              </div>
              <KPIs />
            </div>

            {/* Advanced Configuration */}
            <StrategyConfiguration />
          </div>
        </section>
      </ConnectedSection>
    </div>
  );
}

