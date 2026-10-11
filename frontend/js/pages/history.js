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
        const assessments = await API.getAssessments();
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

    // Sort by date descending
    const sorted = assessments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    let html = `
        <div class="card">
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Date</th>
                            <th>Revenue</th>
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
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        const revenue = assessment.revenue ? '$' + (assessment.revenue / 1000000).toFixed(1) + 'M' : '-';

        html += `
            <tr>
                <td><strong>${assessment.title}</strong></td>
                <td>${date}</td>
                <td>${revenue}</td>
                <td>${score}</td>
                <td><span class="badge ${health === 'Excellent' ? 'badge-success' : health === 'Good' ? 'badge-info' : health === 'Fair' ? 'badge-warning' : health === 'Poor' ? 'badge-danger' : 'badge-info'}">${health}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-primary" onclick="navigateTo('result', ${assessment.id})">View</button>
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
