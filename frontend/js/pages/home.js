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
                        <p>Comprehensive analysis of your company's financial indicators and ratios</p>
                    </div>
                    <div class="feature-card">
                        <h3>Sustainability Score</h3>
                        <p>Get a detailed sustainability score based on industry standards</p>
                    </div>
                    <div class="feature-card">
                        <h3>Recommendations</h3>
                        <p>Personalized recommendations to improve financial health</p>
                    </div>
                    <div class="feature-card">
                        <h3>Analytics Dashboard</h3>
                        <p>Track your progress with detailed analytics and charts</p>
                    </div>
                    <div class="feature-card">
                        <h3>Historical Data</h3>
                        <p>Compare assessments over time to track improvements</p>
                    </div>
                    <div class="feature-card">
                        <h3>Expert Guide</h3>
                        <p>Learn about financial indicators with our comprehensive reference guide</p>
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
