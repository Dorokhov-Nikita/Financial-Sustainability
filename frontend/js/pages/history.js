// History Page Module
function renderHistoryPage() {
    const content = document.getElementById('content');
    
    content.innerHTML = `
        <div class="page">
            <div class="container">
                <h2>Assessment History</h2>
                <div style="margin-bottom: 20px;">
                    <label>Filter by Company:</label>
                    <select id="companyFilter" style="padding: 10px; border: 1px solid #ddd; border-radius: 4px; width: 200px;">
                        <option value="">All Companies</option>
                    </select>
                </div>
                <div id="historyContent">
                    <div class="loading">
                        <div class="spinner"></div>
                        <p>Loading history...</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    loadHistoryData();
}

async function loadHistoryData() {
    try {
        const data = await API.getAssessmentHistory();
        const assessments = data.assessments || [];
        const companyIds = data.company_ids || [];
        
        // Populate company filter
        const companyFilter = document.getElementById('companyFilter');
        companyIds.forEach(id => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = `Company ${id}`;
            companyFilter.appendChild(option);
        });
        
        companyFilter.addEventListener('change', async (e) => {
            const selectedCompanyId = e.target.value;
            const filteredData = await API.getAssessmentHistory(selectedCompanyId ? parseInt(selectedCompanyId) : null);
            renderHistoryListContent(filteredData.assessments || []);
        });
        
        renderHistoryListContent(assessments);
    } catch (error) {
        const content = document.getElementById('historyContent');
        content.innerHTML = `<div class="alert alert-error">Error loading history: ${error.message}</div>`;
    }
}

function renderHistoryListContent(assessments) {
    const content = document.getElementById('historyContent');
    
    if (assessments.length === 0) {
        content.innerHTML = `
            <div class="card">
                <p style="text-align: center; color: var(--text-light); padding: 40px;">No assessment history yet.</p>
            </div>
        `;
        return;
    }

    let html = `
        <div class="card">
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Date</th>
                            <th>Company</th>
                            <th>Model</th>
                            <th>Status</th>
                            <th>Probability</th>
                            <th>Results</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    assessments.forEach(assessment => {
        const date = new Date(assessment.created_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const modelName = assessment.model_type === 'model_30' ? 'Random Forest (30)' : 'LightGBM SMOTE (50)';
        const statusDisplayText = assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1);
        
        // Color badges based on status
        let statusClass = 'badge-success';
        if (assessment.probability > 0.85) statusClass = 'badge-danger';
        else if (assessment.probability > 0.65) statusClass = 'badge-warning';
        else if (assessment.probability > 0.45) statusClass = 'badge-warning';
        else if (assessment.probability > 0.25) statusClass = 'badge-info';
        
        const probabilityPercent = (assessment.probability * 100).toFixed(1);
        const companyDisplay = assessment.company_id ? `Company ${assessment.company_id}` : '-';

        html += `
            <tr>
                <td>#${assessment.id}</td>
                <td>${date}</td>
                <td>${companyDisplay}</td>
                <td>${modelName}</td>
                <td><span class="badge ${statusClass}">${statusDisplayText}</span></td>
                <td>${probabilityPercent}%</td>
                <td>
                    <div class="action-buttons" style="display: flex; gap: 5px;">
                        <button class="btn btn-primary" onclick="navigateTo('result', '${assessment.id}')" style="flex: 1;">View</button>
                        <button class="btn btn-secondary" onclick="showAssessmentDetails(${assessment.id})" style="flex: 1;" title="View all metrics">Details</button>
                    </div>
                </td>
            </tr>
        `;
    });

    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;

    content.innerHTML = html;
}

function showAssessmentDetails(assessmentId) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    
    try {
        // Find assessment in current data
        // We need to fetch it since we may not have it loaded
        API.getAssessment(assessmentId).then(assessment => {
            let html = `
                <h3>Assessment #${assessment.id} - All Metrics</h3>
                <div style="max-height: 500px; overflow-y: auto; margin-top: 15px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="border-bottom: 1px solid #ddd;">
                            <td style="padding: 8px; font-weight: bold;">ID</td>
                            <td style="padding: 8px;">${assessment.id}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #ddd;">
                            <td style="padding: 8px; font-weight: bold;">Company ID</td>
                            <td style="padding: 8px;">${assessment.company_id || '-'}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #ddd;">
                            <td style="padding: 8px; font-weight: bold;">Date</td>
                            <td style="padding: 8px;">${new Date(assessment.created_at).toLocaleString()}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #ddd;">
                            <td style="padding: 8px; font-weight: bold;">Model</td>
                            <td style="padding: 8px;">${assessment.model_type}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #ddd;">
                            <td style="padding: 8px; font-weight: bold;">Probability</td>
                            <td style="padding: 8px;">${(assessment.probability * 100).toFixed(2)}%</td>
                        </tr>
            `;
            
            // Add all feature values
            const features = [
                'net_income_assets', 'net_worth_assets', 'eps_persist', 'retained_earn_assets',
                'net_income_equity', 'borrowing_dep', 'curr_liab_assets', 'working_cap_assets',
                'curr_liab_curr_assets', 'net_value_share_a', 'total_exp_assets', 'working_cap_equity',
                'equity_lt_liab', 'cfo_assets', 'tax_rate_a', 'inventory_ar_net_value',
                'gross_profit_sales', 'cash_assets', 'liability_assets_flag', 'op_profit_person',
                'cash_reinvestment', 'quick_assets_assets', 'cash_curr_liab', 'equity_liability',
                'oper_funds_liability', 'contingent_liab_net_worth', 'fixed_assets_turnover_freq',
                'cash_flow_assets', 'fixed_assets_assets', 'cash_flow_equity', 'cash_flow_share',
                'total_asset_turnover', 'current_ratio', 'cash_flow_liability', 'total_asset_growth',
                'assets_gnp', 'current_assets_assets', 'asset_return_growth', 'quick_ratio',
                'total_debt_net_worth', 'after_tax_profit_growth', 'lt_fund_suitability',
                'rd_expense_rate', 'interest_bearing_debt_rate', 'curr_liab_liability',
                'quick_asset_turnover', 'sales_gross_profit_growth', 'non_industry_income_revenue',
                'current_asset_turnover', 'net_worth_turnover'
            ];
            
            features.forEach(feature => {
                const value = assessment[feature];
                if (value !== null && value !== undefined) {
                    html += `
                        <tr style="border-bottom: 1px solid #ddd;">
                            <td style="padding: 8px; font-weight: bold;">${feature}</td>
                            <td style="padding: 8px;">${typeof value === 'number' ? value.toFixed(6) : value}</td>
                        </tr>
                    `;
                }
            });
            
            html += `</table></div>`;
            
            modalBody.innerHTML = html;
            modal.style.display = 'flex';
        });
    } catch (error) {
        console.error('Error loading assessment details:', error);
        modalBody.innerHTML = `<div class="alert alert-error">Error loading details: ${error.message}</div>`;
        modal.style.display = 'flex';
    }
}
