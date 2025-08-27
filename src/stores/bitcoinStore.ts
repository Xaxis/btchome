import { create } from 'zustand';
import type { BitcoinInvestment, BitcoinPrice } from '@/types';
import { BitcoinService } from '@/services/bitcoin';

interface BitcoinState {
  // Investment configuration
  investment: BitcoinInvestment;
  
  // Price data
  currentPrice: number | null;
  historicalPrices: BitcoinPrice[];
  priceLoading: boolean;
  
  // Calculation results
  dcaResults: {
    totalInvested: number;
    totalBitcoin: number;
    currentValue: number;
    roi: number;
    averagePrice: number;
  } | null;
  
  lumpSumResults: {
    totalInvested: number;
    totalBitcoin: number;
    currentValue: number;
    roi: number;
    purchasePrice: number;
  } | null;
  
  // Loading states
  calculationLoading: boolean;
  
  // Actions
  updateInvestment: (investment: Partial<BitcoinInvestment>) => void;
  fetchCurrentPrice: () => Promise<void>;
  fetchHistoricalPrices: (startDate: Date, endDate?: Date) => Promise<void>;
  calculateDCAPerformance: () => Promise<void>;
  calculateLumpSumPerformance: () => Promise<void>;
  calculateBothStrategies: () => Promise<void>;
  resetResults: () => void;
}

export const useBitcoinStore = create<BitcoinState>((set, get) => ({
  // Initial state
  investment: {
    strategy: 'dca',
    amount: 1000,
    startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
    frequency: 'monthly',
  },
  
  currentPrice: null,
  historicalPrices: [],
  priceLoading: false,
  dcaResults: null,
  lumpSumResults: null,
  calculationLoading: false,

  // Actions
  updateInvestment: (newInvestment) =>
    set((state) => ({
      investment: { ...state.investment, ...newInvestment },
    })),

  fetchCurrentPrice: async () => {
    set({ priceLoading: true });
    try {
      const price = await BitcoinService.getCurrentPrice();
      set({ currentPrice: price, priceLoading: false });
    } catch (error) {
      console.error('Failed to fetch current Bitcoin price:', error);
      set({ priceLoading: false });
    }
  },

  fetchHistoricalPrices: async (startDate, endDate) => {
    set({ priceLoading: true });
    try {
      const prices = await BitcoinService.getHistoricalPrices(startDate, endDate);
      set({ historicalPrices: prices, priceLoading: false });
    } catch (error) {
      console.error('Failed to fetch historical Bitcoin prices:', error);
      set({ priceLoading: false });
    }
  },

  calculateDCAPerformance: async () => {
    const { investment } = get();
    if (!investment.startDate) return;

    set({ calculationLoading: true });
    try {
      const endDate = investment.endDate || new Date();
      const monthlyAmount = investment.frequency === 'monthly' ? investment.amount : investment.amount / 12;
      
      const results = await BitcoinService.calculateDCAPerformance(
        investment.startDate,
        endDate,
        monthlyAmount
      );
      
      set({ dcaResults: results, calculationLoading: false });
    } catch (error) {
      console.error('Failed to calculate DCA performance:', error);
      set({ calculationLoading: false });
    }
  },

  calculateLumpSumPerformance: async () => {
    const { investment } = get();
    if (!investment.startDate) return;

    set({ calculationLoading: true });
    try {
      const results = await BitcoinService.calculateLumpSumPerformance(
        investment.startDate,
        investment.amount
      );
      
      set({ lumpSumResults: results, calculationLoading: false });
    } catch (error) {
      console.error('Failed to calculate lump sum performance:', error);
      set({ calculationLoading: false });
    }
  },

  calculateBothStrategies: async () => {
    const { calculateDCAPerformance, calculateLumpSumPerformance } = get();
    
    set({ calculationLoading: true });
    try {
      await Promise.all([
        calculateDCAPerformance(),
        calculateLumpSumPerformance(),
      ]);
    } catch (error) {
      console.error('Failed to calculate Bitcoin strategies:', error);
    } finally {
      set({ calculationLoading: false });
    }
  },

  resetResults: () =>
    set({
      dcaResults: null,
      lumpSumResults: null,
      historicalPrices: [],
    }),
}));
