import { describe, it, expect } from 'vitest';
import { models } from '../../src/domain/models';

describe('Bitcoin projection models', () => {
  const currentPrice = 50000;
  
  describe('all models', () => {
    it('should return positive prices for positive time', () => {
      Object.entries(models).forEach(([name, model]) => {
        const price1Year = model(1, currentPrice);
        const price5Years = model(5, currentPrice);
        
        expect(price1Year).toBeGreaterThan(0);
        expect(price5Years).toBeGreaterThan(0);
      });
    });

    it('should generally increase over time', () => {
      Object.entries(models).forEach(([name, model]) => {
        const price1Year = model(1, currentPrice);
        const price5Years = model(5, currentPrice);
        
        // Most models should show growth over time
        expect(price5Years).toBeGreaterThan(price1Year);
      });
    });

    it('should respect confidence parameters', () => {
      Object.entries(models).forEach(([name, model]) => {
        const conservativePrice = model(5, currentPrice, { confidence: 0.5 });
        const aggressivePrice = model(5, currentPrice, { confidence: 1.5 });
        const normalPrice = model(5, currentPrice, { confidence: 1.0 });
        
        expect(conservativePrice).toBeLessThan(normalPrice);
        expect(aggressivePrice).toBeGreaterThan(normalPrice);
      });
    });

    it('should handle edge cases gracefully', () => {
      Object.entries(models).forEach(([name, model]) => {
        // Zero time should return current price (or close to it)
        const priceNow = model(0, currentPrice);
        expect(priceNow).toBeCloseTo(currentPrice, -2); // Within reasonable range
        
        // Very small confidence should still work
        const minConfidence = model(1, currentPrice, { confidence: 0.5 });
        expect(minConfidence).toBeGreaterThan(0);
        
        // Max confidence should still work
        const maxConfidence = model(1, currentPrice, { confidence: 1.5 });
        expect(maxConfidence).toBeGreaterThan(0);
      });
    });
  });

  describe('power-law model', () => {
    it('should show exponential-like growth', () => {
      const model = models['power-law'];
      const price1 = model(1, currentPrice);
      const price2 = model(2, currentPrice);
      const price3 = model(3, currentPrice);
      
      // Should show accelerating growth
      const growth1to2 = price2 - price1;
      const growth2to3 = price3 - price2;
      expect(growth2to3).toBeGreaterThan(growth1to2);
    });
  });

  describe('saylor model', () => {
    it('should be more conservative than power-law', () => {
      const powerLaw = models['power-law'];
      const saylor = models['saylor'];
      
      const powerLawPrice = powerLaw(5, currentPrice);
      const saylorPrice = saylor(5, currentPrice);
      
      expect(saylorPrice).toBeLessThan(powerLawPrice);
    });
  });

  describe('log-reg model', () => {
    it('should show logarithmic growth pattern', () => {
      const model = models['log-reg'];
      const price1 = model(1, currentPrice);
      const price5 = model(5, currentPrice);
      const price10 = model(10, currentPrice);
      
      // Logarithmic growth should decelerate
      const growth1to5 = price5 - price1;
      const growth5to10 = price10 - price5;
      expect(growth1to5).toBeGreaterThan(growth5to10);
    });
  });

  describe('s2f model', () => {
    it('should show strong growth', () => {
      const model = models['s2f'];
      const price5Years = model(5, currentPrice);
      
      expect(price5Years).toBeGreaterThan(currentPrice * 2); // Should at least double
    });
  });

  describe('metcalfe model', () => {
    it('should show network effect growth', () => {
      const model = models['metcalfe'];
      const price1 = model(1, currentPrice);
      const price5 = model(5, currentPrice);
      
      expect(price5).toBeGreaterThan(price1);
      expect(price5).toBeGreaterThan(currentPrice);
    });
  });
});
