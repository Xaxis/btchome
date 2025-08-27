// ===== BITCOIN CALCULATOR - CLEAN MODULAR ARCHITECTURE =====

// ===== CONFIGURATION =====
const CONFIG = {
  API: {
    COINGECKO_URL: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
    FALLBACK_PRICE: 67000
  },
  TIMING_MAP: {
    'now': 0, 'year-1': 1, 'year-2': 2, 'year-3': 3, 'year-5': 5
  },
  DCA_PERIODS: {
    'weekly': 52,
    'monthly': 12, 
    'quarterly': 4
  }
};

// ===== APPLICATION STATE =====
class AppState {
  constructor() {
    this.btcPrice = CONFIG.API.FALLBACK_PRICE;
    this.btcAmount = 1.5;
    this.model = 'saylor';
    this.years = 10;
    this.purchaseTiming = 'now';
    
    this.prefs = {
      // Bitcoin Parameters
      dcaAmount: 0,
      dcaPeriod: 'monthly',
      modelConfidence: 1.0,
      taxRateBtc: 0.20,
      
      // Home Purchase Parameters
      homePrice: 420000,
      downPct: 0.20,
      rate: 0.07,
      term: 30,
      taxRate: 0.012,
      insurance: 1500,
      hoa: 0,
      appreciation: 0.03,
      maintenance: 0.01,
      closingCosts: 0.025,
      
      // Rent Alternative Parameters
      rent: 2500,
      rentGrowth: 0.03,
      rentersInsurance: 200,
      securityDeposit: 5000,
      movingFrequency: 3,
      movingCosts: 2000
    };

    this.chart = {
      instance: null,
      view: 'absolute',
      visibleSeries: { hodl: true, buy: true, rent: true, opportunity: true }
    };
  }

  // Get calculation inputs
  getCalculationInputs(yearsOverride = this.years) {
    return {
      btcAmount: this.btcAmount,
      btcPrice: this.btcPrice,
      timeframeYears: yearsOverride,
      model: this.model,
      purchaseTiming: this.purchaseTiming,
      
      homePrice: this.prefs.homePrice,
      downPaymentPct: this.prefs.downPct,
      interestRate: this.prefs.rate,
      mortgageYears: this.prefs.term,
      propertyTaxRate: this.prefs.taxRate,
      insuranceAnnual: this.prefs.insurance,
      hoaAnnual: this.prefs.hoa,
      appreciationRate: this.prefs.appreciation,
      maintenanceRate: this.prefs.maintenance,
      
      rentAnnual: this.prefs.rent * 12,
      rentGrowthRate: this.prefs.rentGrowth,
      rentersInsurance: this.prefs.rentersInsurance,
      securityDeposit: this.prefs.securityDeposit,
      movingFrequency: this.prefs.movingFrequency,
      movingCosts: this.prefs.movingCosts,
      
      dcaAmount: this.prefs.dcaAmount,
      dcaPeriod: this.prefs.dcaPeriod,
      modelConfidence: this.prefs.modelConfidence,
      taxRateBtc: this.prefs.taxRateBtc
    };
  }
}

// ===== BITCOIN PRICE MODELS =====
class BitcoinModels {
  static saylor(years, price) {
    const energyGrowth = Math.pow(1.15, years);
    const networkGrowth = Math.pow(1.25, years);
    const scarcityPremium = Math.pow(1.20, years);
    const multiplier = energyGrowth * Math.sqrt(networkGrowth) * scarcityPremium;
    const diminishing = years > 10 ? Math.pow(0.98, years - 10) : 1;
    return price * multiplier * diminishing;
  }

  static powerLaw(years, price) {
    const genesisDate = new Date('2009-01-03');
    const currentDays = (Date.now() - genesisDate.getTime()) / (1000 * 60 * 60 * 24);
    const futureDays = currentDays + (years * 365.25);
    const n = 5.8;
    const A = price / Math.pow(currentDays, n);
    const result = A * Math.pow(futureDays, n);
    return Math.min(result, price * 1000);
  }

  static logRegression(years, price) {
    const genesisDate = new Date('2009-01-03');
    const currentDays = (Date.now() - genesisDate.getTime()) / (1000 * 60 * 60 * 24);
    const futureDays = currentDays + (years * 365.25);
    const a = 2.9;
    const b = Math.log10(price) - a * Math.log10(currentDays);
    return Math.pow(10, a * Math.log10(futureDays) + b);
  }

  static s2f(years, price) {
    const currentS2F = 56;
    const halvings = Math.floor(years / 4);
    const futureS2F = currentS2F * Math.pow(2, halvings);
    const k = 3.3;
    const c = Math.log(price) - k * Math.log(currentS2F);
    return Math.exp(k * Math.log(futureS2F) + c);
  }

  static metcalfe(years, price) {
    const networkGrowth = Math.pow(1.20, years);
    const valueMultiplier = Math.pow(networkGrowth, 2);
    return price * valueMultiplier * Math.pow(0.95, years);
  }

  static rainbow(years, price) {
    const genesisDate = new Date('2009-01-03');
    const currentDays = (Date.now() - genesisDate.getTime()) / (1000 * 60 * 60 * 24);
    const futureDays = currentDays + (years * 365.25);
    const logPrice = 2.52 * Math.log10(futureDays) - 17.01;
    const calibration = price / Math.pow(10, 2.52 * Math.log10(currentDays) - 17.01);
    return Math.pow(10, logPrice) * calibration;
  }

  static planB(years, price) {
    const monthsFromGenesis = ((Date.now() - new Date('2009-01-03').getTime()) / (1000 * 60 * 60 * 24 * 30.44)) + (years * 12);
    const s2f = 25.8 * Math.pow(monthsFromGenesis / 12, 0.18);
    return Math.exp(-1.84 + 3.36 * Math.log(s2f));
  }

  static getPrice(model, years, currentPrice, confidence = 1.0) {
    if (!years || years < 0 || !currentPrice || currentPrice <= 0) {
      return currentPrice;
    }

    const modelMap = {
      'saylor': this.saylor,
      'power-law': this.powerLaw,
      'log-regression': this.logRegression,
      's2f': this.s2f,
      'metcalfe': this.metcalfe,
      'rainbow': this.rainbow,
      'plan-b': this.planB
    };

    const modelFn = modelMap[model] || this.saylor;
    const baseResult = modelFn(years, currentPrice);
    
    // Apply confidence adjustment
    const adjustedGrowth = Math.pow(baseResult / currentPrice, confidence);
    const result = currentPrice * adjustedGrowth;
    
    return isFinite(result) && result > 0 ? result : currentPrice * Math.pow(1.12, years);
  }
}

// ===== FINANCIAL CALCULATIONS =====
class FinancialCalc {
  static mortgage(principal, rate, years) {
    if (!principal || !rate || !years || principal <= 0 || rate < 0 || years <= 0) {
      return { monthlyPayment: 0, totalPayments: 0 };
    }
    
    const monthlyRate = rate / 12;
    const numPayments = years * 12;
    
    if (rate === 0) {
      return {
        monthlyPayment: principal / numPayments,
        totalPayments: principal
      };
    }
    
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
      (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    return {
      monthlyPayment,
      totalPayments: monthlyPayment * numPayments
    };
  }

  static dcaAccumulation(dcaAmount, dcaPeriod, timeframeYears, model, btcPrice, confidence) {
    if (!dcaAmount || dcaAmount <= 0) return 0;
    
    const frequency = CONFIG.DCA_PERIODS[dcaPeriod] || 12;
    const totalPeriods = timeframeYears * frequency;
    
    let totalBtc = 0;
    for (let period = 0; period < totalPeriods; period++) {
      const yearFraction = period / frequency;
      const btcPriceAtPeriod = BitcoinModels.getPrice(model, yearFraction, btcPrice, confidence);
      totalBtc += dcaAmount / btcPriceAtPeriod;
    }
    return totalBtc;
  }

  static rentCosts(inputs, timeframeYears) {
    let totalCosts = 0;
    for (let year = 0; year < timeframeYears; year++) {
      const yearlyRent = inputs.rentAnnual * Math.pow(1 + inputs.rentGrowthRate, year);
      const yearlyInsurance = inputs.rentersInsurance || 0;
      const movingCost = year % (inputs.movingFrequency || 3) === 0 ? (inputs.movingCosts || 0) : 0;
      totalCosts += yearlyRent + yearlyInsurance + movingCost;
    }
    return totalCosts;
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AppState, BitcoinModels, FinancialCalc, CONFIG };
}
