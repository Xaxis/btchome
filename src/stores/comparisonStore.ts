import { create } from 'zustand';
import type { InvestmentComparison, AffordabilityAnalysis, ChartDataset } from '@/types';
import { useBitcoinStore } from './bitcoinStore';
import { useRealEstateStore } from './realEstateStore';

interface ComparisonState {
  // Comparison results
  comparison: InvestmentComparison | null;
  affordabilityAnalysis: AffordabilityAnalysis | null;
  
  // Chart data
  performanceChartData: ChartDataset[];
  affordabilityChartData: ChartDataset[];
  
  // Comparison parameters
  timeframeYears: number;
  scenarioName: string;
  
  // Loading state
  comparisonLoading: boolean;
  
  // Actions
  setTimeframe: (years: number) => void;
  setScenarioName: (name: string) => void;
  calculateComparison: () => Promise<void>;
  calculateAffordabilityAnalysis: () => void;
  generateChartData: () => void;
  runFullComparison: () => Promise<void>;
  resetComparison: () => void;
}

export const useComparisonStore = create<ComparisonState>((set, get) => ({
  // Initial state
  comparison: null,
  affordabilityAnalysis: null,
  performanceChartData: [],
  affordabilityChartData: [],
  timeframeYears: 10,
  scenarioName: 'Default Scenario',
  comparisonLoading: false,

  // Actions
  setTimeframe: (years) => set({ timeframeYears: years }),

  setScenarioName: (name) => set({ scenarioName: name }),

  calculateComparison: async () => {
    const { timeframeYears } = get();
    set({ comparisonLoading: true });

    try {
      // Get data from other stores
      const bitcoinState = useBitcoinStore.getState();
      const realEstateState = useRealEstateStore.getState();

      // Ensure we have the necessary data
      if (!bitcoinState.dcaResults || !realEstateState.totalCosts) {
        throw new Error('Missing calculation data');
      }

      const bitcoinValue = bitcoinState.dcaResults.currentValue;
      const bitcoinInvested = bitcoinState.dcaResults.totalInvested;
      const bitcoinROI = bitcoinState.dcaResults.roi;

      const realEstateValue = realEstateState.totalCosts.homeValue;
      const realEstateInvested = realEstateState.totalCosts.netCost;
      const realEstateROI = realEstateInvested > 0 
        ? ((realEstateValue - realEstateInvested) / realEstateInvested) * 100 
        : 0;

      const comparison: InvestmentComparison = {
        bitcoinValue,
        realEstateValue,
        bitcoinROI,
        realEstateROI,
        timeframe: timeframeYears,
        totalBitcoinInvested: bitcoinInvested,
        totalRealEstateInvested: realEstateInvested,
      };

      set({ comparison, comparisonLoading: false });
    } catch (error) {
      console.error('Failed to calculate comparison:', error);
      set({ comparisonLoading: false });
    }
  },

  calculateAffordabilityAnalysis: () => {
    const bitcoinState = useBitcoinStore.getState();
    const realEstateState = useRealEstateStore.getState();

    if (!bitcoinState.dcaResults || !realEstateState.affordability) {
      return;
    }

    const bitcoinStackValue = bitcoinState.dcaResults.currentValue;
    const maxHomePrice = realEstateState.affordability.maxHomePrice;
    const downPaymentPercent = 0.2; // 20% down payment
    const downPaymentFromBitcoin = Math.min(bitcoinStackValue, maxHomePrice * downPaymentPercent);
    const remainingBitcoinValue = bitcoinStackValue - downPaymentFromBitcoin;
    const affordableHomePrice = Math.min(maxHomePrice, bitcoinStackValue / downPaymentPercent);

    const analysis: AffordabilityAnalysis = {
      bitcoinStackValue,
      affordableHomePrice,
      downPaymentFromBitcoin,
      remainingBitcoinValue,
      monthlyPaymentCapacity: realEstateState.affordability.maxMonthlyPayment,
    };

    set({ affordabilityAnalysis: analysis });
  },

  generateChartData: () => {
    const { timeframeYears } = get();
    const bitcoinState = useBitcoinStore.getState();
    const realEstateState = useRealEstateStore.getState();

    // Generate performance chart data
    const performanceData: ChartDataset[] = [];

    if (bitcoinState.historicalPrices.length > 0) {
      performanceData.push({
        label: 'Bitcoin Performance',
        data: bitcoinState.historicalPrices.map(price => ({
          x: price.date,
          y: price.price,
        })),
        borderColor: '#ed7611',
        backgroundColor: '#ed7611',
        fill: false,
      });
    }

    if (realEstateState.historicalPrices.length > 0) {
      performanceData.push({
        label: 'Real Estate Performance',
        data: realEstateState.historicalPrices.map(price => ({
          x: price.date,
          y: price.price,
        })),
        borderColor: '#22c55e',
        backgroundColor: '#22c55e',
        fill: false,
      });
    }

    // Generate affordability chart data
    const affordabilityData: ChartDataset[] = [];
    
    if (bitcoinState.dcaResults) {
      const monthlyData = [];
      const startDate = bitcoinState.investment.startDate;
      const monthlyInvestment = bitcoinState.investment.amount;
      
      for (let i = 0; i <= timeframeYears * 12; i++) {
        const date = new Date(startDate);
        date.setMonth(date.getMonth() + i);
        
        const totalInvested = i * monthlyInvestment;
        const estimatedValue = totalInvested * (1 + bitcoinState.dcaResults.roi / 100);
        
        monthlyData.push({
          x: date,
          y: estimatedValue,
        });
      }

      affordabilityData.push({
        label: 'Bitcoin Stack Value',
        data: monthlyData,
        borderColor: '#ed7611',
        backgroundColor: '#ed7611',
        fill: false,
      });
    }

    set({ 
      performanceChartData: performanceData,
      affordabilityChartData: affordabilityData,
    });
  },

  runFullComparison: async () => {
    const { calculateComparison, calculateAffordabilityAnalysis, generateChartData, timeframeYears } = get();
    
    set({ comparisonLoading: true });

    try {
      // Ensure both stores have calculated their data
      const bitcoinStore = useBitcoinStore.getState();
      const realEstateStore = useRealEstateStore.getState();

      // Calculate Bitcoin performance if not already done
      if (!bitcoinStore.dcaResults) {
        await bitcoinStore.calculateBothStrategies();
      }

      // Calculate real estate metrics if not already done
      if (!realEstateStore.totalCosts) {
        realEstateStore.calculateAllMetrics(timeframeYears);
      }

      // Run comparison calculations
      await calculateComparison();
      calculateAffordabilityAnalysis();
      generateChartData();

    } catch (error) {
      console.error('Failed to run full comparison:', error);
    } finally {
      set({ comparisonLoading: false });
    }
  },

  resetComparison: () =>
    set({
      comparison: null,
      affordabilityAnalysis: null,
      performanceChartData: [],
      affordabilityChartData: [],
    }),
}));
