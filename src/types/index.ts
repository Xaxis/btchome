// Bitcoin Investment Types
export interface BitcoinInvestment {
  strategy: 'dca' | 'lump-sum';
  amount: number;
  startDate: Date;
  endDate?: Date;
  frequency?: 'daily' | 'weekly' | 'monthly';
}

export interface BitcoinPrice {
  date: Date;
  price: number;
  marketCap?: number;
  volume?: number;
}

// Real Estate Types
export interface RealEstateProperty {
  price: number;
  location: string;
  propertyType: 'single-family' | 'condo' | 'townhouse' | 'multi-family';
  squareFootage?: number;
  bedrooms?: number;
  bathrooms?: number;
}

export interface MortgageDetails {
  principal: number;
  interestRate: number;
  termYears: number;
  downPayment: number;
  propertyTaxRate: number;
  homeInsurance: number;
  pmiRate?: number;
  hoaFees?: number;
}

export interface MortgagePayment {
  month: number;
  principalPayment: number;
  interestPayment: number;
  remainingBalance: number;
  totalPayment: number;
  propertyTax: number;
  insurance: number;
  pmi?: number;
  hoa?: number;
}

// Tax Types
export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

export interface TaxDeductions {
  mortgageInterest: number;
  propertyTax: number;
  standardDeduction: number;
  stateAndLocalTax: number;
}

// Comparison Types
export interface InvestmentComparison {
  bitcoinValue: number;
  realEstateValue: number;
  bitcoinROI: number;
  realEstateROI: number;
  timeframe: number; // years
  totalBitcoinInvested: number;
  totalRealEstateInvested: number;
}

export interface AffordabilityAnalysis {
  bitcoinStackValue: number;
  affordableHomePrice: number;
  downPaymentFromBitcoin: number;
  remainingBitcoinValue: number;
  monthlyPaymentCapacity: number;
}

// API Response Types
export interface CoinGeckoResponse {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export interface FREDResponse {
  observations: Array<{
    date: string;
    value: string;
  }>;
}

// UI State Types
export interface AppSettings {
  theme: 'light' | 'dark';
  currency: 'USD' | 'EUR' | 'GBP';
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
}

export interface CalculatorInputs {
  bitcoinInvestment: BitcoinInvestment;
  mortgageDetails: MortgageDetails;
  property: RealEstateProperty;
  taxBracket: number;
  location: string;
}

// Chart Data Types
export interface ChartDataPoint {
  x: Date | string;
  y: number;
  label?: string;
}

export interface ChartDataset {
  label: string;
  data: ChartDataPoint[];
  borderColor: string;
  backgroundColor: string;
  fill?: boolean;
}
