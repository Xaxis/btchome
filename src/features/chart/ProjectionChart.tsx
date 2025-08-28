import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { runScenario } from '../../domain/calc/scenarioEngine';
import { useStore } from '../../state/store';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip);

export default function ProjectionChart() {
  const theme = useStore((st) => st.theme);
  const timeframeYears = useStore((st) => st.timeframeYears);
  const btcPrice = useStore((st) => st.btcPrice);
  const btcAmount = useStore((st) => st.btcAmount);
  const model = useStore((st) => st.model);
  const modelConfidence = useStore((st) => st.modelConfidence);
  const chartView = useStore((st) => st.chartView);
  const visibleSeries = useStore((st) => st.visibleSeries);
  const dcaAmount = useStore((st) => st.dcaAmount);
  const dcaPeriod = useStore((st) => st.dcaPeriod);
  const capGainsTaxRate = useStore((st) => st.capGainsTaxRate);
  const homePrice = useStore((st) => st.homePrice);
  const downPct = useStore((st) => st.downPct);
  const mortgageRate = useStore((st) => st.mortgageRate);
  const term = useStore((st) => st.term);
  const propertyTaxRate = useStore((st) => st.propertyTaxRate);
  const insuranceAnnual = useStore((st) => st.insuranceAnnual);
  const hoaMonthly = useStore((st) => st.hoaMonthly);
  const appreciationRate = useStore((st) => st.appreciationRate);
  const maintenanceRate = useStore((st) => st.maintenanceRate);
  const closingCostsPct = useStore((st) => st.closingCostsPct);
  const monthlyRent = useStore((st) => st.monthlyRent);
  const rentGrowthRate = useStore((st) => st.rentGrowthRate);
  const rentersInsuranceAnnual = useStore((st) => st.rentersInsuranceAnnual);
  const movingFrequencyYears = useStore((st) => st.movingFrequencyYears);
  const movingCostPerMove = useStore((st) => st.movingCostPerMove);
  const purchaseTiming = useStore((st) => st.purchaseTiming);

  const data = useMemo(() => {
    const res = runScenario({
      years: timeframeYears,
      btcPrice: btcPrice,
      btcAmount: btcAmount,
      model: model,
      modelConfidence: modelConfidence,
      dcaAmount: dcaAmount,
      dcaPeriod: dcaPeriod,
      capGainsTaxRate: capGainsTaxRate,
      // Home
      homePrice: homePrice,
      downPct: downPct,
      mortgageRate: mortgageRate,
      term: term,
      propertyTaxRate: propertyTaxRate,
      insuranceAnnual: insuranceAnnual,
      hoaMonthly: hoaMonthly,
      appreciationRate: appreciationRate,
      maintenanceRate: maintenanceRate,
      closingCostsPct: closingCostsPct,
      // Rent
      monthlyRent: monthlyRent,
      rentGrowthRate: rentGrowthRate,
      rentersInsuranceAnnual: rentersInsuranceAnnual,
      movingFrequencyYears: movingFrequencyYears,
      movingCostPerMove: movingCostPerMove,
      // Timing
      purchaseTiming: purchaseTiming,
    });

    // Views
    let hodl = res.holdAllValue;
    let buy = res.buyHouseValue;
    let rent = res.rentForeverValue;
    if (chartView === 'relative') {
      hodl = hodl.map((v, i) => 0);
      buy = buy.map((v, i) => v - res.holdAllValue[i]);
      rent = rent.map((v, i) => v - res.holdAllValue[i]);
    } else if (chartView === 'percentage') {
      const baseH = res.holdAllValue[0] || 1;
      const baseB = res.buyHouseValue[0] || 1;
      const baseR = res.rentForeverValue[0] || 1;
      hodl = res.holdAllValue.map((v) => ((v - baseH) / baseH) * 100);
      buy = res.buyHouseValue.map((v) => ((v - baseB) / baseB) * 100);
      rent = res.rentForeverValue.map((v) => ((v - baseR) / baseR) * 100);
    }

    const datasets = [
      visibleSeries.hodl && {
        label: 'Hold All', data: hodl, borderColor: getCssVar('--chart-hodl'), borderWidth: 2, pointRadius: 0, tension: 0.3,
      },
      visibleSeries.buy && {
        label: 'Buy House', data: buy, borderColor: getCssVar('--chart-buy'), borderWidth: 2, pointRadius: 0, tension: 0.3,
      },
      visibleSeries.rent && {
        label: 'Rent Forever', data: rent, borderColor: getCssVar('--chart-rent'), borderWidth: 2, pointRadius: 0, tension: 0.3,
      },
      visibleSeries.opportunity && {
        label: 'Opportunity Cost', data: res.opportunityCostSeries, borderColor: getCssVar('--chart-opportunity'), borderWidth: 2, pointRadius: 0, borderDash: [6,6], tension: 0.3,
      },
    ].filter(Boolean) as any[];

    return { labels: res.yearsLabels, datasets };
  }, [
    timeframeYears,
    btcPrice,
    btcAmount,
    model,
    modelConfidence,
    dcaAmount,
    dcaPeriod,
    capGainsTaxRate,
    homePrice,
    downPct,
    mortgageRate,
    term,
    propertyTaxRate,
    insuranceAnnual,
    hoaMonthly,
    appreciationRate,
    maintenanceRate,
    closingCostsPct,
    monthlyRent,
    rentGrowthRate,
    rentersInsuranceAnnual,
    movingFrequencyYears,
    movingCostPerMove,
    purchaseTiming,
    chartView,
    visibleSeries,
  ]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        labels: {
          color: getCssVar('--text-muted'),
          font: {
            family: 'InterVariable, Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial',
            size: 12,
            weight: '500'
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'line',
        },
        position: 'top' as const,
      },
      tooltip: {
        backgroundColor: getCssVar('--surface-3'),
        titleColor: getCssVar('--text-primary'),
        bodyColor: getCssVar('--text-secondary'),
        borderColor: getCssVar('--border'),
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        titleFont: {
          family: 'InterVariable, Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial',
          size: 13,
          weight: '600'
        },
        bodyFont: {
          family: 'InterVariable, Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial',
          size: 12,
          weight: '400'
        },
        callbacks: {
          label: (ctx: any) => `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`,
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: getCssVar('--text-muted'),
          font: {
            family: 'InterVariable, Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial',
            size: 11,
            weight: '400'
          }
        },
        grid: {
          color: getCssVar('--gridline'),
          lineWidth: 1,
        },
        border: { color: getCssVar('--border') },
        title: {
          display: true,
          text: 'Year',
          color: getCssVar('--text-muted'),
          font: {
            family: 'InterVariable, Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial',
            size: 12,
            weight: '500'
          }
        }
      },
      y: {
        ticks: {
          color: getCssVar('--text-muted'),
          font: {
            family: 'InterVariable, Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial',
            size: 11,
            weight: '400'
          },
          callback: function(value: any) {
            return formatCurrency(value);
          }
        },
        grid: {
          color: getCssVar('--gridline'),
          lineWidth: 1,
        },
        border: { color: getCssVar('--border') },
        title: {
          display: true,
          text: 'Net Worth (USD)',
          color: getCssVar('--text-muted'),
          font: {
            family: 'InterVariable, Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial',
            size: 12,
            weight: '500'
          }
        }
      }
    }
  }), [theme]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-primary">Strategy Comparison</h3>
        <div className="text-sm text-muted">
          {timeframeYears} year projection using {model.replace('-', ' ')} model
        </div>
      </div>
      <div className="h-96 relative">
        <Line data={data} options={options as any} />
      </div>
    </div>
  );
}

function getCssVar(name: string) {
  if (typeof window === 'undefined') return '#8884d8';
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#8884d8';
}

function formatCurrency(v: number) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(v);
  } catch {
    // Fallback formatting
    const absV = Math.abs(v);
    const sign = v < 0 ? '-' : '';
    if (absV >= 1e9) return `${sign}$${(absV/1e9).toFixed(1)}B`;
    if (absV >= 1e6) return `${sign}$${(absV/1e6).toFixed(1)}M`;
    if (absV >= 1e3) return `${sign}$${(absV/1e3).toFixed(1)}K`;
    return `${sign}$${absV.toFixed(0)}`;
  }
}

