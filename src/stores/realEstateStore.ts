import { create } from 'zustand';
import type { MortgageDetails, RealEstateProperty, MortgagePayment } from '@/types';
import { RealEstateService } from '@/services/realEstate';
import { FinancialCalculations } from '@/utils/calculations';

interface RealEstateState {
  // Property and mortgage configuration
  property: RealEstateProperty;
  mortgage: MortgageDetails;
  
  // Market data
  medianHomePrice: number | null;
  historicalPrices: Array<{ date: Date; price: number }>;
  priceLoading: boolean;
  
  // Calculation results
  amortizationSchedule: MortgagePayment[];
  totalCosts: {
    totalMortgagePayments: number;
    totalInterest: number;
    totalPropertyTax: number;
    totalInsurance: number;
    totalPMI: number;
    totalHOA: number;
    totalMaintenance: number;
    homeValue: number;
    netCost: number;
    equity: number;
  } | null;
  
  taxBenefits: {
    totalMortgageInterestDeduction: number;
    totalPropertyTaxDeduction: number;
    totalTaxSavings: number;
    effectiveRate: number;
  } | null;
  
  affordability: {
    maxMonthlyPayment: number;
    maxLoanAmount: number;
    maxHomePrice: number;
    frontEndQualified: boolean;
    backEndQualified: boolean;
  } | null;
  
  // User financial info for affordability
  monthlyIncome: number;
  monthlyDebts: number;
  taxBracket: number;
  
  // Loading states
  calculationLoading: boolean;
  
  // Actions
  updateProperty: (property: Partial<RealEstateProperty>) => void;
  updateMortgage: (mortgage: Partial<MortgageDetails>) => void;
  updateFinancialInfo: (info: { monthlyIncome?: number; monthlyDebts?: number; taxBracket?: number }) => void;
  fetchMedianHomePrice: () => Promise<void>;
  fetchHistoricalPrices: (startDate: Date, endDate?: Date) => Promise<void>;
  calculateMortgageDetails: () => void;
  calculateTotalCosts: (years: number) => void;
  calculateTaxBenefits: (years: number) => void;
  calculateAffordability: () => void;
  calculateAllMetrics: (years: number) => void;
  resetResults: () => void;
}

export const useRealEstateStore = create<RealEstateState>((set, get) => ({
  // Initial state
  property: {
    price: 420000,
    location: 'United States',
    propertyType: 'single-family',
    squareFootage: 2000,
    bedrooms: 3,
    bathrooms: 2,
  },
  
  mortgage: {
    principal: 336000, // 80% of 420k
    interestRate: 0.07, // 7%
    termYears: 30,
    downPayment: 84000, // 20%
    propertyTaxRate: 0.011, // 1.1%
    homeInsurance: 1500,
    pmiRate: 0.005, // 0.5%
    hoaFees: 0,
  },
  
  medianHomePrice: null,
  historicalPrices: [],
  priceLoading: false,
  amortizationSchedule: [],
  totalCosts: null,
  taxBenefits: null,
  affordability: null,
  
  monthlyIncome: 8000,
  monthlyDebts: 500,
  taxBracket: 0.22, // 22% tax bracket
  
  calculationLoading: false,

  // Actions
  updateProperty: (newProperty) =>
    set((state) => {
      const updatedProperty = { ...state.property, ...newProperty };
      // Auto-update mortgage principal if property price changes
      const updatedMortgage = newProperty.price 
        ? { ...state.mortgage, principal: newProperty.price - state.mortgage.downPayment }
        : state.mortgage;
      
      return {
        property: updatedProperty,
        mortgage: updatedMortgage,
      };
    }),

  updateMortgage: (newMortgage) =>
    set((state) => ({
      mortgage: { ...state.mortgage, ...newMortgage },
    })),

  updateFinancialInfo: (info) =>
    set((state) => ({
      monthlyIncome: info.monthlyIncome ?? state.monthlyIncome,
      monthlyDebts: info.monthlyDebts ?? state.monthlyDebts,
      taxBracket: info.taxBracket ?? state.taxBracket,
    })),

  fetchMedianHomePrice: async () => {
    set({ priceLoading: true });
    try {
      const price = await RealEstateService.getCurrentMedianHomePrice();
      set({ medianHomePrice: price, priceLoading: false });
    } catch (error) {
      console.error('Failed to fetch median home price:', error);
      set({ priceLoading: false });
    }
  },

  fetchHistoricalPrices: async (startDate, endDate) => {
    const { property } = get();
    set({ priceLoading: true });
    try {
      const prices = await RealEstateService.getMedianHomePricesByLocation(
        property.location,
        startDate,
        endDate
      );
      set({ historicalPrices: prices, priceLoading: false });
    } catch (error) {
      console.error('Failed to fetch historical home prices:', error);
      set({ priceLoading: false });
    }
  },

  calculateMortgageDetails: () => {
    const { mortgage } = get();
    set({ calculationLoading: true });
    
    try {
      const schedule = FinancialCalculations.generateAmortizationSchedule(mortgage);
      set({ amortizationSchedule: schedule, calculationLoading: false });
    } catch (error) {
      console.error('Failed to calculate mortgage details:', error);
      set({ calculationLoading: false });
    }
  },

  calculateTotalCosts: (years) => {
    const { mortgage } = get();
    set({ calculationLoading: true });
    
    try {
      const costs = FinancialCalculations.calculateTotalHomeownershipCost(mortgage, years);
      set({ totalCosts: costs, calculationLoading: false });
    } catch (error) {
      console.error('Failed to calculate total costs:', error);
      set({ calculationLoading: false });
    }
  },

  calculateTaxBenefits: (years) => {
    const { mortgage, taxBracket } = get();
    set({ calculationLoading: true });
    
    try {
      const benefits = FinancialCalculations.calculateTaxBenefits(mortgage, taxBracket, years);
      set({ taxBenefits: benefits, calculationLoading: false });
    } catch (error) {
      console.error('Failed to calculate tax benefits:', error);
      set({ calculationLoading: false });
    }
  },

  calculateAffordability: () => {
    const { monthlyIncome, monthlyDebts, mortgage } = get();
    set({ calculationLoading: true });
    
    try {
      const affordability = FinancialCalculations.calculateAffordability(
        monthlyIncome,
        monthlyDebts,
        mortgage.downPayment,
        mortgage.interestRate,
        mortgage.termYears,
        mortgage.propertyTaxRate
      );
      set({ affordability, calculationLoading: false });
    } catch (error) {
      console.error('Failed to calculate affordability:', error);
      set({ calculationLoading: false });
    }
  },

  calculateAllMetrics: (years) => {
    const { calculateMortgageDetails, calculateTotalCosts, calculateTaxBenefits, calculateAffordability } = get();
    
    set({ calculationLoading: true });
    try {
      calculateMortgageDetails();
      calculateTotalCosts(years);
      calculateTaxBenefits(years);
      calculateAffordability();
    } catch (error) {
      console.error('Failed to calculate all metrics:', error);
    } finally {
      set({ calculationLoading: false });
    }
  },

  resetResults: () =>
    set({
      amortizationSchedule: [],
      totalCosts: null,
      taxBenefits: null,
      affordability: null,
      historicalPrices: [],
    }),
}));
