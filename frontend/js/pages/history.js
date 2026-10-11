// History Page Module
function renderHistoryPage() {
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

    loadHistoryData();
}

async function loadHistoryData() {
    try {
        const data = await API.getAssessmentHistory();
        const assessments = data.assessments || [];
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
                            <th>Model</th>
                            <th>Status</th>
                            <th>Probability</th>
                            <th>Actions</th>
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

        html += `
            <tr>
                <td>#${assessment.id}</td>
                <td>${date}</td>
                <td>${modelName}</td>
                <td><span class="badge ${statusClass}">${statusDisplayText}</span></td>
                <td>${probabilityPercent}%</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-primary" onclick="navigateTo('result', '${assessment.id}')">View</button>
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
