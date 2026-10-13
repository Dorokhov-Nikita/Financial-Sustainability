// Reference Page
function renderReference() {
    const content = document.getElementById('content');
    
    const features = [
        { name: "Net Income to Total Assets", category: "Profitability", formula: "Net Income ÷ Total Assets", desc: "Measures how efficiently a company converts its assets into profit. Also known as Return on Assets (ROA). Higher values indicate better asset utilization." },
        { name: "Net worth/Assets", category: "Capital Structure", formula: "Shareholders' Equity ÷ Total Assets", desc: "Represents the proportion of assets financed by equity rather than debt. Shows financial independence and capital structure." },
        { name: "Persistent EPS in the Last Four Seasons", category: "Profitability", formula: "Sum of EPS (4 quarters) ÷ 4", desc: "Consistent earnings per share over a 4-quarter period. Measures earnings stability and reliability of profits." },
        { name: "Retained Earnings to Total Assets", category: "Capital Structure", formula: "Retained Earnings ÷ Total Assets", desc: "Shows what proportion of profits are retained in the company vs distributed as dividends. Indicates long-term profitability and reinvestment." },
        { name: "Net Income to Stockholder's Equity", category: "Profitability", formula: "Net Income ÷ Shareholders' Equity", desc: "Return on Equity (ROE) - measures profitability relative to shareholders' investment. Shows how effectively management uses equity capital." },
        { name: "Borrowing dependency", category: "Leverage", formula: "Total Debt ÷ (Total Debt + Equity)", desc: "Indicates the degree to which a company relies on borrowed funds. High ratio means more financial risk." },
        { name: "Current Liability to Assets", category: "Liquidity", formula: "Current Liabilities ÷ Total Assets", desc: "Proportion of short-term obligations relative to total assets. Lower values indicate less liquidity pressure." },
        { name: "Working Capital to Total Assets", category: "Liquidity", formula: "(Current Assets - Current Liabilities) ÷ Total Assets", desc: "Shows the percentage of assets available as working capital. Indicates operational flexibility and cash cushion." },
        { name: "Current Liability to Current Assets", category: "Liquidity", formula: "Current Liabilities ÷ Current Assets", desc: "Inverse of current ratio - measures short-term liquidity pressure. Lower is better; <1.0 is healthy." },
        { name: "Net Value Per Share (A)", category: "Valuation", formula: "Shareholders' Equity ÷ Shares Outstanding", desc: "Book value per share - represents shareholder equity divided by shares outstanding. Used in fundamental analysis." },
        { name: "Total expense/Assets", category: "Efficiency", formula: "Total Operating Expenses ÷ Total Assets", desc: "Operating efficiency ratio showing expenses relative to asset base. Lower values indicate better cost control." },
        { name: "Working Capital/Equity", category: "Capital Structure", formula: "Working Capital ÷ Shareholders' Equity", desc: "Indicates how much working capital is supported by equity. Shows operational liquidity relative to capital." },
        { name: "Equity to Long-term Liability", category: "Leverage", formula: "Shareholders' Equity ÷ Long-term Liabilities", desc: "Balance between long-term debt and shareholder equity. Higher values indicate less long-term leverage." },
        { name: "CFO to Assets", category: "Cash Flow", formula: "Operating Cash Flow ÷ Total Assets", desc: "Cash flow from operations relative to total assets. Measures quality of earnings and cash generation capability." },
        { name: "Tax rate (A)", category: "Profitability", formula: "Income Tax ÷ Pre-tax Income", desc: "Effective tax rate applied to company earnings. Used to normalize earnings across different jurisdictions." },
        { name: "Inventory and accounts receivable/Net value", category: "Efficiency", formula: "(Inventory + Accounts Receivable) ÷ Net Worth", desc: "Current asset composition relative to net worth. Shows working capital management efficiency." },
        { name: "Gross Profit to Sales", category: "Profitability", formula: "Gross Profit ÷ Sales Revenue", desc: "Gross margin - percentage of revenue remaining after cost of goods sold. Indicates pricing power and production efficiency." },
        { name: "Cash/Total Assets", category: "Liquidity", formula: "Cash and Cash Equivalents ÷ Total Assets", desc: "Liquidity indicator showing cash as proportion of assets. Higher values indicate stronger immediate liquidity." },
        { name: "Liability-Assets Flag", category: "Solvency", formula: "1 if Liabilities > Assets, 0 otherwise", desc: "Binary indicator - flag if total liabilities exceed total assets (negative equity). Critical solvency indicator." },
        { name: "Operating profit per person", category: "Efficiency", formula: "Operating Income ÷ Number of Employees", desc: "Operating income per employee - labor productivity measure. Shows revenue generation per employee." },
        { name: "Cash Reinvestment %", category: "Capital Structure", formula: "(Operating Cash Flow - Dividends) ÷ Operating Cash Flow", desc: "Percentage of cash flow reinvested in operations and growth. Indicates capital allocation priorities." },
        { name: "Quick Assets/Total Assets", category: "Liquidity", formula: "(Current Assets - Inventory) ÷ Total Assets", desc: "Quick ratio component - most liquid assets relative to total. Shows immediate liquidity position." },
        { name: "Cash/Current Liability", category: "Liquidity", formula: "Cash and Cash Equivalents ÷ Current Liabilities", desc: "Cash ratio - immediate liquidity measure. Shows how much current liabilities can be covered by cash alone." },
        { name: "Equity to Liability", category: "Leverage", formula: "Total Shareholders' Equity ÷ Total Liabilities", desc: "Solvency ratio showing equity vs total liabilities. Higher values indicate greater financial independence and lower default risk." },
        { name: "Operating Funds to Liability", category: "Solvency", formula: "Operating Cash Flow ÷ Total Liabilities", desc: "Operating cash flow relative to liabilities. Shows ability to cover all liabilities with operating cash." },
        { name: "Contingent liabilities/Net worth", category: "Risk", formula: "Contingent Liabilities ÷ Net Worth", desc: "Potential obligations relative to shareholder equity. Indicates hidden risks and potential future obligations." },
        { name: "Fixed Assets Turnover Frequency", category: "Efficiency", formula: "Sales ÷ Net Fixed Assets", desc: "Revenue generation efficiency of fixed assets. Higher values indicate better utilization of PP&E." },
        { name: "Cash Flow to Total Assets", category: "Cash Flow", formula: "Operating Cash Flow ÷ Total Assets", desc: "Operating cash generation relative to asset base. Quality of earnings indicator - shows real cash from operations." },
        { name: "Fixed Assets to Assets", category: "Capital Structure", formula: "Net Fixed Assets ÷ Total Assets", desc: "Capital intensity - proportion of fixed assets in total assets. Shows asset composition and business model type." },
        { name: "Cash Flow to Equity", category: "Cash Flow", formula: "Operating Cash Flow ÷ Shareholders' Equity", desc: "Cash generation available to shareholders. Shows how much cash operations generate per unit of equity." },
        { name: "Cash Flow Per Share", category: "Valuation", formula: "Operating Cash Flow ÷ Shares Outstanding", desc: "Operating cash flow divided by shares outstanding. Better indicator than earnings per share of actual cash available." },
        { name: "Total Asset Turnover", category: "Efficiency", formula: "Sales ÷ Average Total Assets", desc: "Revenue divided by average total assets - asset efficiency metric. Higher values indicate better asset utilization." },
        { name: "Current Ratio", category: "Liquidity", formula: "Current Assets ÷ Current Liabilities", desc: "Current assets divided by current liabilities - short-term solvency measure. Healthy range: 1.5-3.0." },
        { name: "Cash Flow to Liability", category: "Solvency", formula: "Operating Cash Flow ÷ Total Liabilities", desc: "Operating cash ability to cover all obligations. Measures debt repayment capacity from operations." },
        { name: "Total Asset Growth Rate", category: "Growth", formula: "(Assets(current year) - Assets(prior year)) ÷ Assets(prior year)", desc: "Year-over-year percentage change in total assets. Indicates company expansion or contraction." },
        { name: "Total assets to GNP price", category: "Valuation", formula: "Total Assets ÷ GNP per Capita", desc: "Company size relative to national economic output. Context-dependent metric for company scale assessment." },
        { name: "Current Assets/Total Assets", category: "Capital Structure", formula: "Current Assets ÷ Total Assets", desc: "Proportion of assets in current (liquid) form. Higher values indicate more liquid asset base." },
        { name: "Total Asset Return Growth Rate Ratio", category: "Growth", formula: "(ROA(current) - ROA(prior)) ÷ ROA(prior)", desc: "Growth rate of return on assets over time. Indicates improving or declining operational efficiency." },
        { name: "Quick Ratio", category: "Liquidity", formula: "(Current Assets - Inventory) ÷ Current Liabilities", desc: "Quick assets divided by current liabilities - immediate liquidity without inventory. Conservative liquidity measure." },
        { name: "Total debt/Total net worth", category: "Leverage", formula: "Total Debt ÷ Total Shareholders' Equity", desc: "Leverage ratio - total obligations vs equity. Higher values indicate higher financial risk and leverage." },
        { name: "After-tax Net Profit Growth Rate", category: "Growth", formula: "(Net Income(current) - Net Income(prior)) ÷ |Net Income(prior)|", desc: "Year-over-year growth in net income after taxes. Indicates improving or declining profitability." },
        { name: "Long-term fund suitability ratio (A)", category: "Solvency", formula: "Long-term Stable Funds ÷ Long-term Assets", desc: "Ability to cover long-term obligations with stable funds. Matches asset life to funding sources." },
        { name: "Research and development expense rate", category: "Innovation", formula: "R&D Expense ÷ Sales Revenue", desc: "R&D spending as percentage of revenue - innovation investment indicator. Higher in tech/pharma sectors." },
        { name: "Interest-bearing debt interest rate", category: "Cost of Debt", formula: "Total Interest Expense ÷ Average Interest-bearing Debt", desc: "Weighted average interest rate on debt obligations. Indicates cost of borrowing and creditworthiness." },
        { name: "Current Liabilities/Liability", category: "Liquidity", formula: "Current Liabilities ÷ Total Liabilities", desc: "Proportion of short-term debt vs total debt. Higher values mean more near-term payment obligations." },
        { name: "Quick Asset Turnover Rate", category: "Efficiency", formula: "Sales ÷ Average Quick Assets", desc: "Revenue per dollar of quick assets. Measures efficiency of using most liquid assets." },
        { name: "Realized Sales Gross Profit Growth Rate", category: "Growth", formula: "(Gross Profit(current) - Gross Profit(prior)) ÷ Gross Profit(prior)", desc: "Growth rate of gross profit over time. Shows if company is improving pricing power and cost control." },
        { name: "Non-industry income and expenditure/revenue", category: "Profitability", formula: "Non-Operating Income (Expense) ÷ Total Revenue", desc: "Non-operating items relative to total revenue. Shows how much profit comes from non-core activities." },
        { name: "Current Asset Turnover Rate", category: "Efficiency", formula: "Sales ÷ Average Current Assets", desc: "Revenue per dollar of current assets. Measures how efficiently working capital is used." },
        { name: "Net Worth Turnover Rate (times)", category: "Efficiency", formula: "Sales ÷ Average Shareholders' Equity", desc: "Revenue generation relative to shareholder equity. Shows how much sales are generated per unit of equity." }
    ];
    
    content.innerHTML = `
        <div class="page">
            <div class="container">
                <h2 style="margin-bottom: 30px; color: #f1f5f9;">Financial Indicators Reference Guide</h2>
                
                <div class="explanation-box">
                    <h3>Understanding Financial Ratios</h3>
                    <p>This guide explains the 50 financial indicators used in our sustainability and financial distress prediction model. 
                    Each metric includes its formula, category, and interpretation to help you understand what each indicator measures.</p>
                </div>

                <div id="referenceList"></div>
            </div>
        </div>
    `;
    
    const referenceList = document.getElementById('referenceList');
    let html = '';
    
    features.forEach((feature, index) => {
        html += `
            <div class="card" style="margin-bottom: 15px; border-left: 4px solid #3b82f6;">
                <h4 style="margin-top: 0; color: #06b6d4; margin-bottom: 4px;">${index + 1}. ${feature.name}</h4>
                <p style="color: #94a3b8; margin: 4px 0; font-size: 12px;"><strong>Category:</strong> ${feature.category}</p>
                <p style="color: #94a3b8; margin: 4px 0; font-size: 12px;"><strong>Formula:</strong> ${feature.formula}</p>
                <p style="color: #cbd5e1; margin: 8px 0; line-height: 1.6;">${feature.desc}</p>
            </div>
        `;
    });
    
    referenceList.innerHTML = html;
}


