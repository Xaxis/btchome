import { describe, it, expect } from 'vitest';
import { FinancialCalculations } from '../calculations';
import type { MortgageDetails } from '@/types';

describe('FinancialCalculations', () => {
  const mockMortgage: MortgageDetails = {
    principal: 400000,
    interestRate: 0.06, // 6%
    termYears: 30,
    downPayment: 100000,
    propertyTaxRate: 0.012, // 1.2%
    homeInsurance: 2000,
    pmiRate: 0.005, // 0.5%
    hoaFees: 1200,
  };

  describe('calculateMonthlyPayment', () => {
    it('should calculate correct monthly payment for standard mortgage', () => {
      const payment = FinancialCalculations.calculateMonthlyPayment(400000, 0.06, 30);
      expect(payment).toBeCloseTo(2398.20, 2);
    });

    it('should handle zero interest rate', () => {
      const payment = FinancialCalculations.calculateMonthlyPayment(360000, 0, 30);
      expect(payment).toBe(1000); // 360000 / 360 months
    });

    it('should calculate payment for different terms', () => {
      const payment15 = FinancialCalculations.calculateMonthlyPayment(400000, 0.06, 15);
      const payment30 = FinancialCalculations.calculateMonthlyPayment(400000, 0.06, 30);
      expect(payment15).toBeGreaterThan(payment30);
      expect(payment15).toBeCloseTo(3375.43, 2);
    });
  });

  describe('generateAmortizationSchedule', () => {
    it('should generate correct amortization schedule', () => {
      const schedule = FinancialCalculations.generateAmortizationSchedule(mockMortgage);
      
      expect(schedule).toHaveLength(360); // 30 years * 12 months
      expect(schedule[0].month).toBe(1);
      expect(schedule[0].remainingBalance).toBeLessThan(mockMortgage.principal);
      expect(schedule[359].remainingBalance).toBeCloseTo(0, 2);
    });

    it('should have decreasing interest and increasing principal over time', () => {
      const schedule = FinancialCalculations.generateAmortizationSchedule(mockMortgage);
      
      const firstPayment = schedule[0];
      const lastPayment = schedule[schedule.length - 1];
      
      expect(firstPayment.interestPayment).toBeGreaterThan(lastPayment.interestPayment);
      expect(firstPayment.principalPayment).toBeLessThan(lastPayment.principalPayment);
    });

    it('should handle PMI correctly', () => {
      const schedule = FinancialCalculations.generateAmortizationSchedule(mockMortgage);
      
      // Early payments should have PMI
      expect(schedule[0].pmi).toBeGreaterThan(0);
      
      // Find when PMI drops off (when LTV reaches 78%)
      const pmiDropIndex = schedule.findIndex(payment => payment.pmi === 0);
      expect(pmiDropIndex).toBeGreaterThan(0);
      expect(pmiDropIndex).toBeLessThan(schedule.length);
    });
  });

  describe('calculateTotalHomeownershipCost', () => {
    it('should calculate total costs correctly', () => {
      const costs = FinancialCalculations.calculateTotalHomeownershipCost(mockMortgage, 10);
      
      expect(costs.totalMortgagePayments).toBeGreaterThan(0);
      expect(costs.totalInterest).toBeGreaterThan(0);
      expect(costs.totalPropertyTax).toBeGreaterThan(0);
      expect(costs.totalInsurance).toBeGreaterThan(0);
      expect(costs.homeValue).toBeGreaterThan(mockMortgage.principal);
      expect(costs.equity).toBeGreaterThan(0);
    });

    it('should show home appreciation over time', () => {
      const costs5 = FinancialCalculations.calculateTotalHomeownershipCost(mockMortgage, 5);
      const costs10 = FinancialCalculations.calculateTotalHomeownershipCost(mockMortgage, 10);
      
      expect(costs10.homeValue).toBeGreaterThan(costs5.homeValue);
      expect(costs10.equity).toBeGreaterThan(costs5.equity);
    });
  });

  describe('calculateTaxBenefits', () => {
    it('should calculate tax benefits correctly', () => {
      const benefits = FinancialCalculations.calculateTaxBenefits(mockMortgage, 0.24, 10);
      
      expect(benefits.totalMortgageInterestDeduction).toBeGreaterThan(0);
      expect(benefits.totalPropertyTaxDeduction).toBeGreaterThan(0);
      expect(benefits.totalTaxSavings).toBeGreaterThan(0);
      expect(benefits.effectiveRate).toBeGreaterThan(0);
      expect(benefits.effectiveRate).toBeLessThan(1);
    });

    it('should respect SALT deduction cap', () => {
      const highTaxMortgage = { ...mockMortgage, propertyTaxRate: 0.05 }; // 5% property tax
      const benefits = FinancialCalculations.calculateTaxBenefits(highTaxMortgage, 0.24, 10);
      
      // Property tax deduction should be capped
      expect(benefits.totalPropertyTaxDeduction).toBeLessThanOrEqual(100000); // $10k * 10 years
    });
  });

  describe('calculateAffordability', () => {
    it('should calculate affordability correctly', () => {
      const affordability = FinancialCalculations.calculateAffordability(
        10000, // monthly income
        1000,  // monthly debts
        100000, // down payment
        0.06,   // interest rate
        30,     // term
        0.012   // property tax rate
      );
      
      expect(affordability.maxMonthlyPayment).toBeGreaterThan(0);
      expect(affordability.maxLoanAmount).toBeGreaterThan(0);
      expect(affordability.maxHomePrice).toBeGreaterThan(0);
      expect(affordability.frontEndQualified).toBeDefined();
      expect(affordability.backEndQualified).toBeDefined();
    });

    it('should respect debt-to-income ratios', () => {
      const highDebtAffordability = FinancialCalculations.calculateAffordability(
        5000,  // monthly income
        2000,  // high monthly debts
        50000, // down payment
        0.06,  // interest rate
        30,    // term
        0.012  // property tax rate
      );
      
      const lowDebtAffordability = FinancialCalculations.calculateAffordability(
        5000,  // monthly income
        500,   // low monthly debts
        50000, // down payment
        0.06,  // interest rate
        30,    // term
        0.012  // property tax rate
      );
      
      expect(lowDebtAffordability.maxHomePrice).toBeGreaterThan(highDebtAffordability.maxHomePrice);
    });
  });

  describe('calculateCAGR', () => {
    it('should calculate CAGR correctly', () => {
      const cagr = FinancialCalculations.calculateCAGR(100000, 200000, 10);
      expect(cagr).toBeCloseTo(7.18, 2); // ~7.18% CAGR to double in 10 years
    });

    it('should handle negative returns', () => {
      const cagr = FinancialCalculations.calculateCAGR(100000, 50000, 5);
      expect(cagr).toBeLessThan(0);
    });
  });

  describe('calculatePresentValue', () => {
    it('should calculate present value correctly', () => {
      const pv = FinancialCalculations.calculatePresentValue(110000, 0.10, 1);
      expect(pv).toBeCloseTo(100000, 2);
    });
  });

  describe('calculateFutureValue', () => {
    it('should calculate future value correctly', () => {
      const fv = FinancialCalculations.calculateFutureValue(100000, 0.10, 1);
      expect(fv).toBeCloseTo(110000, 2);
    });

    it('should handle compound frequency', () => {
      const fvAnnual = FinancialCalculations.calculateFutureValue(100000, 0.10, 1, 1);
      const fvMonthly = FinancialCalculations.calculateFutureValue(100000, 0.10, 1, 12);
      expect(fvMonthly).toBeGreaterThan(fvAnnual);
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(FinancialCalculations.formatCurrency(1234567)).toBe('$1,234,567');
      expect(FinancialCalculations.formatCurrency(1234.56)).toBe('$1,235');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage correctly', () => {
      expect(FinancialCalculations.formatPercentage(12.3456)).toBe('12.35%');
      expect(FinancialCalculations.formatPercentage(12.3456, 1)).toBe('12.3%');
    });
  });
});
