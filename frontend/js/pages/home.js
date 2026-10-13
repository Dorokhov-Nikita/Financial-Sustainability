// Home Page
function renderHome() {
    const content = document.getElementById('content');
    
    let html = `
        <div class="page">
            <div class="hero">
                <h2>Welcome to Financial Sustainability Assessment</h2>
                <p>Analyze your company's financial health and sustainability</p>
    `;
    
    if (!currentUser) {
        html += `<button class="btn btn-primary" onclick="navigateTo('login')">Get Started</button>`;
    }
    
    html += `
            </div>

            <div class="container">
                <h3 style="text-align: center; margin-bottom: 30px;">What We Offer</h3>
                
                <div class="features-grid">
                    <div class="feature-card">
                        <h3>Financial Analysis</h3>
                        <p>Machine learning models analyze your company's financial indicators to predict distress risk using 30 or 50 key metrics</p>
                    </div>
                    <div class="feature-card">
                        <h3>Sustainability Score</h3>
                        <p>Get a detailed financial health score based on liquidity, profitability, leverage, and cash flow analysis</p>
                    </div>
                    <div class="feature-card">
                        <h3>Recommendations</h3>
                        <p>Receive personalized recommendations to improve your company's financial health and stability</p>
                    </div>
                    <div class="feature-card">
                        <h3>Analytics Dashboard</h3>
                        <p>Track and compare multiple assessments with detailed charts and comprehensive metrics analysis</p>
                    </div>
                    <div class="feature-card">
                        <h3>Historical Data</h3>
                        <p>View all your past assessments in organized history to track financial progress over time</p>
                    </div>
                    <div class="feature-card">
                        <h3>Expert Guide</h3>
                        <p>Learn about all 50 financial indicators with detailed explanations, formulas, and best practice insights</p>
                    </div>
                </div>
    `;
    
    if (!currentUser) {
        html += `
                <div style="text-align: center; margin-top: 40px;">
                    <h3>Ready to Get Started?</h3>
                    <p style="color: var(--text-light); margin-bottom: 20px;">Create an account and begin your financial sustainability journey</p>
                    <button class="btn btn-primary" onclick="navigateTo('register')">Sign Up Now</button>
                </div>
        `;
    }
    
    html += `
            </div>
        </div>
    `;
    
    content.innerHTML = html;
}


