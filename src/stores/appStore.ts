import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings } from '@/types';

interface AppState {
  // Settings
  settings: AppSettings;
  
  // UI State
  isLoading: boolean;
  currentView: 'landing' | 'calculator' | 'comparison' | 'results';
  sidebarOpen: boolean;
  
  // Error handling
  error: string | null;
  
  // Actions
  updateSettings: (settings: Partial<AppSettings>) => void;
  setLoading: (loading: boolean) => void;
  setCurrentView: (view: AppState['currentView']) => void;
  setSidebarOpen: (open: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      settings: {
        theme: 'system',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
      },
      isLoading: false,
      currentView: 'landing',
      sidebarOpen: false,
      error: null,

      // Actions
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      setLoading: (loading) => set({ isLoading: loading }),

      setCurrentView: (view) => set({ currentView: view }),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'btchome-app-store',
      partialize: (state) => ({
        settings: state.settings,
        currentView: state.currentView,
      }),
    }
  )
);
