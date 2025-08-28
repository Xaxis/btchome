export type DcaPeriod = 52 | 12 | 4; // weekly, monthly, quarterly

export function periodsPerYear(key: 'weekly' | 'monthly' | 'quarterly'): DcaPeriod {
  return key === 'weekly' ? 52 : key === 'monthly' ? 12 : 4;
}

export function accumulateDcaBtc(
  years: number,
  dcaAmountUSD: number,
  periodKey: 'weekly' | 'monthly' | 'quarterly',
  priceAt: (yearIndex: number, periodIndex: number) => number
) {
  const perYear = periodsPerYear(periodKey);
  let totalBtc = 0;
  for (let y = 0; y < years; y++) {
    for (let p = 0; p < perYear; p++) {
      const price = priceAt(y, p);
      if (price > 0) totalBtc += dcaAmountUSD / price;
    }
  }
  return totalBtc;
}

