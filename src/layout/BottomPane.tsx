import React from 'react';
import ProjectionChart from '../features/chart/ProjectionChart';
import ChartControls from '../features/chart/ChartControls';
import KPIs from '../features/kpis/KPIs';
import { StepConnector } from '../components/VerticalStepper';
import { useStore } from '../state/store';

export default function BottomPane() {
  // Helper to compute whether this is the last step section; if so, trim the spine to terminate at circle top
  const lastStepTrimClass = "after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:bottom-0 after:w-[2px] after:h-6 after:bg-transparent";
  const timeframeYears = useStore((s) => s.timeframeYears);

  return (
    <div>
      {/* Step 3: Strategy Projection */}
      <section className="projection-gradient relative">
        {/* Local spine segment - behind cards but visible under text */}
        <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-0 bottom-0 z-[1]">
          <div className="spine-line absolute left-1/2 -translate-x-1/2 h-full"></div>
        </div>
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
          <div className="text-center mb-12 spine-text-area">
            <h2 className="text-3xl font-bold text-primary mb-4">Strategy Projection</h2>
            <p className="text-lg text-secondary">See how your Bitcoin compares to real estate over time</p>
          </div>

          {/* Chart with integrated controls */}
          <div className="relative z-10 bg-surface-1 rounded-2xl border border-default shadow-lg overflow-hidden">
            <ChartControls />
            <ProjectionChart />
          </div>
        </div>
      </section>

      <StepConnector
        title="Results & Configuration"
        isActive={false}
      />

      {/* Step 4: Results */}
      <section className="results-gradient relative">
        {/* Local spine segment for final section - behind cards but visible under text */}
        <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-0 bottom-0 z-[1]">
          <div className="spine-line absolute left-1/2 -translate-x-1/2 h-full"></div>
        </div>
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
          {/* KPIs Section */}
          <div className="text-center mb-12 spine-text-area">
            <h2 className="text-3xl font-bold text-primary mb-4">Strategy Comparison</h2>
            <p className="text-lg text-secondary">Final wealth comparison after {timeframeYears} years</p>
          </div>
          <KPIs />
        </div>
      </section>
    </div>
  );
}

