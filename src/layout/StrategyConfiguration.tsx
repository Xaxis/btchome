import React, { useState } from 'react';
import { House, Buildings, TrendUp } from '@phosphor-icons/react';
import BitcoinSettings from '../features/customize/BitcoinSettings';
import HomeSettings from '../features/customize/HomeSettings';
import RentSettings from '../features/customize/RentSettings';

const sections = [
  { 
    id: 'bitcoin', 
    label: 'Bitcoin Strategy', 
    icon: TrendUp,
    description: 'Configure your Bitcoin holdings and DCA strategy',
    Comp: BitcoinSettings 
  },
  { 
    id: 'home', 
    label: 'Home Purchase', 
    icon: House,
    description: 'Set home price, mortgage terms, and purchase timing',
    Comp: HomeSettings 
  },
  { 
    id: 'rent', 
    label: 'Rental Strategy', 
    icon: Buildings,
    description: 'Configure rent costs, growth rates, and moving expenses',
    Comp: RentSettings 
  },
] as const;

export default function StrategyConfiguration() {
  const [activeSection, setActiveSection] = useState<typeof sections[number]['id']>('bitcoin');
  const ActiveComp = sections.find((s) => s.id === activeSection)!.Comp;

  return (
    <section className="hero-gradient relative">
      {/* Local spine segment - behind cards but visible under text */}
      <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-0 bottom-0 z-[1]">
        <div className="spine-line absolute left-1/2 -translate-x-1/2 h-full"></div>
      </div>
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        {/* Header */}
        <div className="text-center mb-12 spine-text-area">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-brand/10 text-brand">
              <TrendUp size={32} weight="duotone" />
            </div>
            <h2 className="text-3xl font-bold text-primary">Configure Your Strategy</h2>
          </div>
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            Fine-tune the parameters for each strategy to match your specific situation and goals.
          </p>
        </div>

        {/* Integrated Card with Tabs */}
        <div className="relative z-10 bg-surface-1 rounded-2xl border border-default shadow-lg overflow-hidden">
          {/* Card Header with Integrated Tabs */}
          <div className="border-b border-subtle">
            <div className="flex flex-wrap">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-3 px-6 py-4 border-b-2 transition-all duration-200 focus-ring flex-1 min-w-0 relative ${
                      isActive
                        ? 'border-brand text-brand bg-brand/5'
                        : 'border-transparent text-secondary hover:text-primary hover:bg-surface-2'
                    }`}
                  >
                    <Icon size={20} weight="duotone" />
                    <div className="text-left min-w-0">
                      <div className="font-medium truncate">{section.label}</div>
                      <div className={`text-xs truncate ${
                        isActive ? 'text-brand/70' : 'text-muted'
                      }`}>
                        {section.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card Content */}
          <div className="p-8">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-primary mb-2">
                {sections.find((s) => s.id === activeSection)!.label}
              </h3>
              <p className="text-secondary">
                {sections.find((s) => s.id === activeSection)!.description}
              </p>
            </div>

            <ActiveComp />
          </div>
        </div>
      </div>
    </section>
  );
}
