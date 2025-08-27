// ===== CALCULATION ENGINE - CLEAN BUSINESS LOGIC =====

class CalculationEngine {
  constructor(appState) {
    this.appState = appState;
  }

  // Main calculation entry point
  compute(yearsOverride = null) {
    const inputs = this.appState.getCalculationInputs(yearsOverride);
    return this.runScenarioAnalysis(inputs);
  }

  // Core scenario analysis
  runScenarioAnalysis(inputs) {
    const {
      btcAmount, btcPrice, timeframeYears, model, purchaseTiming,
      downPaymentPct, interestRate, mortgageYears,
      appreciationRate, homePrice, rentAnnual, dcaAmount, dcaPeriod,
      modelConfidence, taxRateBtc
    } = inputs;

    // Validate inputs
    if (!btcAmount || !btcPrice || !timeframeYears || btcAmount <= 0 || btcPrice <= 0 || timeframeYears <= 0) {
      return {
        holdAllValue: 0,
        buyHouseValue: 0,
        rentForeverValue: 0,
        error: 'Invalid inputs'
      };
    }

    // Parse purchase timing
    const purchaseYear = CONFIG.TIMING_MAP[purchaseTiming] || 0;
    
    // Calculate DCA and final prices
    const dcaBtcAccumulated = FinancialCalc.dcaAccumulation(
      dcaAmount, dcaPeriod, timeframeYears, model, btcPrice, modelConfidence
    );
    const finalBtcPrice = BitcoinModels.getPrice(model, timeframeYears, btcPrice, modelConfidence);
    
    // Scenario 1: Hold all Bitcoin + DCA
    const totalBtc = btcAmount + dcaBtcAccumulated;
    const holdAllValue = totalBtc * finalBtcPrice;

    // Scenario 2: Buy house at specific timing
    const purchaseBtcPrice = BitcoinModels.getPrice(model, purchaseYear, btcPrice, modelConfidence);
    const requiredDownPayment = homePrice * downPaymentPct;
    
    // Apply capital gains tax
    const btcNeededBeforeTax = requiredDownPayment / purchaseBtcPrice;
    const capitalGains = Math.max(0, (purchaseBtcPrice - (inputs.costBasis || 0)) * btcNeededBeforeTax);
    const taxOwed = capitalGains * taxRateBtc;
    const btcNeededForDown = (requiredDownPayment + taxOwed) / purchaseBtcPrice;
    
    if (btcNeededForDown > btcAmount) {
      return {
        holdAllValue,
        buyHouseValue: 0,
        rentForeverValue: holdAllValue - FinancialCalc.rentCosts(inputs, timeframeYears),
        opportunityCosts: { holdAll: 0, buyHouse: holdAllValue, rentForever: 0 },
        error: 'Insufficient Bitcoin for down payment (including taxes)',
        btcSpent: btcNeededForDown,
        btcRemaining: 0,
        taxOwed
      };
    }

    const btcRemaining = btcAmount - btcNeededForDown;
    const yearsOfOwnership = Math.max(0, timeframeYears - purchaseYear);
    
    // Calculate house equity
    const futureHomeValue = homePrice * Math.pow(1 + appreciationRate, yearsOfOwnership);
    const loanAmount = homePrice - requiredDownPayment;
    const mortgage = FinancialCalc.mortgage(loanAmount, interestRate, mortgageYears);
    
    // Calculate remaining mortgage balance
    let remainingBalance = 0;
    if (yearsOfOwnership > 0 && yearsOfOwnership < mortgageYears) {
      const monthlyRate = interestRate / 12;
      const paymentsMade = yearsOfOwnership * 12;
      remainingBalance = loanAmount * Math.pow(1 + monthlyRate, paymentsMade) - 
        mortgage.monthlyPayment * ((Math.pow(1 + monthlyRate, paymentsMade) - 1) / monthlyRate);
      remainingBalance = Math.max(0, remainingBalance);
    }
    
    const homeEquity = Math.max(0, futureHomeValue - remainingBalance);
    
    // Value of remaining Bitcoin + DCA at end
    const remainingBtcValue = (btcRemaining + dcaBtcAccumulated) * finalBtcPrice;
    
    // Total wealth from buying house
    const buyHouseValue = homeEquity + remainingBtcValue;

    // Scenario 3: Rent forever + keep all Bitcoin with DCA
    const totalRentCosts = FinancialCalc.rentCosts(inputs, timeframeYears);
    const rentForeverValue = holdAllValue - totalRentCosts;

    // Calculate opportunity costs
    const allValues = [holdAllValue, buyHouseValue, rentForeverValue].filter(v => isFinite(v) && v > 0);
    const maxValue = Math.max(...allValues);
    
    const opportunityCosts = {
      holdAll: maxValue - holdAllValue,
      buyHouse: maxValue - buyHouseValue,
      rentForever: maxValue - rentForeverValue
    };

    return {
      holdAllValue: holdAllValue || 0,
      buyHouseValue: buyHouseValue || 0,
      rentForeverValue: rentForeverValue || 0,
      opportunityCosts,
      maxValue,
      btcSpent: btcNeededForDown || 0,
      btcRemaining: btcRemaining || 0,
      purchaseBtcPrice: purchaseBtcPrice || btcPrice,
      homeEquity: homeEquity || 0,
      remainingBtcValue: remainingBtcValue || 0,
      monthlyPayment: mortgage.monthlyPayment || 0,
      monthlyRent: (rentAnnual || 0) / 12,
      yearsOfOwnership: yearsOfOwnership || 0,
      taxOwed: taxOwed || 0,
      dcaBtcAccumulated: dcaBtcAccumulated || 0
    };
  }

  // Get best strategy
  getBestStrategy(result) {
    const strategies = [
      { name: 'holdAll', value: result.holdAllValue || 0 },
      { name: 'buyHouse', value: result.buyHouseValue || 0 },
      { name: 'rentForever', value: result.rentForeverValue || 0 }
    ];
    
    const validStrategies = strategies.filter(s => isFinite(s.value) && s.value > 0);
    if (validStrategies.length === 0) return 'holdAll';
    
    validStrategies.sort((a, b) => b.value - a.value);
    return validStrategies[0].name;
  }

  // Get worst strategy
  getWorstStrategy(result) {
    const strategies = [
      { name: 'holdAll', value: result.holdAllValue || 0 },
      { name: 'buyHouse', value: result.buyHouseValue || 0 },
      { name: 'rentForever', value: result.rentForeverValue || 0 }
    ];
    
    const validStrategies = strategies.filter(s => isFinite(s.value) && s.value > 0);
    if (validStrategies.length === 0) return 'holdAll';
    
    validStrategies.sort((a, b) => a.value - b.value);
    return validStrategies[0].name;
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CalculationEngine };
}
