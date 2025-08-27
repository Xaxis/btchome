import { getModel, type ModelKey } from './models';
import { FinancialCalculations as Fin } from '@/utils/calculations';

export interface UserInputs {
  btcAmount: number; // BTC held today
  btcPrice: number; // USD/BTC current
  timeframeYears: number; // horizon
  model: ModelKey; // projection model
  downPaymentPct: number; // 0.20 for 20%
  interestRate: number; // e.g., 0.07
  mortgageYears: number; // e.g., 30
  propertyTaxRate: number; // e.g., 0.012 (1.2%)
  insuranceAnnual: number; // dollars per year
  rentAnnual: number; // annual rent if renting
  appreciationRate: number; // home appreciation, e.g., 0.03
}

export interface ScenarioOutputs {
  futureBtcValue: number;
  buyHouseEquity: number;
  rentPlusBtcNet: number;
  monthlyMortgage: number;
}

export function runScenarios(inputs: UserInputs): ScenarioOutputs {
  const {
    btcAmount, btcPrice, timeframeYears, model,
    downPaymentPct, interestRate, mortgageYears,
    propertyTaxRate, insuranceAnnual, rentAnnual, appreciationRate
  } = inputs;

  // Project future BTC price
  const m = getModel(model);
  const futurePrice = m.price({ yearsFromNow: timeframeYears, currentPrice: btcPrice });

  // Scenario 1: Hold BTC
  const futureBtcValue = btcAmount * futurePrice;

  // Scenario 2: Buy house now with down payment from BTC
  const downPaymentUSD = btcAmount * btcPrice * downPaymentPct; // portion of stack used
  const remainingBtc = Math.max(0, btcAmount - (downPaymentUSD / btcPrice));

  // Assume target home price sized by down payment (avoid overfitting to median):
  // homePrice = downPaymentUSD / downPaymentPct
  const homePrice = downPaymentUSD / downPaymentPct;
  const loanPrincipal = homePrice - downPaymentUSD;

  const monthly = Fin.calculateMonthlyPayment(loanPrincipal, interestRate, mortgageYears);
  const mortgageDetails = {
    principal: loanPrincipal,
    interestRate,
    termYears: mortgageYears,
    propertyTaxRate,
    homeInsurance: insuranceAnnual,
    pmiRate: downPaymentPct < 0.20 ? 0.01 : 0, // crude PMI if <20%
    hoaFees: 0,
  };
  const tot = Fin.calculateTotalHomeownershipCost(mortgageDetails as any, timeframeYears);
  // Equity = home value - remaining mortgage balance (approx by equity from Fin)
  const buyHouseEquity = tot.equity;

  // Scenario 3: Rent + keep remaining BTC (after reserving a comparable cash buffer)
  const rentCost = rentAnnual * timeframeYears;
  const futureRemainingBtcValue = remainingBtc * futurePrice;
  const rentPlusBtcNet = Math.max(0, futureRemainingBtcValue - rentCost);

  return { futureBtcValue, buyHouseEquity, rentPlusBtcNet, monthlyMortgage: monthly };
}

