// Export all stores for easy importing
export { useAppStore } from './appStore';
export { useBitcoinStore } from './bitcoinStore';
export { useRealEstateStore } from './realEstateStore';
export { useComparisonStore } from './comparisonStore';

// Store utilities and helpers
export const resetAllStores = () => {
  useAppStore.getState().clearError();
  useBitcoinStore.getState().resetResults();
  useRealEstateStore.getState().resetResults();
  useComparisonStore.getState().resetComparison();
};

export const initializeStores = async () => {
  // Initialize with current market data
  const bitcoinStore = useBitcoinStore.getState();
  const realEstateStore = useRealEstateStore.getState();
  
  try {
    await Promise.all([
      bitcoinStore.fetchCurrentPrice(),
      realEstateStore.fetchMedianHomePrice(),
    ]);
  } catch (error) {
    console.error('Failed to initialize stores:', error);
    useAppStore.getState().setError('Failed to load market data');
  }
};
