export interface MortgageInput {
  principal: number; // loan amount
  annualRate: number; // e.g., 0.065
  termYears: number; // e.g., 30
}

export function monthlyPayment({ principal, annualRate, termYears }: MortgageInput) {
  const r = annualRate / 12;
  const n = termYears * 12;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

