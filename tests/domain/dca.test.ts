import { describe, it, expect } from 'vitest';
import { accumulateDcaBtc } from '../../src/domain/calc/dca';

describe('accumulateDcaBtc', () => {
  it('accumulates BTC with constant price', () => {
    const btc = accumulateDcaBtc(1, 100, 'monthly', () => 10000);
    // 12 purchases of $100 at $10k = 0.12 BTC
    expect(btc).toBeCloseTo(0.12, 1e-6);
  });
});

