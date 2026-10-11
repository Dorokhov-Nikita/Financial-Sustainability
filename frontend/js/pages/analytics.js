// Analytics Page
let allAssessments = [];
let currentChart = null;

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
                <h2>Analytics & Trends</h2>
                
                <div class="card" style="margin-bottom: 30px;">
                    <h3>Select Metric to Visualize</h3>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px;">
                        <select id="metricSelect" style="padding: 10px; border: 1px solid #ddd; border-radius: 5px; min-width: 300px;">
                            <option value="">Choose a metric...</option>
                        </select>
                        <button class="btn btn-primary" onclick="buildChart()">Build Chart</button>
                    </div>
                    <div id="chartContainer" style="position: relative; height: 400px; display: none;">
                        <canvas id="analyticsChart"></canvas>
                    </div>
                    <div id="noDataMessage" style="text-align: center; color: var(--text-light); padding: 40px;">
                        Select a metric and click "Build Chart" to visualize data
                    </div>
                </div>
                
                <div class="card">
                    <h3>Your Assessments Summary</h3>
                    <div id="summaryContent">
                        <div class="loading">
                            <div class="spinner"></div>
                            <p>Loading assessments...</p>
                        </div>
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
        
        if (allAssessments.length === 0) {
            document.getElementById('summaryContent').innerHTML = `
                <p style="text-align: center; color: var(--text-light);">No assessments yet. Complete an assessment to see analytics.</p>
            `;
            return;
        }
        
        populateMetricSelect();
        displaySummary();
    } catch (error) {
        console.error('Failed to load analytics:', error);
        document.getElementById('summaryContent').innerHTML = `
            <div class="alert alert-error">Error loading data: ${error.message}</div>
        `;
    }
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

function buildChart() {
    const metric = document.getElementById('metricSelect').value;
    
    if (!metric) {
        alert('Please select a metric');
        return;
    }
    
    const featureData = FEATURE_LIST.find(f => f.name === metric);
    if (!featureData) return;
    
    // Collect data for this metric
    const labels = [];
    const values = [];
    
    allAssessments.forEach((assessment, index) => {
        let value = assessment[metric];
        if (metric === 'probability') {
            value = (value * 100).toFixed(1);
        } else if (value !== null && value !== undefined) {
            value = parseFloat(value).toFixed(4);
        }
        
        if (value !== null && value !== undefined) {
            labels.push(`Assessment #${assessment.id}`);
            values.push(parseFloat(value));
        }
    });
    
    if (values.length === 0) {
        alert('No data available for this metric');
        return;
    }
    
    // Destroy old chart if exists
    if (currentChart) {
        currentChart.destroy();
    }
    
    // Show chart container
    document.getElementById('chartContainer').style.display = 'block';
    document.getElementById('noDataMessage').style.display = 'none';
    
    // Create chart
    const ctx = document.getElementById('analyticsChart').getContext('2d');
    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: featureData.label,
                data: values,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 2,
                pointRadius: 5,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: `${featureData.label} Over Time`
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function displaySummary() {
    const content = document.getElementById('summaryContent');
    
    let html = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px;">
            <div class="stat-card">
                <h4>Total Assessments</h4>
                <div class="value">${allAssessments.length}</div>
            </div>
            <div class="stat-card">
                <h4>Average Risk</h4>
                <div class="value">${(allAssessments.reduce((sum, a) => sum + a.probability, 0) / allAssessments.length * 100).toFixed(1)}%</div>
            </div>
            <div class="stat-card">
                <h4>Highest Risk</h4>
                <div class="value">${(Math.max(...allAssessments.map(a => a.probability)) * 100).toFixed(1)}%</div>
            </div>
            <div class="stat-card">
                <h4>Lowest Risk</h4>
                <div class="value">${(Math.min(...allAssessments.map(a => a.probability)) * 100).toFixed(1)}%</div>
            </div>
        </div>
        
        <h4 style="margin-top: 20px; margin-bottom: 10px;">Recent Assessments</h4>
        <div style="max-height: 300px; overflow-y: auto;">
            <table class="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Model</th>
                        <th>Status</th>
                        <th>Probability</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    allAssessments.slice(0, 10).forEach(assessment => {
        const date = new Date(assessment.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        const modelName = assessment.model_type === 'model_30' ? 'RF (30)' : 'LGB (50)';
        const statusDisplay = assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1);
        const prob = (assessment.probability * 100).toFixed(1);
        
        html += `
            <tr>
                <td>#${assessment.id}</td>
                <td>${date}</td>
                <td>${modelName}</td>
                <td>${statusDisplay}</td>
                <td>${prob}%</td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    content.innerHTML = html;
}
