// Result Page
async function renderResult(assessmentId) {
    const content = document.getElementById('content');
    
    if (!assessmentId) {
        content.innerHTML = `
            <div class="page">
                <div class="container">
                    <h2>No Assessment</h2>
                    <p>Please complete an assessment first.</p>
                    <button class="btn btn-primary" onclick="navigateTo('assessment')">Back to Assessment</button>
                </div>
            </div>
        `;
        return;
    }
    
    content.innerHTML = `
        <div class="page">
            <div class="container">
                <div style="text-align: center; margin-bottom: 30px;">
                    <div class="loading">
                        <div class="spinner"></div>
                        <p>Loading assessment results...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    try {
        const result = await API.getAssessment(assessmentId);
        displayResultsContent(result);
    } catch (error) {
        content.innerHTML = `
            <div class="page">
                <div class="container">
                    <div class="alert alert-error">Error loading results: ${error.message}</div>
                    <button class="btn btn-primary" onclick="navigateTo('assessment')">Back to Assessment</button>
                </div>
            </div>
        `;
    }
}

function displayResultsContent(assessment) {
    const content = document.getElementById('content');
    
    const statusClass = assessment.prediction === 1 ? 'alert-warning' : 'alert-success';
    const statusText = assessment.prediction === 1 ? 'At Risk' : 'Stable';
    const riskColor = assessment.risk_level === 'high' ? '#dc3545' : assessment.risk_level === 'medium' ? '#ffc107' : '#28a745';
    const probabilityPercent = (assessment.probability * 100).toFixed(2);
    
    const modelTypeText = assessment.model_type === 'model_30' ? 'Random Forest (30 Features)' : 'LightGBM SMOTE (50 Features)';
    
    content.innerHTML = `
        <div class="page">
            <div class="container">
                <h2 style="margin-bottom: 30px;">Assessment Results</h2>

                <div class="card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; margin-bottom: 20px;">
                    <div style="text-align: center;">
                        <h3>Overall Financial Status</h3>
                        <div style="font-size: 3em; font-weight: bold; margin: 20px 0; text-transform: uppercase;">${statusText}</div>
                        <div style="font-size: 1.2em;">
                            Bankruptcy Risk: <strong>${probabilityPercent}%</strong>
                        </div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div class="card">
                        <h3>Model Information</h3>
                        <p><strong>Model Used:</strong> ${modelTypeText}</p>
                        <p><strong>Risk Level:</strong> <span style="color: ${riskColor}; font-weight: bold; text-transform: uppercase;">${assessment.risk_level}</span></p>
                        <p><strong>Prediction Threshold:</strong> ${assessment.threshold.toFixed(3)}</p>
                    </div>

                    <div class="card">
                        <h3>Prediction Details</h3>
                        <p><strong>Probability Score:</strong> ${probabilityPercent}%</p>
                        <p><strong>Assessment Date:</strong> ${new Date(assessment.created_at).toLocaleDateString()}</p>
                        <p><strong>Assessment ID:</strong> #${assessment.id}</p>
                    </div>
                </div>

                <div class="card" style="margin-bottom: 20px;">
                    <h3>Risk Indicator</h3>
                    <div style="background: #f0f0f0; border-radius: 10px; height: 30px; overflow: hidden;">
                        <div style="background: linear-gradient(90deg, #28a745 0%, #ffc107 50%, #dc3545 100%); height: 100%; width: ${probabilityPercent}%; transition: width 0.3s;"></div>
                    </div>
                    <div style="margin-top: 10px; display: flex; justify-content: space-between; font-size: 0.9em;">
                        <span>Low Risk (0%)</span>
                        <span>Medium Risk (50%)</span>
                        <span>High Risk (100%)</span>
                    </div>
                </div>

                <div class="card">
                    <h3>Recommendations</h3>
                    <ul style="list-style: none; padding: 0;">
                        ${getRecommendations(assessment)}
                    </ul>
                </div>

                <div style="text-align: center; margin-top: 30px;">
                    <button class="btn btn-primary" onclick="navigateTo('assessment')" style="margin-right: 10px;">New Assessment</button>
                    <button class="btn btn-secondary" onclick="navigateTo('home')">Back to Home</button>
                </div>
            </div>
        </div>
    `;
}

function getRecommendations(assessment) {
    const recommendations = [];
    const probability = assessment.probability;
    
    if (probability >= 0.7) {
        recommendations.push(`
            <li style="padding: 10px; margin-bottom: 10px; background: #ffe6e6; border-left: 4px solid #dc3545;">
                <strong>Critical Alert:</strong> The company shows high bankruptcy risk. Immediate financial restructuring is recommended.
            </li>
        `);
        recommendations.push(`
            <li style="padding: 10px; margin-bottom: 10px; background: #ffe6e6; border-left: 4px solid #dc3545;">
                <strong>Action Required:</strong> Review debt obligations, cash flow management, and operational efficiency.
            </li>
        `);
    } else if (probability >= 0.3) {
        recommendations.push(`
            <li style="padding: 10px; margin-bottom: 10px; background: #fff3cd; border-left: 4px solid #ffc107;">
                <strong>Moderate Risk:</strong> The company has some financial weaknesses that need attention.
            </li>
        `);
        recommendations.push(`
            <li style="padding: 10px; margin-bottom: 10px; background: #fff3cd; border-left: 4px solid #ffc107;">
                <strong>Recommendation:</strong> Improve profitability margins, reduce debt levels, and strengthen working capital.
            </li>
        `);
    } else {
        recommendations.push(`
            <li style="padding: 10px; margin-bottom: 10px; background: #e6ffe6; border-left: 4px solid #28a745;">
                <strong>Stable Financial Position:</strong> The company shows good financial health and low bankruptcy risk.
            </li>
        `);
        recommendations.push(`
            <li style="padding: 10px; margin-bottom: 10px; background: #e6ffe6; border-left: 4px solid #28a745;">
                <strong>Continue:</strong> Maintain current financial practices and monitor key indicators regularly.
            </li>
        `);
    }
    
    return recommendations.join('');
}
