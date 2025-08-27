// ===== UI MANAGER - CLEAN PRESENTATION LOGIC =====

class UIManager {
  constructor(appState, calculationEngine) {
    this.appState = appState;
    this.calculationEngine = calculationEngine;
  }

  // Format currency with proper scaling
  formatCurrency(amount) {
    const abs = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';
    if (abs >= 1e9) return sign + '$' + (abs/1e9).toFixed(1) + 'B';
    if (abs >= 1e6) return sign + '$' + (abs/1e6).toFixed(1) + 'M';
    if (abs >= 1e3) return sign + '$' + (abs/1e3).toFixed(0) + 'K';
    return sign + '$' + abs.toLocaleString();
  }

  // Update all UI elements
  updateAll() {
    const result = this.calculationEngine.compute();
    
    if (!result || result.error) {
      console.error('Computation error:', result?.error);
      return;
    }
    
    this.updateKPIs(result);
    this.updateChart();
    this.updateInsights(result);
  }

  // Update KPI cards
  updateKPIs(result) {
    const elements = {
      hodl: document.getElementById('kpi-hodl'),
      buy: document.getElementById('kpi-buy'),
      rent: document.getElementById('kpi-rent'),
      opportunity: document.getElementById('kpi-opportunity'),
      timing: document.getElementById('timing-label')
    };

    if (elements.hodl) elements.hodl.textContent = this.formatCurrency(result.holdAllValue);
    if (elements.buy) elements.buy.textContent = this.formatCurrency(result.buyHouseValue);
    if (elements.rent) elements.rent.textContent = this.formatCurrency(result.rentForeverValue);
    
    // Show opportunity cost of worst strategy
    const worstStrategy = this.calculationEngine.getWorstStrategy(result);
    const worstOpportunityCost = result.opportunityCosts[worstStrategy] || 0;
    if (elements.opportunity) {
      elements.opportunity.textContent = this.formatCurrency(-worstOpportunityCost);
    }
    
    // Update timing label
    const timingLabels = {
      'now': 'Now', 'year-1': 'Year 1', 'year-2': 'Year 2', 
      'year-3': 'Year 3', 'year-5': 'Year 5'
    };
    if (elements.timing) {
      elements.timing.textContent = timingLabels[this.appState.purchaseTiming] || 'Now';
    }
  }

  // Update chart
  updateChart() {
    const currentYear = new Date().getFullYear();
    const labels = Array.from({length: this.appState.years + 1}, (_, i) => currentYear + i);
    const yearIndices = Array.from({length: this.appState.years + 1}, (_, i) => i);

    // Get data for each year
    const hodlData = yearIndices.map(y => {
      const res = this.calculationEngine.compute(y);
      return res && isFinite(res.holdAllValue) ? res.holdAllValue : 0;
    });
    
    const buyData = yearIndices.map(y => {
      const res = this.calculationEngine.compute(y);
      return res && isFinite(res.buyHouseValue) ? res.buyHouseValue : 0;
    });
    
    const rentData = yearIndices.map(y => {
      const res = this.calculationEngine.compute(y);
      return res && isFinite(res.rentForeverValue) ? res.rentForeverValue : 0;
    });
    
    // Calculate opportunity cost data
    const opportunityData = yearIndices.map(y => {
      const res = this.calculationEngine.compute(y);
      if (!res || res.error) return 0;
      
      const values = [res.holdAllValue, res.buyHouseValue, res.rentForeverValue].filter(v => isFinite(v));
      if (values.length === 0) return 0;
      
      const maxValue = Math.max(...values);
      const minValue = Math.min(...values);
      return -(maxValue - minValue);
    });
    
    // Transform data based on view mode
    let transformedData = { hodl: hodlData, buy: buyData, rent: rentData, opportunity: opportunityData };
    
    if (this.appState.chart.view === 'relative') {
      transformedData.buy = buyData.map((v, i) => v - hodlData[i]);
      transformedData.rent = rentData.map((v, i) => v - hodlData[i]);
      transformedData.hodl = hodlData.map(() => 0);
      transformedData.opportunity = opportunityData;
    } else if (this.appState.chart.view === 'percentage') {
      const initial = { 
        hodl: hodlData[0] || 1, 
        buy: buyData[0] || 1, 
        rent: rentData[0] || 1 
      };
      transformedData.hodl = hodlData.map(v => ((v / initial.hodl) - 1) * 100);
      transformedData.buy = buyData.map(v => ((v / initial.buy) - 1) * 100);
      transformedData.rent = rentData.map(v => ((v / initial.rent) - 1) * 100);
      transformedData.opportunity = opportunityData.map(v => (v / initial.hodl) * 100);
    }
    
    const datasets = [
      { 
        label: 'Hold All Bitcoin', 
        data: transformedData.hodl, 
        borderColor: '#ed7611', 
        backgroundColor: 'rgba(237, 118, 17, 0.1)',
        hidden: !this.appState.chart.visibleSeries.hodl,
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 6,
        fill: false
      },
      { 
        label: 'Buy House + Remaining BTC', 
        data: transformedData.buy, 
        borderColor: '#10b981', 
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        hidden: !this.appState.chart.visibleSeries.buy,
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 6,
        fill: false
      },
      { 
        label: 'Rent Forever + Keep All BTC', 
        data: transformedData.rent, 
        borderColor: '#3b82f6', 
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        hidden: !this.appState.chart.visibleSeries.rent,
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 6,
        fill: false
      },
      { 
        label: 'Lost Opportunity (Worst Strategy)', 
        data: transformedData.opportunity, 
        borderColor: '#ef4444', 
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        hidden: !this.appState.chart.visibleSeries.opportunity,
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 6,
        fill: true,
        borderDash: [5, 5]
      }
    ];
    
    const ctx = document.getElementById('projection-chart');
    if (!ctx) {
      console.error('Chart canvas not found');
      return;
    }
    
    if (!this.appState.chart.instance) {
      this.appState.chart.instance = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          scales: {
            y: { 
              ticks: { 
                callback: v => this.appState.chart.view === 'percentage' ? `${v.toFixed(0)}%` : this.formatCurrency(v)
              },
              grid: { color: 'rgba(0,0,0,0.1)' }
            },
            x: { 
              title: { display: true, text: 'Year' },
              grid: { color: 'rgba(0,0,0,0.1)' }
            }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(255,255,255,0.95)',
              titleColor: '#000',
              bodyColor: '#000',
              borderColor: '#e5e7eb',
              borderWidth: 1,
              callbacks: {
                title: (items) => `${items[0].label}`,
                label: (ctx) => {
                  const value = ctx.parsed.y;
                  const suffix = this.appState.chart.view === 'percentage' ? '%' : '';
                  const prefix = this.appState.chart.view === 'relative' && value >= 0 ? '+' : '';
                  return `${ctx.dataset.label}: ${prefix}${this.appState.chart.view === 'percentage' ? value.toFixed(1) : this.formatCurrency(value)}${suffix}`;
                }
              }
            }
          }
        }
      });
    } else {
      this.appState.chart.instance.data.labels = labels;
      this.appState.chart.instance.data.datasets = datasets;
      this.appState.chart.instance.options.scales.y.ticks.callback = v => 
        this.appState.chart.view === 'percentage' ? `${v.toFixed(0)}%` : this.formatCurrency(v);
      this.appState.chart.instance.update('none');
    }
  }

  // Update insights
  updateInsights(result) {
    // Calculate key metrics
    const values = [
      { name: 'Hold All Bitcoin', value: result.holdAllValue, color: 'bitcoin' },
      { name: 'Buy House', value: result.buyHouseValue, color: 'green' },
      { name: 'Rent Forever', value: result.rentForeverValue, color: 'blue' }
    ];
    values.sort((a, b) => b.value - a.value);

    const best = values[0];
    const advantage = best.value - values[1].value;

    // Update key metrics elements
    const elements = {
      bestStrategy: document.getElementById('best-strategy'),
      bestAdvantage: document.getElementById('best-advantage'),
      insightModel: document.getElementById('insight-model'),
      insightYears: document.getElementById('insight-years'),
      insightsList: document.getElementById('insights-list'),
      assumptionDown: document.getElementById('assumption-down'),
      assumptionRate: document.getElementById('assumption-rate'),
      assumptionAppreciation: document.getElementById('assumption-appreciation'),
      assumptionRent: document.getElementById('assumption-rent')
    };
    
    if (elements.bestStrategy) elements.bestStrategy.textContent = best.name;
    if (elements.bestAdvantage) elements.bestAdvantage.textContent = `+${this.formatCurrency(advantage)} advantage`;
    if (elements.insightModel) elements.insightModel.textContent = this.appState.model;
    if (elements.insightYears) elements.insightYears.textContent = this.appState.years;

    // Generate insights
    const insights = this.generateInsights(result);
    if (elements.insightsList) {
      elements.insightsList.innerHTML = insights.map(i =>
        `<li class="flex items-start gap-2"><div class="w-1.5 h-1.5 bg-bitcoin-500 rounded-full mt-2 flex-shrink-0"></div><span>${i}</span></li>`
      ).join('');
    }

    // Update assumptions
    if (elements.assumptionDown) elements.assumptionDown.textContent = `${(this.appState.prefs.downPct * 100).toFixed(0)}%`;
    if (elements.assumptionRate) elements.assumptionRate.textContent = `${(this.appState.prefs.rate * 100).toFixed(1)}%`;
    if (elements.assumptionAppreciation) elements.assumptionAppreciation.textContent = `${(this.appState.prefs.appreciation * 100).toFixed(1)}%`;
    if (elements.assumptionRent) elements.assumptionRent.textContent = this.formatCurrency(this.appState.prefs.rent);
  }

  // Generate insights
  generateInsights(result) {
    const insights = [];
    const timingLabels = {
      'now': 'immediately', 'year-1': 'in year 1', 'year-2': 'in year 2',
      'year-3': 'in year 3', 'year-5': 'in year 5'
    };
    const timing = timingLabels[this.appState.purchaseTiming] || 'now';

    // Strategy comparison
    const strategies = [
      { name: 'Hold All Bitcoin', value: result.holdAllValue },
      { name: 'Buy House', value: result.buyHouseValue },
      { name: 'Rent Forever', value: result.rentForeverValue }
    ].sort((a, b) => b.value - a.value);

    const best = strategies[0];
    const worst = strategies[2];
    const advantage = best.value - worst.value;

    insights.push(`${best.name} is the optimal strategy, outperforming ${worst.name} by ${this.formatCurrency(advantage)} over ${this.appState.years} years.`);

    // Tax implications
    if (result.taxOwed > 0) {
      insights.push(`Capital gains tax of ${this.formatCurrency(result.taxOwed)} reduces Bitcoin available for down payment.`);
    }

    // DCA impact
    if (result.dcaBtcAccumulated > 0) {
      const dcaValue = result.dcaBtcAccumulated * BitcoinModels.getPrice(this.appState.model, this.appState.years, this.appState.btcPrice, this.appState.prefs.modelConfidence);
      insights.push(`DCA strategy accumulates ${result.dcaBtcAccumulated.toFixed(3)} BTC worth ${this.formatCurrency(dcaValue)} at end.`);
    }

    // Model context
    const projectedPrice = BitcoinModels.getPrice(this.appState.model, this.appState.years, this.appState.btcPrice, this.appState.prefs.modelConfidence);
    insights.push(`Under ${this.appState.model} model, Bitcoin could reach ${this.formatCurrency(projectedPrice)} per coin ${timing}.`);

    // Risk consideration
    if (result.holdAllValue > result.buyHouseValue * 1.5) {
      insights.push(`Bitcoin strategy shows high upside but carries volatility risk vs real estate stability.`);
    }

    return insights;
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { UIManager };
}
