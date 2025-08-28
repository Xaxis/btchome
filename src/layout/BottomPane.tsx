import React from 'react';
import ProjectionChart from '../features/chart/ProjectionChart';
import ChartControls from '../features/chart/ChartControls';
import KPIs from '../features/kpis/KPIs';
import { StepConnector } from '../components/VerticalStepper';
import { useStore } from '../state/store';
import { ChartLine, Trophy } from '@phosphor-icons/react';

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
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600">
                <ChartLine size={32} weight="duotone" />
              </div>
              <h2 className="text-3xl font-bold text-primary">Strategy Projection</h2>
            </div>
            <p className="text-lg text-secondary">See how your Bitcoin compares to real estate over time</p>
          </div>

          {/* First Panel: Chart with integrated controls */}
          <div className="relative z-10 bg-surface-1 rounded-2xl border border-default shadow-lg overflow-hidden mb-12">
            <div className="p-6 border-b border-subtle">
              <h3 className="text-xl font-semibold text-primary mb-2 flex items-center gap-3">
                <span className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                  <ChartLine size={24} weight="duotone" />
                </span>
                Interactive Projection Chart
              </h3>
              <p className="text-secondary">
                Visualize how each strategy performs over your selected timeframe with dynamic controls.
              </p>
            </div>
            <ChartControls />
            <ProjectionChart />
          </div>

          {/* Second Panel: Strategy Comparison */}
          <div className="relative z-10 bg-surface-1 rounded-2xl border border-default shadow-lg p-8">
            <h3 className="text-xl font-semibold text-primary mb-6 flex items-center gap-3">
              <span className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                <Trophy size={24} weight="duotone" />
              </span>
              Strategy Comparison
            </h3>
            <p className="text-secondary mb-8">
              Final wealth comparison after {timeframeYears} years across all strategies.
            </p>
            <KPIs />
          </div>
        </div>
      </section>


    </div>
  );
}

