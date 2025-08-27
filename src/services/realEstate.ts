import type { FREDResponse } from '@/types';

/**
 * Real Estate Data Service
 * Handles fetching real estate market data and median home prices
 */
export class RealEstateService {
  private static readonly FRED_BASE_URL = 'https://api.stlouisfed.org/fred';
  private static readonly FRED_API_KEY = 'your_fred_api_key'; // In production, use environment variable
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private static cache = new Map<string, { data: any; timestamp: number }>();

  /**
   * Get median home prices for the US
   */
  static async getMedianHomePrices(
    startDate: Date,
    endDate: Date = new Date()
  ): Promise<Array<{ date: Date; price: number }>> {
    const cacheKey = `median-home-prices-${startDate.getTime()}-${endDate.getTime()}`;
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return this.formatFREDData(cached);
    }

    try {
      // Using FRED API for median home prices (MSPUS - Median Sales Price of Houses Sold for the United States)
      const startDateStr = this.formatDateForFRED(startDate);
      const endDateStr = this.formatDateForFRED(endDate);
      
      const response = await fetch(
        `${this.FRED_BASE_URL}/series/observations?series_id=MSPUS&api_key=${this.FRED_API_KEY}&file_type=json&observation_start=${startDateStr}&observation_end=${endDateStr}`
      );
      
      if (!response.ok) {
        // Fallback to mock data if FRED API is not available
        return this.getMockMedianHomePrices(startDate, endDate);
      }
      
      const data: FREDResponse = await response.json();
      this.setCachedData(cacheKey, data);
      
      return this.formatFREDData(data);
    } catch (error) {
      console.warn('Error fetching FRED data, using mock data:', error);
      return this.getMockMedianHomePrices(startDate, endDate);
    }
  }

  /**
   * Get current median home price
   */
  static async getCurrentMedianHomePrice(): Promise<number> {
    const cacheKey = 'current-median-home-price';
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(endDate.getFullYear() - 1);
      
      const prices = await this.getMedianHomePrices(startDate, endDate);
      const currentPrice = prices[prices.length - 1]?.price || 420000; // Fallback to approximate current median
      
      this.setCachedData(cacheKey, currentPrice);
      return currentPrice;
    } catch (error) {
      console.error('Error fetching current median home price:', error);
      return 420000; // Fallback value
    }
  }

  /**
   * Get median home prices by state/metro area
   */
  static async getMedianHomePricesByLocation(
    location: string,
    startDate: Date,
    endDate: Date = new Date()
  ): Promise<Array<{ date: Date; price: number }>> {
    // This would require mapping location to FRED series IDs
    // For now, return national data with location-based adjustments
    const nationalPrices = await this.getMedianHomePrices(startDate, endDate);
    const locationMultiplier = this.getLocationPriceMultiplier(location);
    
    return nationalPrices.map(item => ({
      date: item.date,
      price: item.price * locationMultiplier,
    }));
  }

  /**
   * Calculate home price appreciation
   */
  static async calculateHomePriceAppreciation(
    startDate: Date,
    endDate: Date = new Date(),
    location?: string
  ): Promise<{
    startPrice: number;
    endPrice: number;
    totalAppreciation: number;
    annualizedReturn: number;
  }> {
    try {
      const prices = location 
        ? await this.getMedianHomePricesByLocation(location, startDate, endDate)
        : await this.getMedianHomePrices(startDate, endDate);
      
      if (prices.length < 2) {
        throw new Error('Insufficient price data');
      }
      
      const startPrice = prices[0].price;
      const endPrice = prices[prices.length - 1].price;
      const totalAppreciation = ((endPrice - startPrice) / startPrice) * 100;
      
      const years = (endDate.getTime() - startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      const annualizedReturn = (Math.pow(endPrice / startPrice, 1 / years) - 1) * 100;
      
      return {
        startPrice,
        endPrice,
        totalAppreciation,
        annualizedReturn,
      };
    } catch (error) {
      console.error('Error calculating home price appreciation:', error);
      throw new Error('Failed to calculate home price appreciation');
    }
  }

  /**
   * Get property tax rates by location
   */
  static getPropertyTaxRate(location: string): number {
    const taxRates: Record<string, number> = {
      'california': 0.0075,
      'texas': 0.0181,
      'florida': 0.0098,
      'new-york': 0.0124,
      'illinois': 0.0228,
      'pennsylvania': 0.0154,
      'ohio': 0.0157,
      'georgia': 0.0092,
      'north-carolina': 0.0084,
      'michigan': 0.0154,
      'default': 0.0110, // National average
    };
    
    const normalizedLocation = location.toLowerCase().replace(/\s+/g, '-');
    return taxRates[normalizedLocation] || taxRates.default;
  }

  /**
   * Estimate home insurance cost
   */
  static estimateHomeInsurance(homeValue: number, location: string): number {
    const baseRate = 0.0035; // 0.35% of home value nationally
    const locationMultiplier = this.getInsuranceMultiplier(location);
    
    return homeValue * baseRate * locationMultiplier;
  }

  // Helper methods
  private static formatDateForFRED(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private static formatFREDData(data: FREDResponse): Array<{ date: Date; price: number }> {
    return data.observations
      .filter(obs => obs.value !== '.')
      .map(obs => ({
        date: new Date(obs.date),
        price: parseFloat(obs.value),
      }));
  }

  private static getMockMedianHomePrices(
    startDate: Date,
    endDate: Date
  ): Array<{ date: Date; price: number }> {
    const prices: Array<{ date: Date; price: number }> = [];
    const current = new Date(startDate);
    let basePrice = 350000; // Starting price
    const monthlyAppreciation = 0.005; // 0.5% monthly appreciation
    
    while (current <= endDate) {
      prices.push({
        date: new Date(current),
        price: Math.round(basePrice),
      });
      
      basePrice *= (1 + monthlyAppreciation);
      current.setMonth(current.getMonth() + 1);
    }
    
    return prices;
  }

  private static getLocationPriceMultiplier(location: string): number {
    const multipliers: Record<string, number> = {
      'san-francisco': 2.5,
      'new-york': 2.2,
      'los-angeles': 1.8,
      'seattle': 1.6,
      'boston': 1.5,
      'washington-dc': 1.4,
      'miami': 1.3,
      'chicago': 1.1,
      'denver': 1.2,
      'austin': 1.3,
      'atlanta': 0.9,
      'phoenix': 0.95,
      'dallas': 0.9,
      'houston': 0.85,
      'default': 1.0,
    };
    
    const normalizedLocation = location.toLowerCase().replace(/\s+/g, '-');
    return multipliers[normalizedLocation] || multipliers.default;
  }

  private static getInsuranceMultiplier(location: string): number {
    const multipliers: Record<string, number> = {
      'florida': 2.5, // Hurricane risk
      'texas': 1.8, // Tornado/hail risk
      'california': 1.6, // Earthquake/fire risk
      'louisiana': 2.2, // Hurricane risk
      'oklahoma': 1.7, // Tornado risk
      'default': 1.0,
    };
    
    const normalizedLocation = location.toLowerCase().replace(/\s+/g, '-');
    return multipliers[normalizedLocation] || multipliers.default;
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
