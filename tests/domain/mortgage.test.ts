import { describe, it, expect } from 'vitest';
import { monthlyPayment } from '../../src/domain/calc/mortgage';

describe('monthlyPayment', () => {
  it('computes payment for typical loan', () => {
    const p = monthlyPayment({ principal: 400_000, annualRate: 0.06, termYears: 30 });
    expect(p).toBeGreaterThan(0);
    expect(Math.round(p)).toBeCloseTo(2399, -1); // ballpark
  });
});

