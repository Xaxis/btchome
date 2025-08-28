import React from 'react';
import { useStore, shallowEq } from '../../state/store';

export default function RentSettings() {
  const monthlyRent = useStore((st) => st.monthlyRent);
  const rentGrowthRate = useStore((st) => st.rentGrowthRate);
  const rentersInsuranceAnnual = useStore((st) => st.rentersInsuranceAnnual);
  const movingFrequencyYears = useStore((st) => st.movingFrequencyYears);
  const movingCostPerMove = useStore((st) => st.movingCostPerMove);
  const setState = (useStore as any).setState;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Field('Monthly Rent', monthlyRent, (v)=> setState({ monthlyRent: v }), 0, 20_000)}
      {Field('Rent Growth %/yr', rentGrowthRate*100, (v)=> setState({ rentGrowthRate: v/100 }), 0, 50)}
      {Field('Renter\'s Insurance $/yr', rentersInsuranceAnnual, (v)=> setState({ rentersInsuranceAnnual: v }), 0, 20_000)}
      {Field('Move every (years)', movingFrequencyYears, (v)=> setState({ movingFrequencyYears: v }), 1, 20)}
      {Field('Moving Cost $/move', movingCostPerMove, (v)=> setState({ movingCostPerMove: v }), 0, 50_000)}
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

