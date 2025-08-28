import React from 'react';
import { useStore, shallowEq } from '../../state/store';

export default function HomeSettings() {
  const homePrice = useStore((st) => st.homePrice);
  const downPct = useStore((st) => st.downPct);
  const mortgageRate = useStore((st) => st.mortgageRate);
  const term = useStore((st) => st.term);
  const propertyTaxRate = useStore((st) => st.propertyTaxRate);
  const insuranceAnnual = useStore((st) => st.insuranceAnnual);
  const hoaMonthly = useStore((st) => st.hoaMonthly);
  const appreciationRate = useStore((st) => st.appreciationRate);
  const maintenanceRate = useStore((st) => st.maintenanceRate);
  const closingCostsPct = useStore((st) => st.closingCostsPct);
  const setState = (useStore as any).setState;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Field('Home Price', homePrice, (v)=> setState({ homePrice: v }), 0, 5_000_000)}
      {Field('Down Payment %', downPct*100, (v)=> setState({ downPct: v/100 }), 0, 100)}
      {Field('Mortgage Rate %', mortgageRate*100, (v)=> setState({ mortgageRate: v/100 }), 0, 100)}
      {Field('Term (years)', term, (v)=> setState({ term: v }), 1, 50)}
      {Field('Property Tax %', propertyTaxRate*100, (v)=> setState({ propertyTaxRate: v/100 }), 0, 10)}
      {Field('Insurance $/yr', insuranceAnnual, (v)=> setState({ insuranceAnnual: v }), 0, 100_000)}
      {Field('HOA $/mo', hoaMonthly, (v)=> setState({ hoaMonthly: v }), 0, 10_000)}
      {Field('Appreciation %/yr', appreciationRate*100, (v)=> setState({ appreciationRate: v/100 }), 0, 50)}
      {Field('Maintenance %/yr', maintenanceRate*100, (v)=> setState({ maintenanceRate: v/100 }), 0, 20)}
      {Field('Closing Costs %', closingCostsPct*100, (v)=> setState({ closingCostsPct: v/100 }), 0, 20)}
    </div>
  );
}

function Field(label: string, value: number, onChange: (v:number)=>void, min: number, max: number) {
  return (
    <div key={label}>
      <label className="block text-sm text-text-muted mb-1">{label}</label>
      <input type="number" className="w-full rounded-md bg-[var(--surface-2)] border border-[var(--border)] px-3 py-2"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e)=> onChange(clampNum(parseFloat(e.target.value), min, max))} />
    </div>
  );
}

function clampNum(n: number, min: number, max: number) {
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}

