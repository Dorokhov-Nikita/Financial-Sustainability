// Analytics Page
let allAssessments = [];
let filteredAssessments = [];
let currentChart = null;
let currentDiagram = null;

const FEATURE_LIST = [
    { name: 'probability', label: 'Bankruptcy Probability (%)' },
    { name: 'net_income_assets', label: 'Net Income to Total Assets' },
    { name: 'net_worth_assets', label: 'Net worth/Assets' },
    { name: 'eps_persist', label: 'Persistent EPS in the Last Four Seasons' },
    { name: 'retained_earn_assets', label: 'Retained Earnings to Total Assets' },
    { name: 'net_income_equity', label: 'Net Income to Stockholder\'s Equity' },
    { name: 'borrowing_dep', label: 'Borrowing dependency' },
    { name: 'curr_liab_assets', label: 'Current Liability to Assets' },
    { name: 'working_cap_assets', label: 'Working Capital to Total Assets' },
    { name: 'curr_liab_curr_assets', label: 'Current Liability to Current Assets' },
    { name: 'net_value_share_a', label: 'Net Value Per Share (A)' },
    { name: 'total_exp_assets', label: 'Total expense/Assets' },
    { name: 'working_cap_equity', label: 'Working Capital/Equity' },
    { name: 'equity_lt_liab', label: 'Equity to Long-term Liability' },
    { name: 'cfo_assets', label: 'CFO to Assets' },
    { name: 'tax_rate_a', label: 'Tax rate (A)' },
    { name: 'inventory_ar_net_value', label: 'Inventory and accounts receivable/Net value' },
    { name: 'gross_profit_sales', label: 'Gross Profit to Sales' },
    { name: 'cash_assets', label: 'Cash/Total Assets' },
    { name: 'liability_assets_flag', label: 'Liability-Assets Flag' },
    { name: 'op_profit_person', label: 'Operating profit per person' },
    { name: 'cash_reinvestment', label: 'Cash Reinvestment %' },
    { name: 'quick_assets_assets', label: 'Quick Assets/Total Assets' },
    { name: 'cash_curr_liab', label: 'Cash/Current Liability' },
    { name: 'equity_liability', label: 'Equity to Liability' },
    { name: 'oper_funds_liability', label: 'Operating Funds to Liability' },
    { name: 'contingent_liab_net_worth', label: 'Contingent liabilities/Net worth' },
    { name: 'fixed_assets_turnover_freq', label: 'Fixed Assets Turnover Frequency' },
    { name: 'cash_flow_assets', label: 'Cash Flow to Total Assets' },
    { name: 'fixed_assets_assets', label: 'Fixed Assets to Assets' },
    { name: 'cash_flow_equity', label: 'Cash Flow to Equity' },
    { name: 'cash_flow_share', label: 'Cash Flow Per Share' },
    { name: 'total_asset_turnover', label: 'Total Asset Turnover' },
    { name: 'current_ratio', label: 'Current Ratio' },
    { name: 'cash_flow_liability', label: 'Cash Flow to Liability' },
    { name: 'total_asset_growth', label: 'Total Asset Growth Rate' },
    { name: 'assets_gnp', label: 'Total assets to GNP price' },
    { name: 'current_assets_assets', label: 'Current Assets/Total Assets' },
    { name: 'asset_return_growth', label: 'Total Asset Return Growth Rate Ratio' },
    { name: 'quick_ratio', label: 'Quick Ratio' },
    { name: 'total_debt_net_worth', label: 'Total debt/Total net worth' },
    { name: 'after_tax_profit_growth', label: 'After-tax Net Profit Growth Rate' },
    { name: 'lt_fund_suitability', label: 'Long-term fund suitability ratio (A)' },
    { name: 'rd_expense_rate', label: 'Research and development expense rate' },
    { name: 'interest_bearing_debt_rate', label: 'Interest-bearing debt interest rate' },
    { name: 'curr_liab_liability', label: 'Current Liabilities/Liability' },
    { name: 'quick_asset_turnover', label: 'Quick Asset Turnover Rate' },
    { name: 'sales_gross_profit_growth', label: 'Realized Sales Gross Profit Growth Rate' },
    { name: 'non_industry_income_revenue', label: 'Non-industry income and expenditure/revenue' },
    { name: 'current_asset_turnover', label: 'Current Asset Turnover Rate' },
    { name: 'net_worth_turnover', label: 'Net Worth Turnover Rate (times)' }
];

function renderAnalyticsPage() {
    const content = document.getElementById('content');
    
    content.innerHTML = `
        <div class="page">
            <div class="container">
                <h2 style="margin-bottom: 30px;">Analytics & Trends</h2>
                
                <!-- Filter Section -->
                <div class="card" style="margin-bottom: 30px;">
                    <h3>Filters</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #f1f5f9;">Company ID</label>
                            <select id="companyFilter" style="width: 100%; padding: 10px; border: 1px solid #334155; border-radius: 8px; background-color: #0f172a; color: #f1f5f9;">
                                <option value="">All Companies</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #f1f5f9;">Indicators</label>
                            <select id="modelFilter" style="width: 100%; padding: 10px; border: 1px solid #334155; border-radius: 8px; background-color: #0f172a; color: #f1f5f9;">
                                <option value="">All Indicators</option>
                                <option value="model_30">30 indicators</option>
                                <option value="model_50">50 indicators</option>
                            </select>
                        </div>
                    </div>
                    <button class="btn btn-primary" onclick="applyFilters()" style="margin-top: 15px;">Apply Filters</button>
                </div>
                
                <!-- Summary Cards -->
                <div id="summaryCards"></div>
                
                <!-- Table Section -->
                <div class="card" style="margin-bottom: 30px;">
                    <h3>Recent Assessments</h3>
                    <div id="tableContainer" style="overflow-x: auto;">
                        <table class="table" style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="border-bottom: 2px solid #334155;">
                                    <th style="text-align: left; padding: 12px; color: #60a5fa;">ID</th>
                                    <th style="text-align: left; padding: 12px; color: #60a5fa;">Company ID</th>
                                    <th style="text-align: left; padding: 12px; color: #60a5fa;">Date</th>
                                    <th style="text-align: left; padding: 12px; color: #60a5fa;">Indicators</th>
                                    <th style="text-align: center; padding: 12px; color: #60a5fa;">Risk %</th>
                                    <th style="text-align: center; padding: 12px; color: #60a5fa;">Status</th>
                                    <th style="text-align: center; padding: 12px; color: #60a5fa;">Include</th>
                                </tr>
                            </thead>
                            <tbody id="assessmentTableBody">
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- Chart Section -->
                <div class="card">
                    <h3>Metric Visualization</h3>
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #f1f5f9;">Select Metric</label>
                        <select id="metricSelect" style="width: 100%; padding: 10px; border: 1px solid #334155; border-radius: 8px; background-color: #0f172a; color: #f1f5f9;">
                            <option value="">Choose a metric...</option>
                        </select>
                    </div>
                    <button class="btn btn-primary" onclick="buildChart()" style="margin-bottom: 20px;">Build Charts</button>
                    <div id="chartsContainer"></div>
                    <div id="noDataMessage" style="text-align: center; color: #cbd5e1; padding: 40px;">
                        Select a metric and click "Build Charts" to visualize data
                    </div>
                </div>
            </div>
        </div>
    `;
    
    loadAnalyticsData();
}


async function loadAnalyticsData() {
    try {
        const data = await API.getAssessmentHistory();
        allAssessments = data.assessments || [];
        filteredAssessments = [...allAssessments];
        
        if (allAssessments.length === 0) {
            document.getElementById('summaryCards').innerHTML = `<p style="text-align: center; color: #cbd5e1;">No assessments yet.</p>`;
            return;
        }
        
        populateCompanyFilter();
        populateMetricSelect();
        displaySummaryCards();
        displayRecentAssessments();
    } catch (error) {
        console.error('Failed to load analytics:', error);
        document.getElementById('summaryCards').innerHTML = `<div class="alert alert-error">Error: ${error.message}</div>`;
    }
}

function populateCompanyFilter() {
    const select = document.getElementById('companyFilter');
    const companies = [...new Set(allAssessments.map(a => a.company_id).filter(c => c))];
    companies.forEach(company_id => {
        const option = document.createElement('option');
        option.value = company_id;
        option.textContent = `Company ${company_id}`;
        select.appendChild(option);
    });
}

function populateMetricSelect() {
    const select = document.getElementById('metricSelect');
    FEATURE_LIST.forEach(feature => {
        const option = document.createElement('option');
        option.value = feature.name;
        option.textContent = feature.label;
        select.appendChild(option);
    });
}

function applyFilters() {
    const companyId = document.getElementById('companyFilter').value;
    const modelType = document.getElementById('modelFilter').value;
    
    filteredAssessments = allAssessments.filter(a => {
        let match = true;
        if (companyId) match = match && a.company_id === parseInt(companyId);
        if (modelType) match = match && a.model_type === modelType;
        return match;
    });
    
    displaySummaryCards();
    displayRecentAssessments();
}

function displaySummaryCards() {
    const container = document.getElementById('summaryCards');
    
    if (filteredAssessments.length === 0) {
        container.innerHTML = `<p style="text-align: center; color: #cbd5e1;">No assessments match the filters.</p>`;
        return;
    }
    
    const avgRisk = (filteredAssessments.reduce((sum, a) => sum + a.probability, 0) / filteredAssessments.length * 100).toFixed(1);
    const maxRisk = Math.max(...filteredAssessments.map(a => a.probability)) * 100;
    const minRisk = Math.min(...filteredAssessments.map(a => a.probability)) * 100;
    const highRiskCount = filteredAssessments.filter(a => a.probability >= 0.7).length;
    const mediumRiskCount = filteredAssessments.filter(a => a.probability >= 0.3 && a.probability < 0.7).length;
    const lowRiskCount = filteredAssessments.filter(a => a.probability < 0.3).length;
    
    // Calculate additional derived metrics (excluding null/undefined values)
    const getAverage = (assessments, key) => {
        const validValues = assessments
            .map(a => a[key])
            .filter(v => v !== null && v !== undefined && !isNaN(v));
        return validValues.length > 0 ? validValues.reduce((sum, v) => sum + v, 0) / validValues.length : 0;
    };
    
    const avgReturnOnAssets = getAverage(filteredAssessments, 'net_income_assets');
    const avgCurrentRatio = getAverage(filteredAssessments, 'current_ratio');
    const avgEquityToLiab = getAverage(filteredAssessments, 'equity_liability');
    const avgCashFlowToAssets = getAverage(filteredAssessments, 'cash_flow_assets');
    const avgWorkingCapHealth = getAverage(filteredAssessments, 'working_cap_assets');
    
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
            <div class="stat-card" style="background: rgba(59, 130, 246, 0.15); border: 1px solid #3b82f6; border-radius: 12px; padding: 24px; text-align: center;">
                <div class="tooltip-container" style="display: inline-block; width: 100%;">
                    <h4 style="color: #60a5fa; margin-bottom: 8px; font-size: 14px;">Total Assessments <span class="tooltip-icon">?</span></h4>
                    <div class="tooltip-text">Total number of assessments in the selected dataset. Use filters to narrow down by company or model type.</div>
                </div>
                <div style="font-size: 32px; font-weight: bold; color: #f1f5f9;">${filteredAssessments.length}</div>
            </div>
            <div class="stat-card" style="background: rgba(59, 130, 246, 0.15); border: 1px solid #3b82f6; border-radius: 12px; padding: 24px; text-align: center;">
                <div class="tooltip-container" style="display: inline-block; width: 100%;">
                    <h4 style="color: #60a5fa; margin-bottom: 8px; font-size: 14px;">Average Risk <span class="tooltip-icon">?</span></h4>
                    <div class="tooltip-text">Average predicted financial distress probability across all selected assessments. Lower percentages indicate lower average risk.</div>
                </div>
                <div style="font-size: 32px; font-weight: bold; color: #f1f5f9;">${avgRisk}%</div>
            </div>
            <div class="stat-card" style="background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; border-radius: 12px; padding: 24px; text-align: center;">
                <div class="tooltip-container" style="display: inline-block; width: 100%;">
                    <h4 style="color: #fca5a5; margin-bottom: 8px; font-size: 14px;">High Risk <span class="tooltip-icon">?</span></h4>
                    <div class="tooltip-text">Count of assessments with high financial distress risk (probability ≥ 70%). These companies require immediate attention.</div>
                </div>
                <div style="font-size: 32px; font-weight: bold; color: #f1f5f9;">${highRiskCount}</div>
            </div>
            <div class="stat-card" style="background: rgba(245, 158, 11, 0.15); border: 1px solid #f59e0b; border-radius: 12px; padding: 24px; text-align: center;">
                <div class="tooltip-container" style="display: inline-block; width: 100%;">
                    <h4 style="color: #fcd34d; margin-bottom: 8px; font-size: 14px;">Medium Risk <span class="tooltip-icon">?</span></h4>
                    <div class="tooltip-text">Count of assessments with moderate financial distress risk (probability 30-70%). Monitor these for financial weaknesses.</div>
                </div>
                <div style="font-size: 32px; font-weight: bold; color: #f1f5f9;">${mediumRiskCount}</div>
            </div>
            <div class="stat-card" style="background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; border-radius: 12px; padding: 24px; text-align: center;">
                <div class="tooltip-container" style="display: inline-block; width: 100%;">
                    <h4 style="color: #6ee7b7; margin-bottom: 8px; font-size: 14px;">Low Risk <span class="tooltip-icon">?</span></h4>
                    <div class="tooltip-text">Count of assessments with low financial distress risk (probability < 30%). These companies show solid financial stability.</div>
                </div>
                <div style="font-size: 32px; font-weight: bold; color: #f1f5f9;">${lowRiskCount}</div>
            </div>
            <div class="stat-card" style="background: rgba(6, 182, 212, 0.15); border: 1px solid #06b6d4; border-radius: 12px; padding: 24px; text-align: center;">
                <div class="tooltip-container" style="display: inline-block; width: 100%;">
                    <h4 style="color: #67e8f9; margin-bottom: 8px; font-size: 14px;">Avg Return on Assets <span class="tooltip-icon">?</span></h4>
                    <div class="tooltip-text">Average profitability metric showing how efficiently companies generate profit from their assets. Higher values indicate better asset utilization and operational performance.</div>
                </div>
                <div style="font-size: 32px; font-weight: bold; color: #f1f5f9;">${avgReturnOnAssets.toFixed(2)}</div>
            </div>
            <div class="stat-card" style="background: rgba(6, 182, 212, 0.15); border: 1px solid #06b6d4; border-radius: 12px; padding: 24px; text-align: center;">
                <div class="tooltip-container" style="display: inline-block; width: 100%;">
                    <h4 style="color: #67e8f9; margin-bottom: 8px; font-size: 14px;">Avg Current Ratio <span class="tooltip-icon">?</span></h4>
                    <div class="tooltip-text">Average ratio showing ability to pay short-term obligations. Higher values indicate stronger immediate liquidity. Ratios above 1.0 mean liquid assets exceed current liabilities.</div>
                </div>
                <div style="font-size: 32px; font-weight: bold; color: #f1f5f9;">${avgCurrentRatio.toFixed(2)}</div>
            </div>
            <div class="stat-card" style="background: rgba(6, 182, 212, 0.15); border: 1px solid #06b6d4; border-radius: 12px; padding: 24px; text-align: center;">
                <div class="tooltip-container" style="display: inline-block; width: 100%;">
                    <h4 style="color: #67e8f9; margin-bottom: 8px; font-size: 14px;">Avg Equity-to-Liabilities Ratio <span class="tooltip-icon">?</span></h4>
                    <div class="tooltip-text">Average ratio showing balance between shareholders' equity and total liabilities. Higher values indicate less financial leverage and stronger solvency position.</div>
                </div>
                <div style="font-size: 32px; font-weight: bold; color: #f1f5f9;">${avgEquityToLiab.toFixed(2)}</div>
            </div>
            <div class="stat-card" style="background: rgba(6, 182, 212, 0.15); border: 1px solid #06b6d4; border-radius: 12px; padding: 24px; text-align: center;">
                <div class="tooltip-container" style="display: inline-block; width: 100%;">
                    <h4 style="color: #67e8f9; margin-bottom: 8px; font-size: 14px;">Avg Cash Flow to Assets <span class="tooltip-icon">?</span></h4>
                    <div class="tooltip-text">Average metric measuring quality of earnings by showing cash generation from operations relative to total assets. Higher values indicate strong actual cash generation capability.</div>
                </div>
                <div style="font-size: 32px; font-weight: bold; color: #f1f5f9;">${avgCashFlowToAssets.toFixed(2)}</div>
            </div>
            <div class="stat-card" style="background: rgba(6, 182, 212, 0.15); border: 1px solid #06b6d4; border-radius: 12px; padding: 24px; text-align: center;">
                <div class="tooltip-container" style="display: inline-block; width: 100%;">
                    <h4 style="color: #67e8f9; margin-bottom: 8px; font-size: 14px;">Working Capital Health <span class="tooltip-icon">?</span></h4>
                    <div class="tooltip-text">Average metric showing operational flexibility and liquid resources available for day-to-day operations. Higher values indicate better ability to fund operations and support growth.</div>
                </div>
                <div style="font-size: 32px; font-weight: bold; color: #f1f5f9;">${avgWorkingCapHealth.toFixed(2)}</div>
            </div>
        </div>
    `;
}

function displayRecentAssessments() {
    const tbody = document.getElementById('assessmentTableBody');
    tbody.innerHTML = '';
    
    filteredAssessments.slice(0, 20).forEach((assessment, index) => {
        const date = new Date(assessment.created_at).toLocaleDateString();
        const modelName = assessment.model_type === 'model_30' ? '30' : '50';
        const risk = (assessment.probability * 100).toFixed(1);
        
        tbody.innerHTML += `
            <tr style="border-bottom: 1px solid #334155;">
                <td style="padding: 12px; color: #cbd5e1;">#${assessment.id}</td>
                <td style="padding: 12px; color: #cbd5e1;">${assessment.company_id || '-'}</td>
                <td style="padding: 12px; color: #cbd5e1;">${date}</td>
                <td style="padding: 12px; color: #cbd5e1;">${modelName}</td>
                <td style="padding: 12px; text-align: center; color: #cbd5e1; font-weight: bold;">${risk}%</td>
                <td style="padding: 12px; text-align: center;">
                    <span style="background: ${assessment.probability >= 0.7 ? '#ef4444' : assessment.probability >= 0.3 ? '#f59e0b' : '#10b981'}; 
                                 color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px;">
                        ${assessment.probability >= 0.7 ? 'HIGH' : assessment.probability >= 0.3 ? 'MED' : 'LOW'}
                    </span>
                </td>
                <td style="padding: 12px; text-align: center;">
                    <input type="checkbox" id="check_${assessment.id}" onchange="updateChartSelection()" style="cursor: pointer; width: 18px; height: 18px;">
                </td>
            </tr>
        `;
    });
}

function updateChartSelection() {
    // Update chart to only show selected assessments
}

function buildChart() {
    const metric = document.getElementById('metricSelect').value;
    
    if (!metric) {
        alert('Please select a metric');
        return;
    }
    
    const featureData = FEATURE_LIST.find(f => f.name === metric);
    if (!featureData) return;
    
    // Get selected assessments
    const selectedIds = [];
    document.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
        const id = parseInt(cb.id.replace('check_', ''));
        selectedIds.push(id);
    });
    
    const dataSource = selectedIds.length > 0 
        ? filteredAssessments.filter(a => selectedIds.includes(a.id))
        : filteredAssessments;
    
    if (dataSource.length === 0) {
        alert('No data selected for chart');
        return;
    }
    
    const labels = [];
    const values = [];
    
    dataSource.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)).forEach((assessment, index) => {
        let value = assessment[metric];
        if (metric === 'probability') {
            value = (value * 100).toFixed(1);
        } else if (value !== null && value !== undefined) {
            value = parseFloat(value).toFixed(2);
        }
        
        if (value !== undefined && value !== null) {
            labels.push(`#${assessment.id}`);
            values.push(value);
        }
    });
    
    if (values.length === 0) {
        alert('No data available for this metric');
        return;
    }
    
    document.getElementById('chartsContainer').style.display = 'block';
    document.getElementById('noDataMessage').style.display = 'none';
    
    // Destroy existing charts
    const existingCanvases = document.querySelectorAll('#chartsContainer canvas');
    existingCanvases.forEach(canvas => {
        if (canvas.chart) canvas.chart.destroy();
    });
    
    const chartsContainer = document.getElementById('chartsContainer');
    chartsContainer.innerHTML = '';
    
    const chartTypes = [
        { type: 'line', title: 'Line Chart' },
        { type: 'bar', title: 'Bar Chart' },
        { type: 'pie', title: 'Pie Chart' },
        { type: 'doughnut', title: 'Doughnut Chart' }
    ];
    
    chartTypes.forEach((chartInfo, index) => {
        const chartDiv = document.createElement('div');
        chartDiv.style.marginBottom = '40px';
        
        const title = document.createElement('h4');
        title.textContent = chartInfo.title;
        title.style.marginBottom = '15px';
        title.style.color = '#f1f5f9';
        chartDiv.appendChild(title);
        
        const canvasWrapper = document.createElement('div');
        canvasWrapper.style.position = 'relative';
        canvasWrapper.style.height = '400px';
        
        const canvas = document.createElement('canvas');
        canvas.id = `analyticsChart_${chartInfo.type}`;
        canvasWrapper.appendChild(canvas);
        chartDiv.appendChild(canvasWrapper);
        
        chartsContainer.appendChild(chartDiv);
        
        const ctx = canvas.getContext('2d');
        
        const chartConfig = {
            line: {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: featureData.label,
                        data: values,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 2,
                        pointRadius: 5,
                        pointBackgroundColor: '#06b6d4',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        fill: true,
                        tension: 0.3
                    }]
                }
            },
            bar: {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: featureData.label,
                        data: values,
                        backgroundColor: 'rgba(59, 130, 246, 0.7)',
                        borderColor: '#3b82f6',
                        borderWidth: 1
                    }]
                }
            },
            pie: {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        data: values,
                        backgroundColor: [
                            '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444',
                            '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1'
                        ],
                        borderColor: '#1e293b',
                        borderWidth: 2
                    }]
                }
            },
            doughnut: {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: values,
                        backgroundColor: [
                            '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444',
                            '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1'
                        ],
                        borderColor: '#1e293b',
                        borderWidth: 2
                    }]
                }
            }
        };
        
        const chart = new Chart(ctx, {
            ...chartConfig[chartInfo.type],
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: ['pie', 'doughnut'].includes(chartInfo.type),
                        labels: { color: '#cbd5e1' }
                    },
                    title: { display: true, text: `${featureData.label}`, color: '#f1f5f9' }
                },
                scales: ['line', 'bar'].includes(chartInfo.type) ? {
                    y: { beginAtZero: true, ticks: { color: '#cbd5e1' }, grid: { color: '#334155' } },
                    x: { ticks: { color: '#cbd5e1' }, grid: { color: '#334155' } }
                } : {}
            }
        });
        
        canvas.chart = chart;
    });
}