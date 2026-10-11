// Analytics Page
function renderAnalytics() {
    const content = document.getElementById('content');
    
    content.innerHTML = `
        <div class="page">
            <div class="container">
                <h2>Analytics & Dashboard</h2>
                <div id="analyticsContent">
                    <div class="loading">
                        <div class="spinner"></div>
                        <p>Loading analytics...</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    loadAnalytics();
}

async function loadAnalytics() {
    try {
        const dashboard = await API.getDashboard();
        renderAnalyticsDashboard(dashboard);
    } catch (error) {
        const content = document.getElementById('analyticsContent');
        content.innerHTML = `<div class="alert alert-error">Error loading analytics: ${error.message}</div>`;
    }
}

function renderAnalyticsDashboard(data) {
    const content = document.getElementById('analyticsContent');
    
    let html = `
        <div class="stats-grid">
            <div class="stat-card">
                <h4>Total Assessments</h4>
                <div class="value">${data.total_assessments}</div>
            </div>
            <div class="stat-card success">
                <h4>Average Score</h4>
                <div class="value">${data.average_score.toFixed(1)}</div>
            </div>
    `;

    if (data.last_assessment) {
        html += `
            <div class="stat-card info">
                <h4>Last Assessment</h4>
                <div class="value">${data.last_assessment.score !== null ? Math.round(data.last_assessment.score) : 'N/A'}</div>
                <small>${new Date(data.last_assessment.date).toLocaleDateString()}</small>
            </div>
        `;
    }

    html += `
        </div>

        <div class="chart-container">
            <h3>Assessment History</h3>
            <table class="table">
                <thead>
                    <tr>
                        <th>Assessment</th>
                        <th>Score</th>
                        <th>Status</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
    `;

    data.assessments.forEach(assessment => {
        const score = assessment.score !== null ? Math.round(assessment.score) + '/100' : '-';
        const date = new Date(assessment.date).toLocaleDateString();
        const health = assessment.health || '-';

        html += `
            <tr>
                <td>${assessment.title}</td>
                <td>${score}</td>
                <td><span class="badge ${health === 'Excellent' ? 'badge-success' : health === 'Good' ? 'badge-info' : health === 'Fair' ? 'badge-warning' : 'badge-danger'}">${health}</span></td>
                <td>${date}</td>
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

// Result Page
function renderResult(assessmentId) {
    const content = document.getElementById('content');
    
    content.innerHTML = `
        <div class="page">
            <div id="resultContent">
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Loading result...</p>
                </div>
            </div>
        </div>
    `;

    loadResult(assessmentId);
}

async function loadResult(assessmentId) {
    try {
        const assessment = await API.getAssessment(assessmentId);
        
        if (!assessment.result) {
            document.getElementById('resultContent').innerHTML = `
                <div class="container">
                    <div class="alert alert-warning">No result calculated yet. Please complete the assessment first.</div>
                    <button class="btn btn-primary" onclick="navigateTo('assessment')">Back to Assessment</button>
                </div>
            `;
            return;
        }

        renderResultPage(assessment, assessment.result);
    } catch (error) {
        document.getElementById('resultContent').innerHTML = `
            <div class="container">
                <div class="alert alert-error">Error loading result: ${error.message}</div>
            </div>
        `;
    }
}

function renderResultPage(assessment, result) {
    const content = document.getElementById('resultContent');
    
    const recommendations = result.recommendations.split('; ');
    const scoreColor = result.sustainability_score >= 80 ? 'success' : 
                       result.sustainability_score >= 60 ? 'info' : 
                       result.sustainability_score >= 40 ? 'warning' : 'danger';

    let html = `
        <div class="container">
            <div style="margin-bottom: 20px;">
                <button class="btn btn-secondary" onclick="navigateTo('assessment')">← Back to Assessment</button>
            </div>

            <div class="card">
                <h2>${assessment.title} - Results</h2>
            </div>

            <div class="score-display">
                <div class="score-circle" style="background: linear-gradient(135deg, var(--${scoreColor === 'success' ? 'success' : scoreColor === 'danger' ? 'danger' : scoreColor === 'warning' ? 'warning' : 'primary'}-color) 0%, var(--${scoreColor === 'success' ? 'success' : scoreColor === 'danger' ? 'danger' : scoreColor === 'warning' ? 'warning' : 'primary'}-color) 100%);">
                    ${Math.round(result.sustainability_score)}
                </div>
                <div class="score-info">
                    <h3>Overall Financial Health</h3>
                    <p><strong>${result.overall_health}</strong></p>
                    <p style="color: var(--text-light); margin-top: 10px;">Based on your company's financial indicators and performance metrics.</p>
                </div>
            </div>

            <div class="card" style="margin-top: 30px;">
                <h3>Financial Indicators</h3>
                
                <div class="stats-grid">
                    ${assessment.revenue ? `<div class="stat-card"><h4>Revenue</h4><div class="value">$${(assessment.revenue / 1000000).toFixed(1)}M</div></div>` : ''}
                    ${assessment.expenses ? `<div class="stat-card"><h4>Expenses</h4><div class="value">$${(assessment.expenses / 1000000).toFixed(1)}M</div></div>` : ''}
                    ${assessment.profit_margin ? `<div class="stat-card"><h4>Profit Margin</h4><div class="value">${assessment.profit_margin.toFixed(1)}%</div></div>` : ''}
                    ${assessment.debt_to_equity ? `<div class="stat-card"><h4>Debt-to-Equity</h4><div class="value">${assessment.debt_to_equity.toFixed(2)}</div></div>` : ''}
                    ${assessment.current_ratio ? `<div class="stat-card"><h4>Current Ratio</h4><div class="value">${assessment.current_ratio.toFixed(2)}</div></div>` : ''}
                    ${assessment.roa ? `<div class="stat-card"><h4>Return on Assets</h4><div class="value">${(assessment.roa * 100).toFixed(1)}%</div></div>` : ''}
                </div>
            </div>

            <div class="card" style="margin-top: 30px;">
                <h3>Recommendations</h3>
                <ul style="padding-left: 20px;">
    `;

    recommendations.forEach(rec => {
        if (rec.trim()) {
            html += `<li style="margin-bottom: 10px; color: var(--text-dark);">${rec.trim()}</li>`;
        }
    });

    html += `
                </ul>
            </div>

            <div style="text-align: center; margin-top: 30px; margin-bottom: 30px;">
                <button class="btn btn-primary" onclick="navigateTo('assessment')" style="margin-right: 10px;">Create Another Assessment</button>
                <button class="btn btn-secondary" onclick="navigateTo('analytics')">View Analytics</button>
            </div>
        </div>
    `;

    content.innerHTML = html;
}

// History Page
function renderHistory() {
    const content = document.getElementById('content');
    
    content.innerHTML = `
        <div class="page">
            <div class="container">
                <h2>Assessment History</h2>
                <div id="historyContent">
                    <div class="loading">
                        <div class="spinner"></div>
                        <p>Loading history...</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    loadHistory();
}

async function loadHistory() {
    try {
        const assessments = await API.getAssessments();
        renderHistoryList(assessments);
    } catch (error) {
        const content = document.getElementById('historyContent');
        content.innerHTML = `<div class="alert alert-error">Error loading history: ${error.message}</div>`;
    }
}

function renderHistoryList(assessments) {
    const content = document.getElementById('historyContent');
    
    if (assessments.length === 0) {
        content.innerHTML = `<p style="text-align: center; color: var(--text-light);">No assessment history yet.</p>`;
        return;
    }

    // Sort by date descending
    const sorted = assessments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    let html = `
        <div class="table-container">
            <table class="table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Date</th>
                        <th>Score</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;

    sorted.forEach(assessment => {
        const score = assessment.result ? Math.round(assessment.result.sustainability_score) + '/100' : '-';
        const health = assessment.result ? assessment.result.overall_health : '-';
        const date = new Date(assessment.created_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        html += `
            <tr>
                <td>${assessment.title}</td>
                <td>${date}</td>
                <td>${score}</td>
                <td><span class="badge ${health === 'Excellent' ? 'badge-success' : health === 'Good' ? 'badge-info' : health === 'Fair' ? 'badge-warning' : 'badge-danger'}">${health}</span></td>
                <td>
                    <button class="btn btn-primary" onclick="navigateTo('result', ${assessment.id})">View Result</button>
                </td>
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

// Reference/Guide Page
function renderReference() {
    const content = document.getElementById('content');
    
    content.innerHTML = `
        <div class="page">
            <div class="container">
                <h2>Financial Indicators Reference Guide</h2>
                <p style="color: var(--text-light); margin-bottom: 30px;">Learn about the financial metrics used in our assessment platform</p>

                <div id="referenceContent"></div>
            </div>
        </div>
    `;

    renderReferenceContent();
}

function renderReferenceContent() {
    const content = document.getElementById('referenceContent');
    
    content.innerHTML = `
        <div class="reference-item">
            <h4>Revenue</h4>
            <p>Total income generated by the company from the sale of goods or services related to the company's primary operations.</p>
            <div class="formula">Revenue = Total Sales</div>
            <p><strong>Why it matters:</strong> Indicates the scale of business operations and top-line growth.</p>
        </div>

        <div class="reference-item">
            <h4>Expenses</h4>
            <p>All costs incurred by the company in the process of generating revenue.</p>
            <div class="formula">Expenses = Cost of Goods Sold + Operating Expenses + Other Costs</div>
            <p><strong>Why it matters:</strong> Essential for calculating profitability and cash flow.</p>
        </div>

        <div class="reference-item">
            <h4>Profit Margin</h4>
            <p>A profitability ratio that measures how much profit a company makes for every dollar of revenue.</p>
            <div class="formula">Profit Margin (%) = (Net Profit / Revenue) × 100</div>
            <p><strong>Why it matters:</strong> Shows how efficiently the company converts revenue into profit. Higher margins indicate better operational efficiency.</p>
            <p><strong>Benchmark:</strong> Typically 10-15% is considered healthy for most industries.</p>
        </div>

        <div class="reference-item">
            <h4>Debt-to-Equity Ratio</h4>
            <p>A leverage ratio that measures the relative proportion of debt and equity used to finance the company's assets.</p>
            <div class="formula">Debt-to-Equity = Total Liabilities / Total Equity</div>
            <p><strong>Why it matters:</strong> Indicates financial leverage and risk level. Lower ratios suggest less financial risk.</p>
            <p><strong>Benchmark:</strong> A ratio below 1.0 is generally preferred; below 0.5 indicates conservative leverage.</p>
        </div>

        <div class="reference-item">
            <h4>Current Ratio</h4>
            <p>A liquidity ratio that measures a company's ability to pay short-term obligations with its current assets.</p>
            <div class="formula">Current Ratio = Current Assets / Current Liabilities</div>
            <p><strong>Why it matters:</strong> Shows the company's short-term financial health and ability to meet immediate obligations.</p>
            <p><strong>Benchmark:</strong> A ratio of 1.5 to 3.0 is typically considered healthy.</p>
        </div>

        <div class="reference-item">
            <h4>Return on Assets (ROA)</h4>
            <p>A profitability ratio that measures how efficiently a company uses its assets to generate profit.</p>
            <div class="formula">ROA (%) = (Net Income / Total Assets) × 100</div>
            <p><strong>Why it matters:</strong> Shows how well management is using assets to generate earnings.</p>
            <p><strong>Benchmark:</strong> Generally, an ROA above 5% is considered good.</p>
        </div>

        <div class="reference-item">
            <h4>Return on Equity (ROE)</h4>
            <p>A profitability ratio that measures the return generated on the shareholders' equity.</p>
            <div class="formula">ROE (%) = (Net Income / Shareholders' Equity) × 100</div>
            <p><strong>Why it matters:</strong> Indicates how effectively the company is using shareholder funds to generate profits.</p>
            <p><strong>Benchmark:</strong> Generally, an ROE above 10% is considered good.</p>
        </div>

        <div class="reference-item">
            <h4>Sustainability Score</h4>
            <p>A comprehensive score calculated by our system based on all financial indicators above.</p>
            <p><strong>Score Range:</strong></p>
            <ul style="padding-left: 20px; margin-top: 10px;">
                <li><strong>80-100:</strong> Excellent - Company is in excellent financial health</li>
                <li><strong>60-79:</strong> Good - Company demonstrates solid financial performance</li>
                <li><strong>40-59:</strong> Fair - Company shows moderate financial health with some concerns</li>
                <li><strong>0-39:</strong> Poor - Company faces significant financial challenges</li>
            </ul>
        </div>

        <div class="card" style="background-color: #f0f9ff; border-left: 4px solid var(--primary-color);">
            <h3>How to Improve Your Score</h3>
            <ul style="padding-left: 20px;">
                <li>Increase profit margin through cost control and pricing optimization</li>
                <li>Reduce debt-to-equity ratio by paying down debt or increasing equity</li>
                <li>Improve current ratio by managing working capital effectively</li>
                <li>Enhance ROA by improving asset utilization</li>
                <li>Boost ROE by increasing profitability or optimizing capital structure</li>
            </ul>
        </div>
    `;
}
