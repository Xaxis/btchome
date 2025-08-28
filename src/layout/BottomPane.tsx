import React from 'react';
import ProjectionChart from '../features/chart/ProjectionChart';
import ChartControls from '../features/chart/ChartControls';
import KPIs from '../features/kpis/KPIs';
import { StepConnector } from '../components/VerticalStepper';
import { useStore } from '../state/store';
import { ChartLine, Trophy, ArrowUp } from '@phosphor-icons/react';

export default function BottomPane() {
  const timeframeYears = useStore((s) => s.timeframeYears);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
                Projection Chart
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

      {/* Final Terminating Circle - Back to Top */}
      <div className="relative pb-20 projection-gradient">
        {/* Extended spine line to terminating circle */}
        <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-0 z-[1]" style={{ height: '56px' }}>
          <div className="spine-line absolute left-1/2 -translate-x-1/2 h-full"></div>
        </div>

        {/* Terminating Circle - Back to Top Button */}
        <div className="flex justify-center pt-16">
          <div className="relative">
            {/* Background circle to hide spine line */}
            <div className="absolute inset-0 w-16 h-16 -m-2 rounded-full bg-surface-1 z-[5]"></div>

            <button
              onClick={scrollToTop}
              className="group relative w-12 h-12 rounded-full bg-surface-1 border-2 border-default hover:border-strong transition-all duration-300 focus-ring z-[10]"
              aria-label="Back to top"
            >
              {/* Circle background with gradient on hover */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-surface-1 to-surface-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Arrow icon */}
              <div className="relative z-10 flex items-center justify-center h-full">
                <ArrowUp
                  size={20}
                  weight="bold"
                  className="text-secondary group-hover:text-primary transition-colors duration-300 group-hover:scale-110 transform transition-transform duration-300"
                />
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-surface-3 text-secondary text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                Back to top
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

