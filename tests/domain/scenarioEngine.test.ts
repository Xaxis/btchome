import { describe, it, expect } from 'vitest';
import { runScenario, type ScenarioInputs } from '../../src/domain/calc/scenarioEngine';

const baseInputs: ScenarioInputs = {
  years: 5,
  btcPrice: 50000,
  btcAmount: 1,
  model: 'power-law',
  modelConfidence: 1,
  dcaAmount: 0,
  dcaPeriod: 'monthly',
  capGainsTaxRate: 0.2,
  // Home
  homePrice: 500000,
  downPct: 0.2,
  mortgageRate: 0.06,
  term: 30,
  propertyTaxRate: 0.012,
  insuranceAnnual: 1200,
  hoaMonthly: 0,
  appreciationRate: 0.03,
  maintenanceRate: 0.01,
  closingCostsPct: 0.03,
  // Rent
  monthlyRent: 2500,
  rentGrowthRate: 0.03,
  rentersInsuranceAnnual: 300,
  movingFrequencyYears: 3,
  movingCostPerMove: 2000,
  // Timing
  purchaseTiming: 'now',
};

describe('scenarioEngine', () => {
  describe('runScenario', () => {
    it('returns correct structure with all required fields', () => {
      const result = runScenario(baseInputs);
      
      expect(result).toHaveProperty('yearsLabels');
      expect(result).toHaveProperty('holdAllValue');
      expect(result).toHaveProperty('buyHouseValue');
      expect(result).toHaveProperty('rentForeverValue');
      expect(result).toHaveProperty('opportunityCostSeries');
      expect(result).toHaveProperty('summary');
      
      expect(result.yearsLabels).toHaveLength(6); // 0-5 years
      expect(result.holdAllValue).toHaveLength(6);
      expect(result.buyHouseValue).toHaveLength(6);
      expect(result.rentForeverValue).toHaveLength(6);
    });

    it('hold strategy increases with BTC price appreciation', () => {
      const result = runScenario(baseInputs);
      const holdValues = result.holdAllValue;
      
      // Values should generally increase over time (power-law model)
      expect(holdValues[5]).toBeGreaterThan(holdValues[0]);
      expect(holdValues[0]).toBe(50000); // 1 BTC * $50k
    });

    it('rent strategy accounts for cumulative rent costs', () => {
      const result = runScenario(baseInputs);
      const rentValues = result.rentForeverValue;
      const holdValues = result.holdAllValue;
      
      // Rent strategy should be lower than hold due to rent costs
      expect(rentValues[5]).toBeLessThan(holdValues[5]);
      
      // Should have rent details
      expect(result.summary.rentDetails).toBeDefined();
      expect(result.summary.rentDetails!.totalRentPaid).toBeGreaterThan(0);
    });

    it('handles DCA correctly', () => {
      const dcaInputs = { ...baseInputs, dcaAmount: 1000 };
      const result = runScenario(dcaInputs);
      
      expect(result.summary.dcaDetails.totalInvested).toBeGreaterThan(50000);
      expect(result.summary.dcaDetails.btcAccumulated).toBeGreaterThan(0);
    });

    it('calculates purchase timing correctly', () => {
      const year2Inputs = { ...baseInputs, purchaseTiming: 'year-2' as const };
      const result = runScenario(year2Inputs);
      
      // Before purchase year, buy strategy should equal hold
      expect(result.buyHouseValue[0]).toBe(result.holdAllValue[0]);
      expect(result.buyHouseValue[1]).toBe(result.holdAllValue[1]);
      
      // After purchase, should diverge
      expect(result.buyHouseValue[3]).not.toBe(result.holdAllValue[3]);
    });

    it('handles capital gains tax on BTC sale', () => {
      const highTaxInputs = { ...baseInputs, capGainsTaxRate: 0.4 };
      const lowTaxInputs = { ...baseInputs, capGainsTaxRate: 0.1 };

      const highTaxResult = runScenario(highTaxInputs);
      const lowTaxResult = runScenario(lowTaxInputs);

      // Higher tax should result in lower buy house value (or at least not higher)
      expect(highTaxResult.buyHouseValue[5]).toBeLessThanOrEqual(lowTaxResult.buyHouseValue[5]);

      // Check that buy house details show the tax impact
      expect(highTaxResult.summary.buyHouseDetails).toBeDefined();
      expect(lowTaxResult.summary.buyHouseDetails).toBeDefined();
    });

    it('identifies best strategy correctly', () => {
      const result = runScenario(baseInputs);
      
      expect(['hold', 'buy', 'rent']).toContain(result.summary.finalYear.bestStrategy);
      
      const finalValues = result.summary.finalYear;
      const bestValue = Math.max(finalValues.holdAll, finalValues.buyHouse, finalValues.rentForever);
      
      if (result.summary.finalYear.bestStrategy === 'hold') {
        expect(finalValues.holdAll).toBe(bestValue);
      } else if (result.summary.finalYear.bestStrategy === 'buy') {
        expect(finalValues.buyHouse).toBe(bestValue);
      } else {
        expect(finalValues.rentForever).toBe(bestValue);
      }
    });

    it('calculates opportunity cost correctly', () => {
      const result = runScenario(baseInputs);
      
      const finalValues = result.summary.finalYear;
      const bestValue = Math.max(finalValues.holdAll, finalValues.buyHouse, finalValues.rentForever);
      const expectedOpportunityCost = finalValues.holdAll - bestValue;
      
      expect(result.summary.finalYear.opportunityCost).toBeCloseTo(expectedOpportunityCost, 0);
    });

    it('handles edge case of zero home price', () => {
      const zeroHomeInputs = { ...baseInputs, homePrice: 0 };
      const result = runScenario(zeroHomeInputs);
      
      // Should not crash and buy strategy should be similar to hold
      expect(result.buyHouseValue).toBeDefined();
      expect(result.buyHouseValue[0]).toBeDefined();
    });

    it('handles different DCA periods correctly', () => {
      const weeklyInputs = { ...baseInputs, dcaAmount: 100, dcaPeriod: 'weekly' as const };
      const monthlyInputs = { ...baseInputs, dcaAmount: 100, dcaPeriod: 'monthly' as const };
      const quarterlyInputs = { ...baseInputs, dcaAmount: 100, dcaPeriod: 'quarterly' as const };
      
      const weeklyResult = runScenario(weeklyInputs);
      const monthlyResult = runScenario(monthlyInputs);
      const quarterlyResult = runScenario(quarterlyInputs);
      
      // Weekly should accumulate more BTC (more frequent purchases)
      expect(weeklyResult.summary.dcaDetails.btcAccumulated).toBeGreaterThan(
        monthlyResult.summary.dcaDetails.btcAccumulated
      );
      expect(monthlyResult.summary.dcaDetails.btcAccumulated).toBeGreaterThan(
        quarterlyResult.summary.dcaDetails.btcAccumulated
      );
    });
  });
});
