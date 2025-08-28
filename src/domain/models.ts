export type ModelKey = 'saylor' | 'power-law' | 's2f' | 'metcalfe' | 'log-reg';

export interface ModelParams { confidence?: number }

export type PriceFn = (yearsFromNow: number, currentPrice: number, params?: ModelParams) => number;

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export const models: Record<ModelKey, PriceFn> = {
  'power-law': (t, current, p) => current * Math.pow(1.35, t) * clamp(p?.confidence ?? 1, 0.5, 1.5),
  saylor: (t, current, p) => current * Math.pow(1.25, t) * clamp(p?.confidence ?? 1, 0.5, 1.5),
  'log-reg': (t, current, p) => {
    // Ensure at t=0 we return current price, then logarithmic growth
    const growthFactor = t === 0 ? 1 : (1 + Math.log(t + 1) * 0.5);
    return current * growthFactor * clamp(p?.confidence ?? 1, 0.5, 1.5);
  },
  s2f: (t, current, p) => current * Math.pow(1.4, t) * clamp(p?.confidence ?? 1, 0.5, 1.5),
  metcalfe: (t, current, p) => current * Math.pow(1.3, t) * clamp(p?.confidence ?? 1, 0.5, 1.5),
};

