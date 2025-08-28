export function totalRentPaid(years: number, monthlyRent: number, annualGrowth: number) {
  let total = 0;
  let current = monthlyRent;
  for (let y = 0; y < years; y++) {
    total += current * 12;
    current *= 1 + annualGrowth;
  }
  return total;
}

