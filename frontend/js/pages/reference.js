// Reference Page
function renderReference() {
    const content = document.getElementById('content');
    
    const features = [
        { name: "Net Income to Total Assets", desc: "Measures how efficiently a company converts its assets into profit." },
        { name: "Net worth/Assets", desc: "Represents the proportion of assets financed by equity." },
        { name: "Persistent EPS in the Last Four Seasons", desc: "Consistent earnings per share over a 4-quarter period." },
        { name: "Retained Earnings to Total Assets", desc: "Shows how much profit is retained in the company vs distributed." },
        { name: "Net Income to Stockholder's Equity", desc: "Return on equity (ROE) - measures profitability relative to shareholders' investment." },
        { name: "Borrowing dependency", desc: "Indicates the degree to which a company relies on borrowed funds." },
        { name: "Current Liability to Assets", desc: "Proportion of short-term obligations relative to total assets." },
        { name: "Working Capital to Total Assets", desc: "Shows the percentage of assets available as working capital." },
        { name: "Current Liability to Current Assets", desc: "Current ratio measure of short-term liquidity." },
        { name: "Net Value Per Share (A)", desc: "Book value per share - shareholder equity divided by shares outstanding." },
        { name: "Total expense/Assets", desc: "Operating efficiency ratio showing expenses relative to asset base." },
        { name: "Working Capital/Equity", desc: "Indicates how much working capital is supported by equity." },
        { name: "Equity to Long-term Liability", desc: "Balance between long-term debt and shareholder equity." },
        { name: "CFO to Assets", desc: "Cash flow from operations relative to total assets." },
        { name: "Tax rate (A)", desc: "Effective tax rate applied to company earnings." },
        { name: "Inventory and accounts receivable/Net value", desc: "Current asset composition relative to net worth." },
        { name: "Gross Profit to Sales", desc: "Gross margin - percentage of revenue remaining after COGS." },
        { name: "Cash/Total Assets", desc: "Liquidity indicator showing cash as proportion of assets." },
        { name: "Liability-Assets Flag", desc: "Binary indicator if liabilities exceed assets." },
        { name: "Operating profit per person", desc: "Operating income per employee - labor productivity measure." },
        { name: "Cash Reinvestment %", desc: "Percentage of cash flow reinvested in operations." },
        { name: "Quick Assets/Total Assets", desc: "Quick ratio component - most liquid assets relative to total." },
        { name: "Cash/Current Liability", desc: "Cash ratio - immediate liquidity measure." },
        { name: "Equity to Liability", desc: "Solvency ratio showing equity vs total liabilities." },
        { name: "Operating Funds to Liability", desc: "Operating cash flow relative to liabilities." },
        { name: "Contingent liabilities/Net worth", desc: "Potential obligations relative to shareholder equity." },
        { name: "Fixed Assets Turnover Frequency", desc: "Revenue generation efficiency of fixed assets." },
        { name: "Cash Flow to Total Assets", desc: "Operating cash generation relative to asset base." },
        { name: "Fixed Assets to Assets", desc: "Capital intensity - proportion of fixed assets." },
        { name: "Cash Flow to Equity", desc: "Cash generation available to shareholders." },
        { name: "Cash Flow Per Share", desc: "Operating cash flow divided by shares outstanding." },
        { name: "Total Asset Turnover", desc: "Revenue divided by average total assets - asset efficiency." },
        { name: "Current Ratio", desc: "Current assets divided by current liabilities - short-term solvency." },
        { name: "Cash Flow to Liability", desc: "Operating cash ability to cover obligations." },
        { name: "Total Asset Growth Rate", desc: "Year-over-year percentage change in total assets." },
        { name: "Total assets to GNP price", desc: "Company size relative to national economic output." },
        { name: "Current Assets/Total Assets", desc: "Proportion of assets in current (liquid) form." },
        { name: "Total Asset Return Growth Rate Ratio", desc: "Growth rate of return on assets over time." },
        { name: "Quick Ratio", desc: "Quick assets divided by current liabilities - immediate liquidity." },
        { name: "Total debt/Total net worth", desc: "Leverage ratio - total obligations vs equity." },
        { name: "After-tax Net Profit Growth Rate", desc: "Year-over-year growth in net income after taxes." },
        { name: "Long-term fund suitability ratio (A)", desc: "Ability to cover long-term obligations with stable funds." },
        { name: "Research and development expense rate", desc: "R&D spending as percentage of revenue - innovation investment." },
        { name: "Interest-bearing debt interest rate", desc: "Weighted average interest rate on debt obligations." },
        { name: "Current Liabilities/Liability", desc: "Proportion of short-term debt vs total debt." },
        { name: "Quick Asset Turnover Rate", desc: "Revenue per dollar of quick assets." },
        { name: "Realized Sales Gross Profit Growth Rate", desc: "Growth rate of gross profit over time." },
        { name: "Non-industry income and expenditure/revenue", desc: "Non-operating items relative to total revenue." },
        { name: "Current Asset Turnover Rate", desc: "Revenue per dollar of current assets." },
        { name: "Net Worth Turnover Rate (times)", desc: "Revenue generation relative to shareholder equity." }
    ];
    
    content.innerHTML = `
        <div class="page">
            <div class="container">
                <h2 style="margin-bottom: 30px;">Financial Indicators Reference Guide</h2>
                
                <div class="card" style="margin-bottom: 20px; background: #f8f9fa;">
                    <h3>Understanding Financial Ratios</h3>
                    <p>This guide explains the 50 financial indicators used in our bankruptcy risk assessment model. 
                    These ratios are calculated from financial statements and provide insights into company profitability, 
                    liquidity, efficiency, and solvency.</p>
                </div>

                <div id="referenceList"></div>
            </div>
        </div>
    `;
    
    const referenceList = document.getElementById('referenceList');
    let html = '';
    
    features.forEach((feature, index) => {
        html += `
            <div class="card" style="margin-bottom: 15px; border-left: 4px solid #667eea;">
                <h4 style="margin-top: 0; color: #667eea;">${index + 1}. ${feature.name}</h4>
                <p style="color: var(--text-light); margin: 0;">${feature.desc}</p>
            </div>
        `;
    });
    
    referenceList.innerHTML = html;
}
