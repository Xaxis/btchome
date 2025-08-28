import React, { useState } from 'react';
import { House, Buildings, TrendUp, Gear, CaretDown, CaretUp } from '@phosphor-icons/react';
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

export default function StrategyConfigurationPanel() {
  const [activeSection, setActiveSection] = useState<typeof sections[number]['id']>('bitcoin');
  const [isExpanded, setIsExpanded] = useState(false);
  const ActiveComp = sections.find((s) => s.id === activeSection)!.Comp;

  return (
    <div className="relative z-10 bg-surface-1 rounded-2xl border border-default shadow-lg overflow-hidden">
      {/* Collapsible Panel Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 text-left hover:bg-surface-2 transition-colors duration-200 focus-ring"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-orange-500/10 text-orange-600">
              <Gear size={24} weight="duotone" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-primary mb-1">
                Advanced Configuration
              </h2>
              <p className="text-secondary text-sm">
                Fine-tune the parameters for each strategy to match your specific situation and goals.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-muted">
            <span className="text-xs font-medium">
              {isExpanded ? 'Collapse' : 'Expand'}
            </span>
            {isExpanded ? (
              <CaretUp size={20} weight="bold" />
            ) : (
              <CaretDown size={20} weight="bold" />
            )}
          </div>
        </div>
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="border-t border-subtle">
          {/* Integrated Tabs */}
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
                        ? 'border-orange-500 text-orange-600 bg-orange-500/5'
                        : 'border-transparent text-secondary hover:text-primary hover:bg-surface-2'
                    }`}
                  >
                    <Icon size={20} weight="duotone" />
                    <div className="text-left min-w-0">
                      <div className="font-medium truncate">{section.label}</div>
                      <div className={`text-xs truncate ${
                        isActive ? 'text-orange-600/70' : 'text-muted'
                      }`}>
                        {section.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Panel Content */}
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
      )}
    </div>
  );
}
