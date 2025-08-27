import type { MortgageDetails, MortgagePayment, TaxDeductions } from '@/types';

/**
 * Financial calculation utilities for mortgage, taxes, and investment analysis
 */
export class FinancialCalculations {
  
  /**
   * Calculate monthly mortgage payment (Principal + Interest)
   */
  static calculateMonthlyPayment(
    principal: number,
    annualRate: number,
    termYears: number
  ): number {
    const monthlyRate = annualRate / 12;
    const numPayments = termYears * 12;
    
    if (monthlyRate === 0) {
      return principal / numPayments;
    }
    
    const monthlyPayment = principal * 
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    return monthlyPayment;
  }

  /**
   * Generate complete amortization schedule
   */
  static generateAmortizationSchedule(
    mortgageDetails: MortgageDetails
  ): MortgagePayment[] {
    const {
      principal,
      interestRate,
      termYears,
      propertyTaxRate,
      homeInsurance,
      pmiRate = 0,
      hoaFees = 0,
    } = mortgageDetails;

    const monthlyPayment = this.calculateMonthlyPayment(principal, interestRate, termYears);
    const monthlyPropertyTax = (principal * propertyTaxRate) / 12;
    const monthlyInsurance = homeInsurance / 12;
    const monthlyPMI = pmiRate > 0 ? (principal * pmiRate) / 12 : 0;
    const monthlyHOA = hoaFees / 12;

    const schedule: MortgagePayment[] = [];
    let remainingBalance = principal;
    const monthlyRate = interestRate / 12;

    for (let month = 1; month <= termYears * 12; month++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      remainingBalance -= principalPayment;

      // PMI typically drops when loan-to-value ratio reaches 78%
      const currentPMI = (remainingBalance / principal) > 0.78 ? monthlyPMI : 0;

      schedule.push({
        month,
        principalPayment,
        interestPayment,
        remainingBalance: Math.max(0, remainingBalance),
        totalPayment: monthlyPayment,
        propertyTax: monthlyPropertyTax,
        insurance: monthlyInsurance,
        pmi: currentPMI,
        hoa: monthlyHOA,
      });

      if (remainingBalance <= 0) break;
    }

    return schedule;
  }

  /**
   * Calculate total cost of homeownership over time
   */
  static calculateTotalHomeownershipCost(
    mortgageDetails: MortgageDetails,
    years: number,
    maintenanceRate: number = 0.01, // 1% of home value annually
    appreciationRate: number = 0.03 // 3% annual appreciation
  ): {
    totalMortgagePayments: number;
    totalInterest: number;
    totalPropertyTax: number;
    totalInsurance: number;
    totalPMI: number;
    totalHOA: number;
    totalMaintenance: number;
    homeValue: number;
    netCost: number;
    equity: number;
  } {
    const schedule = this.generateAmortizationSchedule(mortgageDetails);
    const monthsToCalculate = Math.min(years * 12, schedule.length);
    
    let totalMortgagePayments = 0;
    let totalInterest = 0;
    let totalPropertyTax = 0;
    let totalInsurance = 0;
    let totalPMI = 0;
    let totalHOA = 0;

    for (let i = 0; i < monthsToCalculate; i++) {
      const payment = schedule[i];
      totalMortgagePayments += payment.totalPayment;
      totalInterest += payment.interestPayment;
      totalPropertyTax += payment.propertyTax;
      totalInsurance += payment.insurance;
      totalPMI += payment.pmi || 0;
      totalHOA += payment.hoa || 0;
    }

    const totalMaintenance = (mortgageDetails.principal * maintenanceRate * years);
    const homeValue = mortgageDetails.principal * Math.pow(1 + appreciationRate, years);
    const remainingBalance = schedule[monthsToCalculate - 1]?.remainingBalance || 0;
    const equity = homeValue - remainingBalance;
    const totalCosts = totalMortgagePayments + totalPropertyTax + totalInsurance + totalPMI + totalHOA + totalMaintenance;
    const netCost = totalCosts - (homeValue - mortgageDetails.principal);

    return {
      totalMortgagePayments,
      totalInterest,
      totalPropertyTax,
      totalInsurance,
      totalPMI,
      totalHOA,
      totalMaintenance,
      homeValue,
      netCost,
      equity,
    };
  }

  /**
   * Calculate tax benefits from homeownership
   */
  static calculateTaxBenefits(
    mortgageDetails: MortgageDetails,
    taxBracket: number,
    years: number,
    standardDeduction: number = 13850 // 2023 standard deduction for single filer
  ): {
    totalMortgageInterestDeduction: number;
    totalPropertyTaxDeduction: number;
    totalTaxSavings: number;
    effectiveRate: number;
  } {
    const schedule = this.generateAmortizationSchedule(mortgageDetails);
    const monthsToCalculate = Math.min(years * 12, schedule.length);
    
    let totalMortgageInterest = 0;
    let totalPropertyTax = 0;

    for (let i = 0; i < monthsToCalculate; i++) {
      const payment = schedule[i];
      totalMortgageInterest += payment.interestPayment;
      totalPropertyTax += payment.propertyTax;
    }

    // SALT deduction cap (State and Local Tax) - $10,000 annually
    const saltCap = 10000 * years;
    const deductiblePropertyTax = Math.min(totalPropertyTax, saltCap);
    
    const totalItemizedDeductions = totalMortgageInterest + deductiblePropertyTax;
    const totalStandardDeductions = standardDeduction * years;
    
    // Only beneficial if itemized deductions exceed standard deduction
    const beneficialDeductions = Math.max(0, totalItemizedDeductions - totalStandardDeductions);
    const totalTaxSavings = beneficialDeductions * taxBracket;
    
    const effectiveRate = totalTaxSavings / (totalMortgageInterest + totalPropertyTax);

    return {
      totalMortgageInterestDeduction: totalMortgageInterest,
      totalPropertyTaxDeduction: deductiblePropertyTax,
      totalTaxSavings,
      effectiveRate,
    };
  }

  /**
   * Calculate affordability based on income and debt ratios
   */
  static calculateAffordability(
    monthlyIncome: number,
    monthlyDebts: number,
    downPaymentAmount: number,
    interestRate: number,
    termYears: number,
    propertyTaxRate: number,
    insuranceRate: number = 0.0035,
    frontEndRatio: number = 0.28, // 28% front-end ratio
    backEndRatio: number = 0.36 // 36% back-end ratio
  ): {
    maxMonthlyPayment: number;
    maxLoanAmount: number;
    maxHomePrice: number;
    frontEndQualified: boolean;
    backEndQualified: boolean;
  } {
    const maxFrontEndPayment = monthlyIncome * frontEndRatio;
    const maxBackEndPayment = (monthlyIncome * backEndRatio) - monthlyDebts;
    const maxMonthlyPayment = Math.min(maxFrontEndPayment, maxBackEndPayment);

    // Estimate property tax and insurance as percentage of monthly payment
    const pitiRatio = 1 + (propertyTaxRate / 12) + (insuranceRate / 12);
    const maxPrincipalAndInterest = maxMonthlyPayment / pitiRatio;

    // Calculate maximum loan amount
    const monthlyRate = interestRate / 12;
    const numPayments = termYears * 12;
    
    let maxLoanAmount: number;
    if (monthlyRate === 0) {
      maxLoanAmount = maxPrincipalAndInterest * numPayments;
    } else {
      maxLoanAmount = maxPrincipalAndInterest * 
        (Math.pow(1 + monthlyRate, numPayments) - 1) /
        (monthlyRate * Math.pow(1 + monthlyRate, numPayments));
    }

    const maxHomePrice = maxLoanAmount + downPaymentAmount;

    return {
      maxMonthlyPayment,
      maxLoanAmount,
      maxHomePrice,
      frontEndQualified: maxFrontEndPayment >= maxMonthlyPayment,
      backEndQualified: maxBackEndPayment >= maxMonthlyPayment,
    };
  }

  /**
   * Calculate compound annual growth rate (CAGR)
   */
  static calculateCAGR(
    beginningValue: number,
    endingValue: number,
    years: number
  ): number {
    return (Math.pow(endingValue / beginningValue, 1 / years) - 1) * 100;
  }

  /**
   * Calculate present value of future cash flows
   */
  static calculatePresentValue(
    futureValue: number,
    discountRate: number,
    years: number
  ): number {
    return futureValue / Math.pow(1 + discountRate, years);
  }

  /**
   * Calculate future value with compound interest
   */
  static calculateFutureValue(
    presentValue: number,
    interestRate: number,
    years: number,
    compoundingFrequency: number = 1
  ): number {
    return presentValue * Math.pow(1 + (interestRate / compoundingFrequency), compoundingFrequency * years);
  }

  /**
   * Format currency values
   */
  static formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Format percentage values
   */
  static formatPercentage(value: number, decimals: number = 2): string {
    return `${value.toFixed(decimals)}%`;
  }
}
