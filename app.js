document.addEventListener('DOMContentLoaded', () => {
  // ================= STATE & CONSTANTS =================
  let currentTheme = localStorage.getItem('theme') || 'dark';
  let fvChartInstance = null;
  let npvChartInstance = null;

  // DOM Elements
  const themeToggle = document.getElementById('themeToggle');
  const sunIcon = themeToggle.querySelector('.sun-icon');
  const moonIcon = themeToggle.querySelector('.moon-icon');

  // EMI DOM Elements
  const emiAmountInput = document.getElementById('emiAmount');
  const emiComfortableInput = document.getElementById('emiComfortable');
  const emiRateInput = document.getElementById('emiRate');
  const emiTenureInput = document.getElementById('emiTenure');
  const emiResultValue = document.getElementById('emiResultValue');
  const emiResultLabel = document.getElementById('emiResultLabel');
  const emiBreakdownPrincipal = document.getElementById('emiBreakdownPrincipal');
  const emiBreakdownInterest = document.getElementById('emiBreakdownInterest');
  const emiBreakdownTotal = document.getElementById('emiBreakdownTotal');
  
  const groupEmiAmount = document.getElementById('groupEmiAmount');
  const groupComfortableEmi = document.getElementById('groupComfortableEmi');
  const emiModeInputs = document.querySelectorAll('input[name="emiMode"]');
  
  const lblBreakdownPrincipal = document.getElementById('lblBreakdownPrincipal');
  const lblBreakdownInterest = document.getElementById('lblBreakdownInterest');
  const lblBreakdownTotal = document.getElementById('lblBreakdownTotal');
  let emiChartInstance = null;

  // FV DOM Elements
  const fvForm = document.getElementById('fvForm');
  const fvPvInput = document.getElementById('fvPv');
  const fvPmtInput = document.getElementById('fvPmt');
  const fvPmtGrowthInput = document.getElementById('fvPmtGrowth');
  const fvPmtFrequency = document.getElementById('fvPmtFrequency');
  const fvPmtTiming = document.getElementById('fvPmtTiming');
  const fvRateInput = document.getElementById('fvRate');
  const fvCompounding = document.getElementById('fvCompounding');
  const fvYearsInput = document.getElementById('fvYears');

  const fvResultValue = document.getElementById('fvResultValue');
  const fvBreakdownPv = document.getElementById('fvBreakdownPv');
  const fvBreakdownContributions = document.getElementById('fvBreakdownContributions');
  const fvBreakdownInterest = document.getElementById('fvBreakdownInterest');

  // NPV DOM Elements
  const npvForm = document.getElementById('npvForm');
  const npvRateInput = document.getElementById('npvRate');
  const npvInitialOutlayInput = document.getElementById('npvInitialOutlay');
  const btnAddCashFlow = document.getElementById('btnAddCashFlow');
  const cashFlowRowsContainer = document.getElementById('cashFlowRows');

  const npvResultValue = document.getElementById('npvResultValue');
  const npvStatusBadge = document.getElementById('npvStatusBadge');
  const metricIrr = document.getElementById('metricIrr');
  const metricPi = document.getElementById('metricPi');
  const metricPayback = document.getElementById('metricPayback');
  const metricDiscountedPayback = document.getElementById('metricDiscountedPayback');

  // ================= INITIALIZATION =================
  // Apply initial theme
  document.body.setAttribute('data-theme', currentTheme);
  updateThemeUi();

  // Load default Cash Flow rows for NPV (4 years by default)
  const defaultCashFlows = [
    { inflow: 3000, outflow: 0 },
    { inflow: 4000, outflow: 500 },
    { inflow: 5000, outflow: 1000 },
    { inflow: 6000, outflow: 1000 }
  ];
  defaultCashFlows.forEach((item, idx) => {
    addCashFlowRow(idx + 1, item.inflow, item.outflow);
  });

  // Perform initial calculations
  calculateFV();
  calculateNPV();
  calculateEMI();

  // ================= THEME TOGGLE =================
  themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeUi();
    
    // Redraw charts with new theme colors
    calculateFV();
    calculateNPV();
    calculateEMI();
  });

  function updateThemeUi() {
    if (currentTheme === 'light') {
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
    } else {
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
    }
  }

  // Get theme-specific chart options
  function getChartThemeColors() {
    const isLight = currentTheme === 'light';
    return {
      textColor: isLight ? '#475569' : '#94a3b8',
      gridColor: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
      tooltipBg: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 22, 36, 0.95)',
      tooltipBorder: isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
      tooltipText: isLight ? '#0f172a' : '#f8fafc'
    };
  }

  // ================= TAB NAVIGATION =================
  const tabButtons = document.querySelectorAll('.tab-navigation .tab-btn');
  const tabContents = document.querySelectorAll('.workspace-content .tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });

  // ================= FAQ ACCORDION LOGIC =================
  const faqHeaders = document.querySelectorAll('.faq-header');
  faqHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const faqItem = header.parentElement;
      const isActive = faqItem.classList.contains('active');
      
      // Close all other FAQ items
      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
        item.querySelector('.faq-answer').style.maxHeight = null;
      });
      
      if (!isActive) {
        faqItem.classList.add('active');
        const answer = faqItem.querySelector('.faq-answer');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  function switchTab(tabId) {
    tabButtons.forEach(btn => {
      if (btn.getAttribute('data-tab') === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    tabContents.forEach(content => {
      if (content.id === tabId) {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }
    });

    // Run tab-specific calculations if applicable
    if (tabId === 'fv-tab') {
      calculateFV();
    } else if (tabId === 'npv-tab') {
      calculateNPV();
    } else if (tabId === 'emi-tab') {
      calculateEMI();
    }
  }

  // ================= FV CALCULATIONS =================
  // Event listeners for FV input updates
  [fvPvInput, fvPmtInput, fvPmtGrowthInput, fvPmtFrequency, fvPmtTiming, fvRateInput, fvCompounding, fvYearsInput].forEach(element => {
    element.addEventListener('input', calculateFV);
  });

  function calculateFV() {
    const pv = parseFloat(fvPvInput.value) || 0;
    const pmt = parseFloat(fvPmtInput.value) || 0;
    const annualPmtGrowth = (parseFloat(fvPmtGrowthInput.value) || 0) / 100;
    const annualRate = (parseFloat(fvRateInput.value) || 0) / 100;
    const pmtFreq = parseInt(fvPmtFrequency.value) || 1;
    const timing = fvPmtTiming.value; // 'beginning' or 'end'
    const compFreq = parseInt(fvCompounding.value) || 1;
    const years = parseInt(fvYearsInput.value) || 1;

    // Rate calculations
    // Effective Annual Rate (EAR) = (1 + r/k)^k - 1
    const ear = Math.pow(1 + annualRate / compFreq, compFreq) - 1;
    // Rate per payment period: i = (1 + EAR)^(1/m) - 1
    const i = Math.pow(1 + ear, 1 / pmtFreq) - 1;
    
    const totalPeriods = years * pmtFreq;

    // 1. Calculate future value year-by-year using period-by-period simulation
    const yearsArray = [];
    const principalData = [];
    const contributionsData = [];
    const interestData = [];

    let balance = pv;
    let accumulatedContributions = 0;

    for (let period = 1; period <= totalPeriods; period++) {
      const yearIndex = Math.floor((period - 1) / pmtFreq);
      // Contribution increases annually
      const currentPmt = pmt * Math.pow(1 + annualPmtGrowth, yearIndex);

      if (timing === 'beginning') {
        balance = (balance + currentPmt) * (1 + i);
      } else {
        balance = balance * (1 + i) + currentPmt;
      }
      accumulatedContributions += currentPmt;

      // Record at the end of each year
      if (period % pmtFreq === 0) {
        const currentYear = period / pmtFreq;
        yearsArray.push(`Year ${currentYear}`);
        principalData.push(pv);
        contributionsData.push(accumulatedContributions);
        
        const interest_t = Math.max(0, balance - pv - accumulatedContributions);
        interestData.push(interest_t);
      }
    }

    const totalVal = balance;
    const totalInterest = Math.max(0, totalVal - pv - accumulatedContributions);

    // Update UI Cards
    fvResultValue.textContent = formatCurrency(totalVal);
    fvBreakdownPv.textContent = formatCurrency(pv);
    fvBreakdownContributions.textContent = formatCurrency(accumulatedContributions);
    fvBreakdownInterest.textContent = formatCurrency(totalInterest);

    // Update Stacked Bar Chart
    renderFvChart(yearsArray, principalData, contributionsData, interestData);
  }

  function renderFvChart(labels, principal, contributions, interest) {
    const ctx = document.getElementById('fvChart').getContext('2d');
    const colors = getChartThemeColors();

    if (fvChartInstance) {
      fvChartInstance.destroy();
    }

    fvChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Initial Principal',
            data: principal,
            backgroundColor: '#0d9488', // Deep Teal
            stack: 'Stack 0',
            borderRadius: 4
          },
          {
            label: 'Total Contributions',
            data: contributions,
            backgroundColor: '#6366f1', // Indigo
            stack: 'Stack 0',
            borderRadius: 4
          },
          {
            label: 'Accumulated Interest',
            data: interest,
            backgroundColor: '#10b981', // Emerald
            stack: 'Stack 0',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false // We use our custom HTML breakdown legend
          },
          tooltip: {
            backgroundColor: colors.tooltipBg,
            titleColor: colors.tooltipText,
            bodyColor: colors.tooltipText,
            borderColor: colors.tooltipBorder,
            borderWidth: 1,
            padding: 10,
            displayColors: true,
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += formatCurrency(context.parsed.y);
                }
                return label;
              },
              footer: function(tooltipItems) {
                let sum = 0;
                tooltipItems.forEach(function(tooltipItem) {
                  sum += tooltipItem.parsed.y;
                });
                return 'Total Value: ' + formatCurrency(sum);
              },
              footerColor: colors.tooltipText
            }
          }
        },
        scales: {
          x: {
            stacked: true,
            grid: {
              display: false
            },
            ticks: {
              color: colors.textColor,
              font: {
                family: 'Inter',
                size: 11
              }
            }
          },
          y: {
            stacked: true,
            grid: {
              color: colors.gridColor
            },
            ticks: {
              color: colors.textColor,
              font: {
                family: 'Inter',
                size: 11
              },
              callback: function(value) {
                return '₹' + value.toLocaleString('en-IN', { maximumFractionDigits: 0 });
              }
            }
          }
        }
      }
    });
  }

  // ================= NPV CALCULATIONS =================
  // Event listeners for main inputs
  npvRateInput.addEventListener('input', calculateNPV);
  npvInitialOutlayInput.addEventListener('input', calculateNPV);

  // Add Cash Flow row handler
  btnAddCashFlow.addEventListener('click', () => {
    const rowCount = cashFlowRowsContainer.children.length;
    let defaultInflow = 1000;
    let defaultOutflow = 0;
    if (rowCount > 0) {
      const lastRow = cashFlowRowsContainer.lastElementChild;
      const lastInflow = lastRow.querySelector('.cashflow-inflow');
      const lastOutflow = lastRow.querySelector('.cashflow-outflow');
      if (lastInflow && !isNaN(parseFloat(lastInflow.value))) {
        defaultInflow = parseFloat(lastInflow.value);
      }
      if (lastOutflow && !isNaN(parseFloat(lastOutflow.value))) {
        defaultOutflow = parseFloat(lastOutflow.value);
      }
    }
    addCashFlowRow(rowCount + 1, defaultInflow, defaultOutflow);
    calculateNPV();
    // Scroll dynamic list to bottom to reveal new entry
    const container = document.querySelector('.cashflow-table-container');
    container.scrollTop = container.scrollHeight;
  });

  function addCashFlowRow(yearNum, inflow = 1000, outflow = 0) {
    const tr = document.createElement('tr');
    tr.dataset.year = yearNum;
    
    const net = inflow - outflow;
    
    tr.innerHTML = `
      <td>Year <span class="year-index">${yearNum}</span></td>
      <td>
        <input type="number" step="any" class="cashflow-inflow" value="${inflow}" required>
      </td>
      <td>
        <input type="number" step="any" class="cashflow-outflow" value="${outflow}" required>
      </td>
      <td>
        <span class="cashflow-net" style="font-weight:600; color:var(--primary);">${formatCurrency(net)}</span>
      </td>
      <td>
        <button type="button" class="btn-icon-only btn-remove" aria-label="Remove Year">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </td>
    `;

    const inflowInput = tr.querySelector('.cashflow-inflow');
    const outflowInput = tr.querySelector('.cashflow-outflow');
    const netSpan = tr.querySelector('.cashflow-net');

    function updateNet() {
      const inf = parseFloat(inflowInput.value) || 0;
      const outf = parseFloat(outflowInput.value) || 0;
      const netVal = inf - outf;
      netSpan.textContent = formatCurrency(netVal);
      if (netVal < 0) {
        netSpan.style.color = 'var(--danger)';
      } else {
        netSpan.style.color = 'var(--primary)';
      }
    }

    inflowInput.addEventListener('input', () => {
      updateNet();
      calculateNPV();
    });

    outflowInput.addEventListener('input', () => {
      updateNet();
      calculateNPV();
    });

    // Remove row listener
    tr.querySelector('.btn-remove').addEventListener('click', () => {
      tr.remove();
      reindexCashFlowRows();
      calculateNPV();
    });

    cashFlowRowsContainer.appendChild(tr);
    updateNet();
  }

  function reindexCashFlowRows() {
    const rows = cashFlowRowsContainer.querySelectorAll('tr');
    rows.forEach((row, index) => {
      const year = index + 1;
      row.dataset.year = year;
      row.querySelector('.year-index').textContent = year;
    });
  }

  function getCashFlowDetails() {
    const rows = cashFlowRowsContainer.querySelectorAll('tr');
    const flows = [];
    rows.forEach(row => {
      const inflow = parseFloat(row.querySelector('.cashflow-inflow').value) || 0;
      const outflow = parseFloat(row.querySelector('.cashflow-outflow').value) || 0;
      flows.push({
        inflow: inflow,
        outflow: outflow,
        net: inflow - outflow
      });
    });
    return flows;
  }

  function calculateNPV() {
    const discountRate = (parseFloat(npvRateInput.value) || 0) / 100;
    const initialOutlay = parseFloat(npvInitialOutlayInput.value) || 0;
    const cashFlowDetails = getCashFlowDetails();
    const futureCashFlows = cashFlowDetails.map(f => f.net);

    // 1. Calculate NPV
    // NPV = -CF0 + Sum( CF_t / (1+r)^t )
    let npvSum = 0;
    const inflowChartData = [0];
    const outflowChartData = [-initialOutlay];
    const pvChartData = [-initialOutlay];
    const cumulativeNpvData = [-initialOutlay];
    
    // Year 0 details
    const labels = ['Year 0'];

    let cumulativeNpv = -initialOutlay;

    cashFlowDetails.forEach((cf, index) => {
      const year = index + 1;
      labels.push(`Year ${year}`);
      
      const pv = cf.net / Math.pow(1 + discountRate, year);
      npvSum += pv;
      
      inflowChartData.push(cf.inflow);
      outflowChartData.push(-cf.outflow); // represented as negative outflow on chart
      pvChartData.push(pv);

      cumulativeNpv += pv;
      cumulativeNpvData.push(cumulativeNpv);
    });

    const finalNpv = npvSum - initialOutlay;

    // 2. Update NPV Displays
    npvResultValue.textContent = formatCurrency(finalNpv);
    if (finalNpv >= 0) {
      npvStatusBadge.textContent = 'Profitable';
      npvStatusBadge.className = 'status-badge positive';
      npvResultValue.style.textShadow = '0 4px 12px rgba(16, 185, 129, 0.2)';
    } else {
      npvStatusBadge.textContent = 'Unprofitable';
      npvStatusBadge.className = 'status-badge negative';
      npvResultValue.style.textShadow = '0 4px 12px rgba(244, 63, 94, 0.2)';
    }

    // 3. IRR Solver (Initial Outlay at t=0 is treated as negative)
    const irrFlows = [-initialOutlay, ...futureCashFlows];
    const irr = solveIRR(irrFlows);
    if (irr !== null && !isNaN(irr)) {
      metricIrr.textContent = (irr * 100).toFixed(2) + '%';
    } else {
      metricIrr.textContent = 'N/A';
    }

    // 4. Profitability Index (PI)
    // PI = (Sum(PV of Future Cash Flows)) / Initial Outlay
    if (initialOutlay > 0) {
      const pi = npvSum / initialOutlay;
      metricPi.textContent = pi.toFixed(3);
    } else {
      metricPi.textContent = 'N/A';
    }

    // 5. Payback & Discounted Payback Periods
    const payback = calculatePayback(initialOutlay, futureCashFlows, false);
    const discountedPayback = calculatePayback(initialOutlay, futureCashFlows, true, discountRate);

    metricPayback.textContent = formatPayback(payback);
    metricDiscountedPayback.textContent = formatPayback(discountedPayback);

    // 6. Draw NPV Chart
    renderNpvChart(labels, inflowChartData, outflowChartData, pvChartData, cumulativeNpvData);
  }

  function calculatePayback(initialOutlay, cashFlows, isDiscounted, discountRate = 0) {
    if (initialOutlay === 0) return 0;
    if (cashFlows.length === 0) return null;

    let cumulative = -initialOutlay;
    let lastNegativeYear = -1;

    for (let t = 0; t < cashFlows.length; t++) {
      const flow = isDiscounted ? (cashFlows[t] / Math.pow(1 + discountRate, t + 1)) : cashFlows[t];
      
      const nextCumulative = cumulative + flow;
      if (cumulative < 0 && nextCumulative >= 0) {
        // Crosses zero during year t+1
        const portion = Math.abs(cumulative) / flow;
        return t + portion; // t is 0-indexed, represents end of year t (which is t) + portion
      }
      cumulative = nextCumulative;
      if (cumulative < 0) {
        lastNegativeYear = t + 1;
      }
    }

    // If cumulative never reaches 0
    return null;
  }

  function formatPayback(val) {
    if (val === null) return 'Never';
    if (val === 0) return 'Immediate';
    return val.toFixed(2) + ' Yrs';
  }

  // IRR solver using Newton-Raphson with Secant/Bisection Fallback
  function solveIRR(cashFlows) {
    let positive = 0;
    let negative = 0;
    for (let val of cashFlows) {
      if (val > 0) positive++;
      if (val < 0) negative++;
    }
    if (positive === 0 || negative === 0) return null;

    let guess = 0.1;
    const maxIterations = 100;
    const precision = 1e-7;

    for (let i = 0; i < maxIterations; i++) {
      let npv = 0;
      let dNpv = 0; // derivative
      for (let t = 0; t < cashFlows.length; t++) {
        npv += cashFlows[t] / Math.pow(1 + guess, t);
        dNpv -= t * cashFlows[t] / Math.pow(1 + guess, t + 1);
      }
      
      if (Math.abs(dNpv) < 1e-12) break; // Avoid division by zero
      
      let nextGuess = guess - npv / dNpv;
      if (Math.abs(nextGuess - guess) < precision) {
        return nextGuess;
      }
      guess = nextGuess;
      if (guess < -0.99) guess = -0.95; // bound check
      if (guess > 50) guess = 5;
    }

    // Bisection Fallback
    let low = -0.99;
    let high = 5.0;
    
    // Test borders
    let npvLow = calcNpvForIrr(low, cashFlows);
    let npvHigh = calcNpvForIrr(high, cashFlows);
    if (npvLow * npvHigh > 0) {
      // Sign changes not captured in low/high range, check wider bounds
      high = 50.0;
      npvHigh = calcNpvForIrr(high, cashFlows);
      if (npvLow * npvHigh > 0) return null; // No root in search space
    }

    for (let i = 0; i < 100; i++) {
      let mid = (low + high) / 2;
      let npvMid = calcNpvForIrr(mid, cashFlows);

      if (Math.abs(npvMid) < precision) return mid;

      if (npvLow * npvMid < 0) {
        high = mid;
        npvHigh = npvMid;
      } else {
        low = mid;
        npvLow = npvMid;
      }
    }
    return (low + high) / 2;
  }

  function calcNpvForIrr(rate, cashFlows) {
    let sum = 0;
    for (let t = 0; t < cashFlows.length; t++) {
      sum += cashFlows[t] / Math.pow(1 + rate, t);
    }
    return sum;
  }

  // NPV Dual Axis Chart (Bars: Nominal Inflow, Outflow, Net PV, Line: Cumulative NPV)
  function renderNpvChart(labels, inflows, outflows, pvFlows, cumulativeNpv) {
    const ctx = document.getElementById('npvChart').getContext('2d');
    const colors = getChartThemeColors();

    if (npvChartInstance) {
      npvChartInstance.destroy();
    }

    npvChartInstance = new Chart(ctx, {
      data: {
        labels: labels,
        datasets: [
          {
            type: 'bar',
            label: 'Cash Inflow',
            data: inflows,
            backgroundColor: 'rgba(16, 185, 129, 0.45)', // Emerald translucent
            borderColor: '#10b981',
            borderWidth: 1.5,
            yAxisID: 'yBar',
            borderRadius: 4,
            order: 2
          },
          {
            type: 'bar',
            label: 'Yearly Investment',
            data: outflows,
            backgroundColor: 'rgba(244, 63, 94, 0.45)', // Rose translucent
            borderColor: '#f43f5e',
            borderWidth: 1.5,
            yAxisID: 'yBar',
            borderRadius: 4,
            order: 3
          },
          {
            type: 'bar',
            label: 'Net PV (Discounted)',
            data: pvFlows,
            backgroundColor: 'rgba(99, 102, 241, 0.6)', // Indigo translucent
            borderColor: '#6366f1',
            borderWidth: 1.5,
            yAxisID: 'yBar',
            borderRadius: 4,
            order: 4
          },
          {
            type: 'line',
            label: 'Cumulative NPV',
            data: cumulativeNpv,
            borderColor: '#ef4444', // Red Line
            backgroundColor: 'transparent',
            borderWidth: 3,
            pointBackgroundColor: '#ef4444',
            pointRadius: 4,
            pointHoverRadius: 6,
            yAxisID: 'yLine',
            tension: 0.15,
            order: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: colors.textColor,
              font: {
                family: 'Outfit',
                weight: '500',
                size: 11
              },
              boxWidth: 12
            }
          },
          tooltip: {
            backgroundColor: colors.tooltipBg,
            titleColor: colors.tooltipText,
            bodyColor: colors.tooltipText,
            borderColor: colors.tooltipBorder,
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += formatCurrency(context.parsed.y);
                }
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: colors.textColor,
              font: {
                family: 'Inter',
                size: 11
              }
            }
          },
          yBar: {
            type: 'linear',
            position: 'left',
            grid: {
              color: colors.gridColor
            },
            ticks: {
              color: colors.textColor,
              font: {
                family: 'Inter',
                size: 11
              },
              callback: function(value) {
                return '₹' + value.toLocaleString('en-IN', { maximumFractionDigits: 0 });
              }
            },
            title: {
              display: true,
              text: 'Annual Flow Value (₹)',
              color: colors.textColor,
              font: {
                family: 'Outfit',
                weight: '500',
                size: 10
              }
            }
          },
          yLine: {
            type: 'linear',
            position: 'right',
            grid: {
              drawOnChartArea: false // prevent double gridlines
            },
            ticks: {
              color: colors.textColor,
              font: {
                family: 'Inter',
                size: 11
              },
              callback: function(value) {
                return '₹' + value.toLocaleString('en-IN', { maximumFractionDigits: 0 });
              }
            },
            title: {
              display: true,
              text: 'Cumulative Net Value (₹)',
              color: colors.textColor,
              font: {
                family: 'Outfit',
                weight: '500',
                size: 10
              }
            }
          }
        }
      }
    });
  }

  // ================= EMI CALCULATIONS =================
  // Event listeners for EMI input updates
  [emiAmountInput, emiComfortableInput, emiRateInput, emiTenureInput].forEach(element => {
    element.addEventListener('input', calculateEMI);
  });

  // Event listener for EMI Mode changes
  emiModeInputs.forEach(input => {
    input.addEventListener('change', () => {
      const mode = document.querySelector('input[name="emiMode"]:checked').value;
      if (mode === 'emi') {
        groupEmiAmount.style.display = 'block';
        groupComfortableEmi.style.display = 'none';
        emiResultLabel.textContent = "Monthly Installment (EMI)";
        lblBreakdownPrincipal.textContent = "Principal Amount";
      } else {
        groupEmiAmount.style.display = 'none';
        groupComfortableEmi.style.display = 'block';
        emiResultLabel.textContent = "Maximum Eligible Loan Amount";
        lblBreakdownPrincipal.textContent = "Eligible Loan Principal";
      }
      calculateEMI();
    });
  });

  function calculateEMI() {
    const activeMode = document.querySelector('input[name="emiMode"]:checked').value;
    const annualRate = parseFloat(emiRateInput.value) || 0;
    const years = parseFloat(emiTenureInput.value) || 0;

    const monthlyRate = annualRate / 12 / 100;
    const totalMonths = years * 12;

    let principal = 0;
    let emi = 0;
    let totalPayable = 0;
    let totalInterest = 0;

    if (activeMode === 'emi') {
      principal = parseFloat(emiAmountInput.value) || 0;
      if (principal > 0 && totalMonths > 0) {
        if (monthlyRate === 0) {
          emi = principal / totalMonths;
        } else {
          emi = principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
        }
      }
      totalPayable = emi * totalMonths;
      totalInterest = Math.max(0, totalPayable - principal);

      // Update UI text
      emiResultValue.textContent = formatCurrency(emi);
      emiBreakdownPrincipal.textContent = formatCurrency(principal);
      emiBreakdownInterest.textContent = formatCurrency(totalInterest);
      emiBreakdownTotal.textContent = formatCurrency(totalPayable);

      // Render chart
      renderEmiChart(principal, totalInterest, 'Principal Amount', 'Total Interest');
    } else {
      const comfortableEmi = parseFloat(emiComfortableInput.value) || 0;
      if (comfortableEmi > 0 && totalMonths > 0) {
        if (monthlyRate === 0) {
          principal = comfortableEmi * totalMonths;
        } else {
          principal = comfortableEmi * (Math.pow(1 + monthlyRate, totalMonths) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, totalMonths));
        }
      }
      emi = comfortableEmi;
      totalPayable = comfortableEmi * totalMonths;
      totalInterest = Math.max(0, totalPayable - principal);

      // Update UI text
      emiResultValue.textContent = formatCurrency(principal); // Show maximum eligible loan as hero
      emiBreakdownPrincipal.textContent = formatCurrency(principal);
      emiBreakdownInterest.textContent = formatCurrency(totalInterest);
      emiBreakdownTotal.textContent = formatCurrency(totalPayable);

      // Render chart
      renderEmiChart(principal, totalInterest, 'Eligible Loan Principal', 'Total Interest');
    }

    // Generate Amortization Schedule
    const finalEmi = activeMode === 'emi' ? emi : parseFloat(emiComfortableInput.value) || 0;
    generateAmortizationSchedule(principal, monthlyRate, years, finalEmi);
  }

  function renderEmiChart(principal, interest, labelPrincipal, labelInterest) {
    const ctx = document.getElementById('emiChart').getContext('2d');
    const colors = getChartThemeColors();

    if (emiChartInstance) {
      emiChartInstance.destroy();
    }

    // Default to placeholders if values are zero
    const dataVals = (principal === 0 && interest === 0) ? [1, 1] : [principal, interest];
    const dataLabels = (principal === 0 && interest === 0) ? ['No Loan', 'No Interest'] : [labelPrincipal, labelInterest];

    emiChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: dataLabels,
        datasets: [{
          data: dataVals,
          backgroundColor: ['#6366f1', '#f59e0b'], // Indigo, Warning Orange
          borderColor: currentTheme === 'light' ? '#ffffff' : '#141a2a', // match card bg border
          borderWidth: 2,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%', // doughnut hole size
        plugins: {
          legend: {
            display: false // We use our HTML breakdown legend
          },
          tooltip: {
            backgroundColor: colors.tooltipBg,
            titleColor: colors.tooltipText,
            bodyColor: colors.tooltipText,
            borderColor: colors.tooltipBorder,
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                if (principal === 0 && interest === 0) {
                  return `${label}`;
                }
                return `${label}: ${formatCurrency(value)} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  // ================= UTILITIES =================
  function formatCurrency(value) {
    const absVal = Math.abs(value);
    const formatted = absVal.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return value < 0 ? `-${formatted}` : formatted;
  }

  // ================= INQUIRE NOW / SERVICES INTEGRATION =================
  const inquireButtons = document.querySelectorAll('.btn-inquire');
  const contactLoanTypeSelect = document.getElementById('contactLoanType');
  const contactNameInput = document.getElementById('contactName');
  const bottomContactSection = document.querySelector('.bottom-contact-section');

  inquireButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const serviceType = btn.getAttribute('data-service');
      
      // Select the service in the dropdown
      if (contactLoanTypeSelect) {
        contactLoanTypeSelect.value = serviceType;
      }
      
      // Scroll smoothly to contact form
      if (bottomContactSection) {
        bottomContactSection.scrollIntoView({ behavior: 'smooth' });
      }
      
      // Focus on the name input field
      if (contactNameInput) {
        setTimeout(() => {
          contactNameInput.focus();
        }, 800); // Wait for scroll animation to complete
      }
    });
  });

  // ================= BOTTOM CONTACT FORM SUBMISSION =================
  const bottomContactForm = document.getElementById('bottomContactForm');
  const contactSuccessMsg = document.getElementById('contactSuccessMsg');

  if (bottomContactForm) {
    bottomContactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Show success message
      if (contactSuccessMsg) {
        contactSuccessMsg.style.display = 'flex';
        contactSuccessMsg.style.opacity = '1';
        
        // Reset form inputs after a short delay
        setTimeout(() => {
          bottomContactForm.reset();
        }, 100);
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          contactSuccessMsg.style.opacity = '0';
          setTimeout(() => {
            contactSuccessMsg.style.display = 'none';
            contactSuccessMsg.style.opacity = '1';
          }, 300);
        }, 5000);
      }
    });
  }

  // ================= AMORTIZATION SCHEDULE LOGIC =================
  const btnToggleAmortization = document.getElementById('btnToggleAmortization');
  const amortizationContainer = document.getElementById('amortizationContainer');

  if (btnToggleAmortization && amortizationContainer) {
    btnToggleAmortization.addEventListener('click', () => {
      if (amortizationContainer.style.display === 'none') {
        amortizationContainer.style.display = 'block';
        btnToggleAmortization.textContent = 'Hide Annual Amortization Schedule';
        
        // Smooth scroll to schedule
        setTimeout(() => {
          amortizationContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      } else {
        amortizationContainer.style.display = 'none';
        btnToggleAmortization.textContent = 'View Annual Amortization Schedule';
      }
    });
  }

  function generateAmortizationSchedule(principal, monthlyRate, years, emi) {
    const tbody = document.getElementById('amortizationBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (principal <= 0 || emi <= 0 || years <= 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Please enter valid loan parameters to generate the schedule.</td></tr>';
      return;
    }

    let balance = principal;
    const roundedYears = Math.ceil(years);

    for (let year = 1; year <= roundedYears; year++) {
      let yearInterestPaid = 0;
      let yearPrincipalPaid = 0;
      let yearTotalPaid = 0;
      const startBalance = balance;

      // Calculate for 12 months (or fewer in the final year if tenure is fractional)
      const monthsInYear = year === roundedYears && years % 1 !== 0 
        ? Math.round((years % 1) * 12) 
        : 12;

      for (let m = 1; m <= monthsInYear; m++) {
        if (balance <= 0) break;

        const interest = balance * monthlyRate;
        let principalPaid = emi - interest;

        if (principalPaid > balance || (year === roundedYears && m === monthsInYear)) {
          principalPaid = balance;
        }

        const totalPaid = principalPaid + interest;

        yearInterestPaid += interest;
        yearPrincipalPaid += principalPaid;
        yearTotalPaid += totalPaid;
        balance -= principalPaid;
      }

      if (yearPrincipalPaid <= 0) break;

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>Year ${year}</td>
        <td>${formatCurrency(startBalance)}</td>
        <td>${formatCurrency(yearTotalPaid)}</td>
        <td>${formatCurrency(yearPrincipalPaid)}</td>
        <td>${formatCurrency(yearInterestPaid)}</td>
        <td>${formatCurrency(Math.max(0, balance))}</td>
      `;
      tbody.appendChild(row);

      if (balance <= 0) break;
    }
  }

  // ================= SHARE SUMMARY LOGIC =================
  setupShareButton('btnShareEmi', () => {
    const activeMode = document.querySelector('input[name="emiMode"]:checked').value;
    const rate = parseFloat(emiRateInput.value) || 0;
    const years = parseFloat(emiTenureInput.value) || 0;
    
    if (activeMode === 'emi') {
      const principal = parseFloat(emiAmountInput.value) || 0;
      const emiVal = document.getElementById('emiResultValue').textContent;
      const interestVal = document.getElementById('emiBreakdownInterest').textContent;
      const totalVal = document.getElementById('emiBreakdownTotal').textContent;
      
      return `Infinite Finance EMI Estimate:
--------------------------------
Loan Principal: ${formatCurrency(principal)}
Interest Rate: ${rate}% p.a.
Tenure: ${years} Years
Monthly EMI: ${emiVal}
Total Interest Paid: ${interestVal}
Total Amount Payable: ${totalVal}
--------------------------------
Calculate yours at: https://mriduljhawar15.github.io/infinity-finance/`;
    } else {
      const comfortableEmi = parseFloat(emiComfortableInput.value) || 0;
      const eligibleLoan = document.getElementById('emiResultValue').textContent;
      const interestVal = document.getElementById('emiBreakdownInterest').textContent;
      const totalVal = document.getElementById('emiBreakdownTotal').textContent;
      
      return `Infinite Finance Loan Eligibility Estimate:
--------------------------------
Comfortable Monthly EMI: ${formatCurrency(comfortableEmi)}
Interest Rate: ${rate}% p.a.
Tenure: ${years} Years
Maximum Eligible Loan: ${eligibleLoan}
Total Repayments: ${totalVal}
Total Interest Paid: ${interestVal}
--------------------------------
Calculate eligibility at: https://mriduljhawar15.github.io/infinity-finance/`;
    }
  });

  setupShareButton('btnShareNpv', () => {
    const rate = parseFloat(npvRateInput.value) || 0;
    const initialOutlay = parseFloat(npvInitialOutlayInput.value) || 0;
    const npv = document.getElementById('npvResultValue').textContent;
    const status = document.getElementById('npvStatusBadge').textContent;
    const irr = document.getElementById('metricIrr').textContent;
    const pi = document.getElementById('metricPi').textContent;
    const payback = document.getElementById('metricPayback').textContent;
    const discPayback = document.getElementById('metricDiscountedPayback').textContent;
    
    return `Infinite Finance NPV Analysis:
--------------------------------
Initial Outlay: ${formatCurrency(initialOutlay)}
Discount Rate: ${rate}%
Net Present Value (NPV): ${npv} (${status})
Internal Rate of Return (IRR): ${irr}
Profitability Index (PI): ${pi}
Payback Period: ${payback}
Discounted Payback: ${discPayback}
--------------------------------
Evaluate investments at: https://mriduljhawar15.github.io/infinity-finance/`;
  });

  setupShareButton('btnShareFv', () => {
    const pv = parseFloat(fvPvInput.value) || 0;
    const pmt = parseFloat(fvPmtInput.value) || 0;
    const rate = parseFloat(fvRateInput.value) || 0;
    const years = parseFloat(fvYearsInput.value) || 0;
    const freq = fvPmtFrequency.options[fvPmtFrequency.selectedIndex].text;
    const fv = document.getElementById('fvResultValue').textContent;
    const contrib = document.getElementById('fvBreakdownContributions').textContent;
    const interest = document.getElementById('fvBreakdownInterest').textContent;
    
    return `Infinite Finance Future Value Projection:
--------------------------------
Initial Principal (PV): ${formatCurrency(pv)}
Periodic Addition: ${formatCurrency(pmt)} (${freq})
Interest Rate: ${rate}% p.a.
Tenure: ${years} Years
Estimated Future Value (FV): ${fv}
Total Contributions: ${contrib}
Total Interest Earned: ${interest}
--------------------------------
Project your wealth at: https://mriduljhawar15.github.io/infinity-finance/`;
  });

  function setupShareButton(buttonId, textGeneratorFunc) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;
    
    btn.addEventListener('click', () => {
      const shareText = textGeneratorFunc();
      
      navigator.clipboard.writeText(shareText)
        .then(() => {
          const originalText = btn.innerHTML;
          btn.innerHTML = `<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg> Summary Copied!`;
          btn.style.background = 'var(--primary)';
          btn.style.borderColor = 'var(--primary)';
          btn.style.color = '#fff';
          
          setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
            btn.style.borderColor = '';
            btn.style.color = '';
          }, 2000);
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
          alert('Could not copy summary to clipboard. Please select and copy results manually.');
        });
    });
  }
});
