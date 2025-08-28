import { describe, it, expect } from 'vitest';
import { 
  formatCurrencyCompact, 
  formatCurrencyFull, 
  formatPercentage, 
  formatNumber, 
  formatBTC,
  formatCurrencyResponsive 
} from '../../src/utils/format';

describe('formatting utilities', () => {
  describe('formatCurrencyCompact', () => {
    it('formats small amounts correctly', () => {
      expect(formatCurrencyCompact(123)).toBe('$123');
      expect(formatCurrencyCompact(1234)).toBe('$1.2K');
    });

    it('formats large amounts with compact notation', () => {
      expect(formatCurrencyCompact(1234567)).toBe('$1.2M');
      expect(formatCurrencyCompact(1234567890)).toBe('$1.2B');
      expect(formatCurrencyCompact(1234567890000)).toBe('$1.2T');
    });

    it('handles negative values', () => {
      expect(formatCurrencyCompact(-1234)).toBe('-$1.2K');
      expect(formatCurrencyCompact(-1234567)).toBe('-$1.2M');
    });

    it('handles edge cases', () => {
      expect(formatCurrencyCompact(0)).toBe('$0');
      expect(formatCurrencyCompact(Infinity)).toBe('+∞');
      expect(formatCurrencyCompact(-Infinity)).toBe('-∞');
      expect(formatCurrencyCompact(NaN)).toBe('—');
    });

    it('handles very large numbers', () => {
      const veryLarge = 1e16;
      const result = formatCurrencyCompact(veryLarge);
      expect(result).toContain('Q'); // Should use quadrillion notation
    });
  });

  describe('formatCurrencyFull', () => {
    it('formats without compact notation', () => {
      expect(formatCurrencyFull(1234567)).toBe('$1,234,567');
      expect(formatCurrencyFull(1234.56)).toBe('$1,235'); // Rounds to nearest dollar
    });

    it('handles edge cases', () => {
      expect(formatCurrencyFull(Infinity)).toBe('+∞');
      expect(formatCurrencyFull(-Infinity)).toBe('-∞');
      expect(formatCurrencyFull(NaN)).toBe('—');
    });
  });

  describe('formatPercentage', () => {
    it('formats percentages correctly', () => {
      expect(formatPercentage(0.1234)).toBe('12.3%');
      expect(formatPercentage(0.1234, 2)).toBe('12.34%');
      expect(formatPercentage(1.5)).toBe('150.0%');
    });

    it('handles negative percentages', () => {
      expect(formatPercentage(-0.1)).toBe('-10.0%');
    });

    it('handles edge cases', () => {
      expect(formatPercentage(Infinity)).toBe('—');
      expect(formatPercentage(NaN)).toBe('—');
    });
  });

  describe('formatNumber', () => {
    it('formats numbers with specified decimals', () => {
      expect(formatNumber(1234.5678)).toBe('1,235');
      expect(formatNumber(1234.5678, 2)).toBe('1,234.57');
    });

    it('handles edge cases', () => {
      expect(formatNumber(Infinity)).toBe('—');
      expect(formatNumber(NaN)).toBe('—');
    });
  });

  describe('formatBTC', () => {
    it('formats BTC amounts correctly', () => {
      expect(formatBTC(1.23456789)).toBe('1.2346 BTC');
      expect(formatBTC(0.00012345, 8)).toBe('0.00012345 BTC');
    });

    it('handles edge cases', () => {
      expect(formatBTC(Infinity)).toBe('—');
      expect(formatBTC(NaN)).toBe('—');
    });
  });

  describe('formatCurrencyResponsive', () => {
    it('formats differently based on screen size', () => {
      const largeAmount = 1234567;
      
      const smResult = formatCurrencyResponsive(largeAmount, 'sm');
      const lgResult = formatCurrencyResponsive(largeAmount, 'lg');
      
      expect(smResult).toBe('$1.2M'); // Compact on small screens
      expect(lgResult).toBe('$1,234,567'); // Full on large screens
    });

    it('handles medium values on small screens', () => {
      const mediumAmount = 12345;
      const result = formatCurrencyResponsive(mediumAmount, 'sm');
      expect(result).toBe('$12k'); // Should compact to thousands
    });

    it('handles edge cases', () => {
      expect(formatCurrencyResponsive(Infinity, 'sm')).toBe('+∞');
      expect(formatCurrencyResponsive(-Infinity, 'lg')).toBe('-∞');
      expect(formatCurrencyResponsive(NaN, 'md')).toBe('—');
    });
  });
});
