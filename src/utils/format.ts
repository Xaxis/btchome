export function formatCurrencyCompact(value: number, currency: string = 'USD'): string {
  // Handle edge cases
  if (!Number.isFinite(value)) {
    return value > 0 ? '+∞' : value < 0 ? '-∞' : '—';
  }

  const absValue = Math.abs(value);

  try {
    // For very large numbers, use custom formatting to prevent overflow
    if (absValue >= 1e15) {
      const quadrillions = value / 1e15;
      return `${value < 0 ? '-' : ''}$${quadrillions.toFixed(1)}Q`;
    }

    // Use Intl.NumberFormat for standard ranges
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: absValue >= 1000 ? 1 : 2,
      minimumFractionDigits: 0,
    }).format(value);
  } catch {
    // Fallback for unsupported browsers or edge cases
    return formatCurrencyFallback(value);
  }
}

export function formatCurrencyFull(value: number, currency: string = 'USD'): string {
  if (!Number.isFinite(value)) {
    return value > 0 ? '+∞' : value < 0 ? '-∞' : '—';
  }

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return formatCurrencyFallback(value);
  }
}

export function formatPercentage(value: number, decimals: number = 1): string {
  if (!Number.isFinite(value)) {
    return '—';
  }

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  } catch {
    return `${(value * 100).toFixed(decimals)}%`;
  }
}

export function formatNumber(value: number, decimals: number = 0): string {
  if (!Number.isFinite(value)) {
    return '—';
  }

  try {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  } catch {
    return value.toFixed(decimals);
  }
}

export function formatBTC(value: number, decimals: number = 4): string {
  if (!Number.isFinite(value)) {
    return '—';
  }

  const formatted = formatNumber(value, decimals);
  return `${formatted} BTC`;
}

// Responsive formatting based on screen size
export function formatCurrencyResponsive(value: number, screenSize: 'sm' | 'md' | 'lg' = 'lg'): string {
  if (!Number.isFinite(value)) {
    return value > 0 ? '+∞' : value < 0 ? '-∞' : '—';
  }

  const absValue = Math.abs(value);

  // For small screens, be more aggressive with compacting
  if (screenSize === 'sm') {
    if (absValue >= 1e6) {
      return formatCurrencyCompact(value);
    } else if (absValue >= 1000) {
      const thousands = value / 1000;
      return `$${thousands.toFixed(0)}k`;
    }
  }

  // For medium screens, moderate compacting
  if (screenSize === 'md') {
    if (absValue >= 1e6) {
      return formatCurrencyCompact(value);
    }
  }

  // For large screens or smaller values, show more detail
  return formatCurrencyFull(value);
}

function formatCurrencyFallback(value: number): string {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 1e12) {
    return `${sign}$${(absValue / 1e12).toFixed(1)}T`;
  } else if (absValue >= 1e9) {
    return `${sign}$${(absValue / 1e9).toFixed(1)}B`;
  } else if (absValue >= 1e6) {
    return `${sign}$${(absValue / 1e6).toFixed(1)}M`;
  } else if (absValue >= 1e3) {
    return `${sign}$${(absValue / 1e3).toFixed(1)}K`;
  } else {
    return `${sign}$${absValue.toFixed(0)}`;
  }
}

