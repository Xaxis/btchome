import { describe, it, expect } from 'vitest';
import { totalRentPaid } from '../../src/domain/calc/rent';

describe('rent calculations', () => {
  describe('totalRentPaid', () => {
    it('calculates total rent with no growth', () => {
      const total = totalRentPaid(2, 2000, 0);
      expect(total).toBe(48000); // 2000 * 12 * 2
    });

    it('calculates total rent with 3% annual growth', () => {
      const total = totalRentPaid(2, 2000, 0.03);
      // Year 1: 2000 * 12 = 24000
      // Year 2: 2000 * 1.03 * 12 = 24720
      expect(total).toBeCloseTo(48720, 0);
    });

    it('handles edge case of zero years', () => {
      const total = totalRentPaid(0, 2000, 0.03);
      expect(total).toBe(0);
    });

    it('handles high growth rates', () => {
      const total = totalRentPaid(3, 1000, 0.1);
      // Year 1: 1000 * 12 = 12000
      // Year 2: 1000 * 1.1 * 12 = 13200  
      // Year 3: 1000 * 1.1^2 * 12 = 14520
      expect(total).toBeCloseTo(39720, 0);
    });
  });
});
