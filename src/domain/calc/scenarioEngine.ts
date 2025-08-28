import { models } from '../models';
import type { ModelKey } from '../models';
import { periodsPerYear } from './dca';
import { monthlyPayment } from './mortgage';

export interface ScenarioInputs {
  years: number;
  btcPrice: number;
  btcAmount: number;
  model: ModelKey;
  modelConfidence: number; // 0.5-1.5
  dcaAmount: number;
  dcaPeriod: 'weekly'|'monthly'|'quarterly';
  capGainsTaxRate: number;
  // Home
  homePrice: number;
  downPct: number;
  mortgageRate: number;
  term: number;
  propertyTaxRate: number;
  insuranceAnnual: number;
  hoaMonthly: number;
  appreciationRate: number;
  maintenanceRate: number;
  closingCostsPct: number;
  // Rent
  monthlyRent: number;
  rentGrowthRate: number;
  rentersInsuranceAnnual: number;
  movingFrequencyYears: number;
  movingCostPerMove: number;
  // Timing
  purchaseTiming: 'now'|'year-1'|'year-2'|'year-3'|'year-5';
}

export interface ScenarioOutputs {
  yearsLabels: number[];
  holdAllValue: number[]; // net wealth by year end
  buyHouseValue: number[];
  rentForeverValue: number[];
  opportunityCostSeries: number[];
  // Additional detailed outputs for analysis
  summary: {
    finalYear: {
      holdAll: number;
      buyHouse: number;
      rentForever: number;
      bestStrategy: 'hold' | 'buy' | 'rent';
      opportunityCost: number;
    };
    buyHouseDetails?: {
      homeEquity: number;
      remainingBtc: number;
      btcSoldForDown: number;
      totalNonRecoverableCosts: number;
      monthlyPayment: number;
    };
    rentDetails?: {
      totalRentPaid: number;
      totalMovingCosts: number;
      totalInsurancePaid: number;
    };
    dcaDetails: {
      totalInvested: number;
      btcAccumulated: number;
      averageCost: number;
    };
  };
}

export function runScenario(input: ScenarioInputs): ScenarioOutputs {
  const labels = Array.from({ length: input.years + 1 }, (_, i) => new Date().getFullYear() + i);
  const priceAt = (tYears: number) => models[input.model](tYears, input.btcPrice, { confidence: input.modelConfidence });

  // DCA cumulative BTC at end of each year
  const dcaCum = accumulateDcaCum(input.years, input.dcaAmount, input.dcaPeriod, priceAt);

  // HOLD: BTC only
  const hold: number[] = [];
  for (let i = 0; i <= input.years; i++) {
    const btcQty = input.btcAmount + dcaCum[i];
    hold.push(btcQty * priceAt(i));
  }

  // RENT: BTC minus rent-related costs (improved calculation)
  const { rentSeries, rentDetails } = computeRentSeries(input, priceAt, dcaCum);

  // BUY: sell BTC at purchase to fund down payment + closing, pay ongoing costs, add equity + remaining BTC value
  const { buySeries, buyDetails } = computeBuySeriesEnhanced(input, priceAt, dcaCum);

  const opportunity = hold.map((_, i) => {
    const best = Math.max(hold[i], buySeries[i], rentSeries[i]);
    return hold[i] - best; // negative when worse vs best (baseline hold for convenience)
  });

  // Calculate summary statistics
  const finalIdx = input.years;
  const finalValues = {
    holdAll: hold[finalIdx],
    buyHouse: buySeries[finalIdx],
    rentForever: rentSeries[finalIdx],
  };

  const bestValue = Math.max(finalValues.holdAll, finalValues.buyHouse, finalValues.rentForever);
  const bestStrategy: 'hold' | 'buy' | 'rent' =
    finalValues.holdAll === bestValue ? 'hold' :
    finalValues.buyHouse === bestValue ? 'buy' : 'rent';

  // DCA summary
  const totalDcaInvested = input.dcaAmount * periodsPerYear(input.dcaPeriod) * input.years;
  const finalBtcQty = input.btcAmount + dcaCum[finalIdx];
  const totalInvested = input.btcAmount * input.btcPrice + totalDcaInvested;
  const avgCost = finalBtcQty > 0 ? totalInvested / finalBtcQty : input.btcPrice;

  return {
    yearsLabels: labels,
    holdAllValue: hold,
    buyHouseValue: buySeries,
    rentForeverValue: rentSeries,
    opportunityCostSeries: opportunity,
    summary: {
      finalYear: {
        holdAll: finalValues.holdAll,
        buyHouse: finalValues.buyHouse,
        rentForever: finalValues.rentForever,
        bestStrategy,
        opportunityCost: finalValues.holdAll - bestValue,
      },
      buyHouseDetails: buyDetails,
      rentDetails,
      dcaDetails: {
        totalInvested,
        btcAccumulated: dcaCum[finalIdx],
        averageCost: avgCost,
      },
    }
  };
}

function accumulateDcaCum(years: number, dcaAmountUSD: number, periodKey: 'weekly'|'monthly'|'quarterly', priceAt: (t: number)=> number) {
  const perYear = periodsPerYear(periodKey);
  const out: number[] = [];
  let total = 0;
  for (let y = 0; y <= years; y++) {
    if (y>0 && dcaAmountUSD>0) {
      for (let p = 0; p < perYear; p++) {
        const t = (y-1) + (p+1)/perYear; // spread within the year
        const price = priceAt(t);
        if (price > 0) total += dcaAmountUSD / price;
      }
    }
    out.push(total);
  }
  return out;
}

function annualRentCost(yearIndex: number, monthlyRent0: number, growth: number) {
  const rentThisYearMonthly = monthlyRent0 * Math.pow(1 + growth, yearIndex);
  return rentThisYearMonthly * 12;
}

function computeRentSeries(input: ScenarioInputs, priceAt: (t: number) => number, dcaCum: number[]) {
  const rent: number[] = [];
  let totalRentPaid = 0;
  let totalMovingCosts = 0;
  let totalInsurancePaid = 0;

  for (let i = 0; i <= input.years; i++) {
    if (i > 0) {
      // Annual rent cost with growth
      const rentThisYear = annualRentCost(i - 1, input.monthlyRent, input.rentGrowthRate);
      totalRentPaid += rentThisYear;

      // Renters insurance
      totalInsurancePaid += input.rentersInsuranceAnnual;

      // Moving costs (if it's a moving year)
      if (input.movingFrequencyYears > 0 && i % input.movingFrequencyYears === 0) {
        totalMovingCosts += input.movingCostPerMove;
      }
    }

    const btcQty = input.btcAmount + dcaCum[i];
    const btcValue = btcQty * priceAt(i);
    const totalCosts = totalRentPaid + totalInsurancePaid + totalMovingCosts;

    rent.push(btcValue - totalCosts);
  }

  return {
    rentSeries: rent,
    rentDetails: {
      totalRentPaid,
      totalMovingCosts,
      totalInsurancePaid,
    }
  };
}

function computeBuySeriesEnhanced(input: ScenarioInputs, priceAt: (t:number)=>number, dcaCum: number[]) {
  const years = input.years;
  const buy: number[] = new Array(years + 1).fill(0);

  const pYear = purchaseYearIndex(input.purchaseTiming);

  // Home price at purchase and after
  const homePriceAt = (t:number) => input.homePrice * Math.pow(1 + input.appreciationRate, t);

  // Determine BTC holdings and cost basis up to purchase
  const btcQtyAt = (t:number) => input.btcAmount + dcaCum[t];
  const dollarsSpentOnBTCUpTo = (t:number) => input.btcAmount * input.btcPrice + dcaDollarsSpent(input.dcaAmount, input.dcaPeriod, t);
  const avgCostPerBTCUpTo = (t:number) => {
    const qty = btcQtyAt(t);
    return qty > 0 ? dollarsSpentOnBTCUpTo(t) / qty : input.btcPrice;
  };

  // Sale calculation at purchase
  const priceAtPurchase = priceAt(pYear);
  const homePricePurchase = homePriceAt(pYear);
  const neededDown = homePricePurchase * input.downPct;
  const closing = homePricePurchase * input.closingCostsPct;
  const requiredCash = neededDown + closing;
  const btcHeldAtP = btcQtyAt(pYear);

  // Calculate how much BTC to sell (may need to sell all if not enough)
  let btcToSell = Math.min(btcHeldAtP, requiredCash / Math.max(priceAtPurchase, 1e-9));
  const avgCost = avgCostPerBTCUpTo(pYear);
  const gainsPerBTC = Math.max(0, priceAtPurchase - avgCost);
  const taxOwed = gainsPerBTC * btcToSell * input.capGainsTaxRate;

  // After-tax proceeds from BTC sale
  let proceeds = btcToSell * priceAtPurchase - taxOwed;
  let externalCashNeeded = 0;

  if (proceeds < requiredCash) {
    // Need external cash to cover shortfall
    externalCashNeeded = requiredCash - proceeds;
    btcToSell = btcHeldAtP; // sell all BTC
  }

  const btcRemainingAfterPurchase = btcHeldAtP - btcToSell;

  // Mortgage principal
  const principal = homePricePurchase * (1 - input.downPct);
  const mPayment = monthlyPayment({ principal, annualRate: input.mortgageRate, termYears: input.term });

  // Build amortization across months after purchase to compute yearly interest and balances
  const monthsTotal = Math.min(input.term * 12, Math.max(0, (years - pYear) * 12));
  const { balanceByYear, interestByYear } = amortizeByYear(principal, input.mortgageRate/12, mPayment, monthsTotal);

  // Track cumulative non-recoverable costs
  let totalNonRecoverableCosts = 0;

  // Compute yearly series
  for (let y = 0; y <= years; y++) {
    const btcQty = input.btcAmount + dcaCum[y] - (y >= pYear ? btcToSell : 0);
    const btcValue = btcQty * priceAt(y);

    if (y < pYear) {
      buy[y] = btcValue; // before purchase, equivalent to hold
      continue;
    }

    const yearIdxAfterPurchase = y - pYear;
    const homeVal = homePriceAt(y);
    const balance = balanceByYear[Math.min(yearIdxAfterPurchase, balanceByYear.length-1)] || 0;
    const equity = Math.max(0, homeVal - balance);

    // Calculate yearly non-recoverable costs
    const propertyTax = input.propertyTaxRate * homeVal;
    const insurance = input.insuranceAnnual;
    const hoa = input.hoaMonthly * 12;
    const maintenance = input.maintenanceRate * homeVal;
    const interest = yearIdxAfterPurchase > 0 ? (interestByYear[yearIdxAfterPurchase - 1] || 0) : 0;

    // One-time costs in purchase year
    const oneTimeCosts = (y === pYear) ? (closing + taxOwed + externalCashNeeded) : 0;

    const yearlyNonRecoverable = propertyTax + insurance + hoa + maintenance + interest + oneTimeCosts;
    totalNonRecoverableCosts += yearlyNonRecoverable;

    // Net worth = home equity + remaining BTC value - cumulative non-recoverable costs
    buy[y] = equity + btcValue - totalNonRecoverableCosts;
  }

  // Return enhanced details
  const buyDetails = {
    homeEquity: buy.length > pYear ? homePriceAt(years) - (balanceByYear[years - pYear] || 0) : 0,
    remainingBtc: btcRemainingAfterPurchase,
    btcSoldForDown: btcToSell,
    totalNonRecoverableCosts,
    monthlyPayment: mPayment,
  };

  return { buySeries: buy, buyDetails };
}

function purchaseYearIndex(p: ScenarioInputs['purchaseTiming'] | undefined) {
  if (!p) return 0;
  if (p === 'now') return 0;
  const parts = String(p).split('-');
  const n = Number((parts[1] || '0'));
  return isFinite(n) ? n : 0;
}

function dcaDollarsSpent(amountUSD: number, periodKey: 'weekly'|'monthly'|'quarterly', upToYearInclusive: number) {
  const perYear = periodsPerYear(periodKey);
  if (amountUSD <= 0) return 0;
  return upToYearInclusive * perYear * amountUSD;
}

function amortizeByYear(principal: number, monthlyRate: number, payment: number, months: number) {
  let bal = principal;
  const years = Math.ceil(months / 12);
  const balanceByYear: number[] = [];
  const interestByYear: number[] = [];
  let interestAcc = 0;
  for (let m = 1; m <= months; m++) {
    const interest = bal * monthlyRate;
    const principalPaid = Math.max(0, payment - interest);
    bal = Math.max(0, bal + interest - payment);
    interestAcc += interest;
    if (m % 12 === 0) {
      balanceByYear.push(bal);
      interestByYear.push(interestAcc);
      interestAcc = 0;
    }
  }
  // pad to requested years length if shorter than full term
  while (balanceByYear.length < years) balanceByYear.push(bal);
  return { balanceByYear, interestByYear };
}

