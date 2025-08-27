import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BitcoinService } from '../bitcoin';

// Mock fetch globally
global.fetch = vi.fn();

describe('BitcoinService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear cache between tests
    (BitcoinService as any).cache.clear();
  });

  describe('getCurrentPrice', () => {
    it('should fetch current Bitcoin price successfully', async () => {
      const mockResponse = {
        bitcoin: {
          usd: 67000,
          usd_market_cap: 1300000000000,
          usd_24h_vol: 25000000000,
        },
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const price = await BitcoinService.getCurrentPrice();
      expect(price).toBe(67000);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('simple/price?ids=bitcoin')
      );
    });

    it('should handle API errors gracefully', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(BitcoinService.getCurrentPrice()).rejects.toThrow(
        'Failed to fetch current Bitcoin price'
      );
    });

    it('should use cached data when available', async () => {
      const mockResponse = {
        bitcoin: { usd: 67000 },
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      // First call
      const price1 = await BitcoinService.getCurrentPrice();
      expect(price1).toBe(67000);

      // Second call should use cache
      const price2 = await BitcoinService.getCurrentPrice();
      expect(price2).toBe(67000);
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('getHistoricalPrices', () => {
    it('should fetch historical prices successfully', async () => {
      const mockResponse = {
        prices: [
          [1640995200000, 47000], // Jan 1, 2022
          [1641081600000, 47500], // Jan 2, 2022
        ],
        market_caps: [
          [1640995200000, 890000000000],
          [1641081600000, 900000000000],
        ],
        total_volumes: [
          [1640995200000, 25000000000],
          [1641081600000, 26000000000],
        ],
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const startDate = new Date('2022-01-01');
      const endDate = new Date('2022-01-02');
      const prices = await BitcoinService.getHistoricalPrices(startDate, endDate);

      expect(prices).toHaveLength(2);
      expect(prices[0].price).toBe(47000);
      expect(prices[0].date).toEqual(new Date(1640995200000));
      expect(prices[0].marketCap).toBe(890000000000);
      expect(prices[0].volume).toBe(25000000000);
    });

    it('should handle date range conversion correctly', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ prices: [], market_caps: [], total_volumes: [] }),
      });

      const startDate = new Date('2022-01-01');
      const endDate = new Date('2022-12-31');
      
      await BitcoinService.getHistoricalPrices(startDate, endDate);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`from=${Math.floor(startDate.getTime() / 1000)}`)
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`to=${Math.floor(endDate.getTime() / 1000)}`)
      );
    });
  });

  describe('getPriceAtDate', () => {
    it('should fetch price for specific date', async () => {
      const mockResponse = {
        market_data: {
          current_price: {
            usd: 45000,
          },
        },
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const date = new Date('2022-01-01');
      const price = await BitcoinService.getPriceAtDate(date);

      expect(price).toBe(45000);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('history?date=2022-01-01')
      );
    });
  });

  describe('calculateDCAPerformance', () => {
    it('should calculate DCA performance correctly', async () => {
      // Mock historical prices
      const mockHistoricalResponse = {
        prices: [
          [1640995200000, 47000], // Jan 1, 2022
          [1643673600000, 38000], // Feb 1, 2022
          [1646092800000, 44000], // Mar 1, 2022
        ],
        market_caps: [[1640995200000, 890000000000], [1643673600000, 720000000000], [1646092800000, 830000000000]],
        total_volumes: [[1640995200000, 25000000000], [1643673600000, 20000000000], [1646092800000, 23000000000]],
      };

      const mockCurrentPriceResponse = {
        bitcoin: { usd: 50000 },
      };

      (fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockHistoricalResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCurrentPriceResponse,
        });

      const startDate = new Date('2022-01-01');
      const endDate = new Date('2022-03-01');
      const monthlyAmount = 1000;

      const performance = await BitcoinService.calculateDCAPerformance(
        startDate,
        endDate,
        monthlyAmount
      );

      expect(performance.totalInvested).toBe(3000); // 3 months * $1000
      expect(performance.totalBitcoin).toBeGreaterThan(0);
      expect(performance.currentValue).toBeGreaterThan(0);
      expect(performance.roi).toBeDefined();
      expect(performance.averagePrice).toBeGreaterThan(0);
    });
  });

  describe('calculateLumpSumPerformance', () => {
    it('should calculate lump sum performance correctly', async () => {
      const mockHistoricalResponse = {
        market_data: {
          current_price: { usd: 47000 },
        },
      };

      const mockCurrentPriceResponse = {
        bitcoin: { usd: 50000 },
      };

      (fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockHistoricalResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCurrentPriceResponse,
        });

      const investmentDate = new Date('2022-01-01');
      const amount = 10000;

      const performance = await BitcoinService.calculateLumpSumPerformance(
        investmentDate,
        amount
      );

      expect(performance.totalInvested).toBe(10000);
      expect(performance.purchasePrice).toBe(47000);
      expect(performance.totalBitcoin).toBeCloseTo(10000 / 47000, 6);
      expect(performance.currentValue).toBeCloseTo((10000 / 47000) * 50000, 2);
      expect(performance.roi).toBeCloseTo(((50000 - 47000) / 47000) * 100, 2);
    });
  });

  describe('Helper methods', () => {
    it('should generate monthly dates correctly', () => {
      const startDate = new Date('2022-01-01');
      const endDate = new Date('2022-03-15');
      
      // Access private method for testing
      const generateMonthlyDates = (BitcoinService as any).generateMonthlyDates;
      const dates = generateMonthlyDates(startDate, endDate);

      expect(dates).toHaveLength(3);
      expect(dates[0]).toEqual(new Date('2022-01-01'));
      expect(dates[1]).toEqual(new Date('2022-02-01'));
      expect(dates[2]).toEqual(new Date('2022-03-01'));
    });

    it('should find closest price correctly', () => {
      const prices = [
        { date: new Date('2022-01-01'), price: 47000 },
        { date: new Date('2022-01-15'), price: 43000 },
        { date: new Date('2022-02-01'), price: 38000 },
      ];

      const findClosestPrice = (BitcoinService as any).findClosestPrice;
      const targetDate = new Date('2022-01-10');
      const closest = findClosestPrice(prices, targetDate);

      expect(closest.price).toBe(47000); // Closer to Jan 1 than Jan 15
    });
  });
});
