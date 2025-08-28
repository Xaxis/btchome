import { create } from 'zustand';
import { shallow } from 'zustand/shallow';

export type DcaPeriod = 'weekly' | 'monthly' | 'quarterly';

interface BtcSlice {
  btcPrice: number;
  btcAmount: number;
  dcaAmount: number;
  dcaPeriod: DcaPeriod;
  model: 'saylor' | 'power-law' | 's2f' | 'metcalfe' | 'log-reg';
  modelConfidence: number; // 0.5-1.5
  capGainsTaxRate: number; // 0-0.5
  fetchPrice: () => Promise<void>;
  initialize: () => Promise<void>;
}

interface HomeSlice {
  homePrice: number;
  downPct: number;
  mortgageRate: number;
  term: number;
  propertyTaxRate: number;
  insuranceAnnual: number;
  hoaMonthly: number;
  appreciationRate: number;
  maintenanceRate: number;
  closingCostsPct: number;
}

interface RentSlice {
  monthlyRent: number;
  rentGrowthRate: number;
  rentersInsuranceAnnual: number;
  movingFrequencyYears: number;
  movingCostPerMove: number;
}

interface ModelSlice {
  timeframeYears: number;
  purchaseTiming: 'now' | 'year-1' | 'year-2' | 'year-3' | 'year-5';
}

interface UiSlice {
  chartView: 'absolute' | 'relative' | 'percentage';
  visibleSeries: { hodl: boolean; buy: boolean; rent: boolean; opportunity: boolean };
  modals: {
    active: string | null;
    infoContent?: { title: string; content: string };
  };
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
}

export type Store = BtcSlice & HomeSlice & RentSlice & ModelSlice & UiSlice;

export const useStore = create<Store>((set, get) => ({
  // BTC
  btcPrice: 50000,
  btcAmount: 1,
  dcaAmount: 0,
  dcaPeriod: 'monthly',
  model: 'power-law',
  modelConfidence: 1,
  capGainsTaxRate: 0.2,
  async fetchPrice() {
    const maxRetries = 3;
    const baseDelay = 600; // ms
    for (let i = 0; i <= maxRetries; i++) {
      try {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), 8000);
        const { fetchBtcPriceUSD } = await import('../services/coingecko');
        const price = await fetchBtcPriceUSD(controller.signal);
        clearTimeout(t);
        set({ btcPrice: price });
        try { localStorage.setItem('btchome-lastPrice', String(price)); } catch {}
        return;
      } catch (e) {
        if (i === maxRetries) {
          // fallback to last known
          try {
            const last = localStorage.getItem('btchome-lastPrice');
            if (last) set({ btcPrice: Number(last) });
          } catch {}
          return;
        }
        await new Promise((r) => setTimeout(r, baseDelay * Math.pow(2, i)));
      }
    }
  },

  // Initialize the store with fresh data
  async initialize() {
    // Load cached price first for immediate display
    try {
      const cachedPrice = localStorage.getItem('btchome-lastPrice');
      if (cachedPrice) {
        set({ btcPrice: Number(cachedPrice) });
      }
    } catch {}

    // Then fetch fresh price in background
    await get().fetchPrice();
  },
  set(partial: Partial<Store>) {
    set(partial);
  },

  // Home defaults
  homePrice: 500000,
  downPct: 0.2,
  mortgageRate: 0.065,
  term: 30,
  propertyTaxRate: 0.012,
  insuranceAnnual: 1200,
  hoaMonthly: 0,
  appreciationRate: 0.03,
  maintenanceRate: 0.01,
  closingCostsPct: 0.03,

  // Rent defaults
  monthlyRent: 2500,
  rentGrowthRate: 0.03,
  rentersInsuranceAnnual: 300,
  movingFrequencyYears: 3,
  movingCostPerMove: 2000,

  // Model defaults
  timeframeYears: 10,
  purchaseTiming: 'now',

  // UI defaults
  chartView: 'absolute',
  visibleSeries: { hodl: true, buy: true, rent: true, opportunity: true },
  modals: { active: null },
  theme: 'dark',
  setTheme(t) {
    set({ theme: t });
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', t);
      try { localStorage.setItem('btchome-theme', t); } catch {}
    }
  },
}));

export const shallowEq = shallow;

