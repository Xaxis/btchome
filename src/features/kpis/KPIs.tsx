import React from 'react';
import { formatCurrencyResponsive } from '../../utils/format';
import { useStore, shallowEq } from '../../state/store';
import { getScenarioInputs } from '../../state/selectors';
import { runScenario } from '../../domain/calc/scenarioEngine';
import { Info } from '@phosphor-icons/react';
import { useScreenSize } from '../../hooks/useScreenSize';

export default function KPIs() {
  const store = useStore();
  const screenSize = useScreenSize();
  const res = runScenario(getScenarioInputs(store as any));
  const idx = res.holdAllValue.length - 1;
  const holdAll = res.holdAllValue[idx];
  const buyHouse = res.buyHouseValue[idx];
  const rentForever = res.rentForeverValue[idx];
  const worstDelta = Math.min(holdAll, buyHouse, rentForever) - Math.max(holdAll, buyHouse, rentForever);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: 'Hold All Bitcoin', value: holdAll, modal: 'hold-bitcoin-info', color: 'text-orange-600' },
        { label: 'Buy House', value: buyHouse, modal: 'buy-house-info', color: 'text-emerald-600' },
        { label: 'Rent Forever', value: rentForever, modal: 'rent-forever-info', color: 'text-sky-600' },
        { label: 'Opportunity Cost', value: worstDelta, modal: 'opportunity-cost-info', color: 'text-red-600' },
      ].map((k) => (
        <div key={k.label} className="group rounded-xl border border-default bg-surface-1 p-4 shadow-md hover:shadow-lg hover:border-strong transition-all duration-200">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="text-sm font-medium text-muted mb-1">{k.label}</div>
              <div className={`kpi-number text-2xl font-bold ${k.color}`}>
                {formatCurrencyResponsive(k.value, screenSize)}
              </div>
            </div>
            <button
              className="p-1.5 rounded-lg text-muted hover:text-secondary hover:bg-surface-2 focus-ring transition-all duration-200"
              aria-label={`Info about ${k.label}`}
              onClick={()=> (useStore as any).setState({ modals: { active: k.modal } })}
            >
              <Info size={18} weight="duotone" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

