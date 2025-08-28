import type { Store } from './store';
import type { ScenarioInputs } from '../domain/calc/scenarioEngine';

export function getScenarioInputs(s: Store): ScenarioInputs {
  return {
    years: s.timeframeYears,
    btcPrice: s.btcPrice,
    btcAmount: s.btcAmount,
    model: s.model,
    modelConfidence: s.modelConfidence,
    dcaAmount: s.dcaAmount,
    dcaPeriod: s.dcaPeriod,
    capGainsTaxRate: s.capGainsTaxRate,
    // Home
    homePrice: s.homePrice,
    downPct: s.downPct,
    mortgageRate: s.mortgageRate,
    term: s.term,
    propertyTaxRate: s.propertyTaxRate,
    insuranceAnnual: s.insuranceAnnual,
    hoaMonthly: s.hoaMonthly,
    appreciationRate: s.appreciationRate,
    maintenanceRate: s.maintenanceRate,
    closingCostsPct: s.closingCostsPct,
    // Rent
    monthlyRent: s.monthlyRent,
    rentGrowthRate: s.rentGrowthRate,
    rentersInsuranceAnnual: s.rentersInsuranceAnnual,
    movingFrequencyYears: s.movingFrequencyYears,
    movingCostPerMove: s.movingCostPerMove,
    // Timing
    purchaseTiming: s.purchaseTiming,
  };
}

