// Modeling primitives for BTC price projections with sources and sane parameters
// NOTE: These are simplified but coherent models with calibrations to make outputs plausible.

export type ModelKey = 'power-law' | 'log-regression' | 's2f' | 'metcalfe';

export interface BtcModel {
  key: ModelKey;
  name: string;
  color: string;
  description: string;
  source: string;
  price: (params: { yearsFromNow: number; currentPrice: number }) => number;
}

const GENESIS = new Date('2009-01-03').getTime();
const daysSinceGenesis = () => (Date.now() - GENESIS) / (1000 * 60 * 60 * 24);

// Helper: clamp to avoid ridiculous values
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export const Models: Record<ModelKey, BtcModel> = {
  'power-law': {
    key: 'power-law',
    name: 'Power Law (Santostasi-inspired)',
    color: '#ed7611',
    description: 'Price ~ A * (days since genesis)^n, calibrated to current price.',
    source: 'Inspired by Santostasi power-law; parameters re-fit at runtime.',
    price: ({ yearsFromNow, currentPrice }) => {
      const d0 = daysSinceGenesis();
      const A = 0.0001; // base coefficient used for shape; we re-scale to current price
      const n = 5.6; // slightly lower exponent than naive 5.8
      const rawToday = A * Math.pow(d0, n);
      const scale = currentPrice / rawToday; // rescale to match current price
      const futureDays = d0 + yearsFromNow * 365.25;
      const rawFuture = A * Math.pow(futureDays, n);
      return clamp(scale * rawFuture, 1, 1e8); // clamp to avoid absurdities
    }
  },
  'log-regression': {
    key: 'log-regression',
    name: 'Log Regression (Rainbow-like)',
    color: '#8b5cf6',
    description: 'Log10(price) = a * log10(days) + b; coefficients fit to current price level.',
    source: 'Inspired by rainbow/log regression bands.',
    price: ({ yearsFromNow, currentPrice }) => {
      const d0 = daysSinceGenesis();
      const a = 2.9; // slope
      // Choose b to satisfy current price
      const b = Math.log10(currentPrice) - a * Math.log10(d0);
      const futureDays = d0 + yearsFromNow * 365.25;
      const futureLog10 = a * Math.log10(futureDays) + b;
      return clamp(Math.pow(10, futureLog10), 1, 1e8);
    }
  },
  s2f: {
    key: 's2f',
    name: 'Stock-to-Flow (Simplified)',
    color: '#f59e0b',
    description: 'Price ~ S2F^k scaled to match current price; S2F doubles at halving.',
    source: 'PlanB-inspired S2F; simplified for UX modeling.',
    price: ({ yearsFromNow, currentPrice }) => {
      const currentS2F = 56; // approx current
      const halvingsPerYear = 1 / 4; // every 4 years, simplified
      const s2fFuture = currentS2F * Math.pow(2, yearsFromNow * halvingsPerYear);
      const k = 3.3; // slope in ln(price) = k * ln(S2F) + c
      // Fit intercept c to current price
      const c = Math.log(currentPrice) - k * Math.log(currentS2F);
      const futureLn = k * Math.log(s2fFuture) + c;
      return clamp(Math.exp(futureLn), 1, 1e8);
    }
  },
  metcalfe: {
    key: 'metcalfe',
    name: "Metcalfe's Law (Users^2)",
    color: '#10b981',
    description: 'Network value proportional to square of users; adoption grows ~20%/yr.',
    source: 'Classic network effects; simplified adoption curve.',
    price: ({ yearsFromNow, currentPrice }) => {
      const currentUsers = 100e6;
      const growth = Math.pow(1.20, yearsFromNow);
      const valueMultiple = Math.pow((currentUsers * growth) / currentUsers, 2);
      // Re-scale to current price
      return clamp(currentPrice * valueMultiple * Math.pow(0.92, yearsFromNow), 1, 1e8);
    }
  }
};

export function getModel(key: ModelKey): BtcModel {
  return Models[key];
}

