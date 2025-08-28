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
    <section className="bg-surface-2 border-t border-subtle">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-primary mb-4">Configure Your Strategy</h2>
          <p className="text-secondary max-w-2xl mx-auto">
            Fine-tune the parameters for each strategy to match your specific situation and goals.
          </p>
        </div>



        {/* Strategy Sections */}
        <div className="space-y-8">
          {/* Section Navigation */}
          <div className="flex flex-wrap gap-2 p-2 bg-surface-1 rounded-xl border border-default">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 focus-ring flex-1 min-w-0 ${
                    activeSection === section.id
                      ? 'bg-brand text-white shadow-brand'
                      : 'text-secondary hover:text-primary hover:bg-surface-2'
                  }`}
                >
                  <Icon size={20} weight="duotone" />
                  <div className="text-left min-w-0">
                    <div className="font-medium truncate">{section.label}</div>
                    <div className={`text-xs truncate ${
                      activeSection === section.id ? 'text-white/80' : 'text-muted'
                    }`}>
                      {section.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Section Content */}
          <div className="bg-surface-1 rounded-2xl border border-default shadow-lg p-8">
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
