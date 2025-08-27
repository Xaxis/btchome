import type { BitcoinPrice, CoinGeckoResponse } from '@/types';

/**
 * Bitcoin API Service
 * Handles fetching Bitcoin price data from CoinGecko API
 */
export class BitcoinService {
  private static readonly BASE_URL = 'https://api.coingecko.com/api/v3';
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private static cache = new Map<string, { data: any; timestamp: number }>();

  /**
   * Fetch current Bitcoin price
   */
  static async getCurrentPrice(): Promise<number> {
    const cacheKey = 'current-price';
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return cached.bitcoin.usd;
    }

    try {
      const response = await fetch(
        `${this.BASE_URL}/simple/price?ids=bitcoin&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      this.setCachedData(cacheKey, data);
      
      return data.bitcoin.usd;
    } catch (error) {
      console.error('Error fetching current Bitcoin price:', error);
      throw new Error('Failed to fetch current Bitcoin price');
    }
  }

  /**
   * Fetch historical Bitcoin prices
   */
  static async getHistoricalPrices(
    startDate: Date,
    endDate: Date = new Date()
  ): Promise<BitcoinPrice[]> {
    const cacheKey = `historical-${startDate.getTime()}-${endDate.getTime()}`;
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return this.formatHistoricalData(cached);
    }

    try {
      const fromTimestamp = Math.floor(startDate.getTime() / 1000);
      const toTimestamp = Math.floor(endDate.getTime() / 1000);
      
      const response = await fetch(
        `${this.BASE_URL}/coins/bitcoin/market_chart/range?vs_currency=usd&from=${fromTimestamp}&to=${toTimestamp}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: CoinGeckoResponse = await response.json();
      this.setCachedData(cacheKey, data);
      
      return this.formatHistoricalData(data);
    } catch (error) {
      console.error('Error fetching historical Bitcoin prices:', error);
      throw new Error('Failed to fetch historical Bitcoin prices');
    }
  }

  /**
   * Get Bitcoin price at a specific date
   */
  static async getPriceAtDate(date: Date): Promise<number> {
    const dateStr = date.toISOString().split('T')[0];
    const cacheKey = `price-at-${dateStr}`;
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return cached.market_data.current_price.usd;
    }

    try {
      const response = await fetch(
        `${this.BASE_URL}/coins/bitcoin/history?date=${dateStr}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      this.setCachedData(cacheKey, data);
      
      return data.market_data.current_price.usd;
    } catch (error) {
      console.error(`Error fetching Bitcoin price for ${dateStr}:`, error);
      throw new Error(`Failed to fetch Bitcoin price for ${dateStr}`);
    }
  }

  /**
   * Calculate DCA (Dollar Cost Averaging) performance
   */
  static async calculateDCAPerformance(
    startDate: Date,
    endDate: Date,
    monthlyAmount: number
  ): Promise<{
    totalInvested: number;
    totalBitcoin: number;
    currentValue: number;
    roi: number;
    averagePrice: number;
  }> {
    try {
      const historicalPrices = await this.getHistoricalPrices(startDate, endDate);
      const currentPrice = await this.getCurrentPrice();
      
      let totalInvested = 0;
      let totalBitcoin = 0;
      
      // Calculate monthly DCA purchases
      const monthlyPurchases = this.generateMonthlyDates(startDate, endDate);
      
      for (const purchaseDate of monthlyPurchases) {
        const priceAtDate = this.findClosestPrice(historicalPrices, purchaseDate);
        if (priceAtDate) {
          totalInvested += monthlyAmount;
          totalBitcoin += monthlyAmount / priceAtDate.price;
        }
      }
      
      const currentValue = totalBitcoin * currentPrice;
      const roi = totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested) * 100 : 0;
      const averagePrice = totalInvested / totalBitcoin;
      
      return {
        totalInvested,
        totalBitcoin,
        currentValue,
        roi,
        averagePrice,
      };
    } catch (error) {
      console.error('Error calculating DCA performance:', error);
      throw new Error('Failed to calculate DCA performance');
    }
  }

  /**
   * Calculate lump sum investment performance
   */
  static async calculateLumpSumPerformance(
    investmentDate: Date,
    amount: number
  ): Promise<{
    totalInvested: number;
    totalBitcoin: number;
    currentValue: number;
    roi: number;
    purchasePrice: number;
  }> {
    try {
      const purchasePrice = await this.getPriceAtDate(investmentDate);
      const currentPrice = await this.getCurrentPrice();
      
      const totalBitcoin = amount / purchasePrice;
      const currentValue = totalBitcoin * currentPrice;
      const roi = ((currentValue - amount) / amount) * 100;
      
      return {
        totalInvested: amount,
        totalBitcoin,
        currentValue,
        roi,
        purchasePrice,
      };
    } catch (error) {
      console.error('Error calculating lump sum performance:', error);
      throw new Error('Failed to calculate lump sum performance');
    }
  }

  // Helper methods
  private static formatHistoricalData(data: CoinGeckoResponse): BitcoinPrice[] {
    return data.prices.map(([timestamp, price], index) => ({
      date: new Date(timestamp),
      price,
      marketCap: data.market_caps[index]?.[1],
      volume: data.total_volumes[index]?.[1],
    }));
  }

  private static generateMonthlyDates(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setMonth(current.getMonth() + 1);
    }
    
    return dates;
  }

  private static findClosestPrice(prices: BitcoinPrice[], targetDate: Date): BitcoinPrice | null {
    if (prices.length === 0) return null;
    
    return prices.reduce((closest, current) => {
      const currentDiff = Math.abs(current.date.getTime() - targetDate.getTime());
      const closestDiff = Math.abs(closest.date.getTime() - targetDate.getTime());
      return currentDiff < closestDiff ? current : closest;
    });
  }

  private static getCachedData(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private static setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}
