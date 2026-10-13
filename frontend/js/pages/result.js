// Result Page
function renderResult(assessmentId) {
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
    
    loadAndDisplayResult(assessmentId);
}

async function loadAndDisplayResult(assessmentId) {
    const content = document.getElementById('content');
    
    try {
        const result = await API.getAssessment(assessmentId);
        displayResultsContent(result);
    } catch (error) {
        console.error('Failed to load assessment:', error);
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

// Key financial indicators for stability assessment
const KEY_INDICATORS_30 = {
    'net_income_assets': { name: 'Net Income to Total Assets (ROA)', category: 'Profitability' },
    'retained_earn_assets': { name: 'Retained Earnings to Total Assets', category: 'Capital' },
    'working_cap_assets': { name: 'Working Capital to Total Assets', category: 'Liquidity' },
    'equity_liability': { name: 'Equity to Liability', category: 'Leverage' },
    'cash_flow_assets': { name: 'Cash Flow to Total Assets', category: 'Cash Flow' },
    'oper_funds_liability': { name: 'Operating Funds to Liability', category: 'Leverage' },
    'cash_curr_liab': { name: 'Cash/Current Liability', category: 'Liquidity' },
    'quick_assets_assets': { name: 'Quick Assets/Total Assets', category: 'Liquidity' },
    'net_income_equity': { name: 'Net Income to Stockholder\'s Equity (ROE)', category: 'Profitability' },
    'gross_profit_sales': { name: 'Gross Profit to Sales', category: 'Profitability' }
};

const KEY_INDICATORS_50 = {
    ...KEY_INDICATORS_30,
    'current_ratio': { name: 'Current Ratio', category: 'Liquidity' },
    'total_debt_net_worth': { name: 'Total Debt/Total Net Worth', category: 'Leverage' },
    'after_tax_profit_growth': { name: 'After-tax Net Profit Growth Rate', category: 'Growth' },
    'total_asset_turnover': { name: 'Total Asset Turnover', category: 'Efficiency' }
};

function calculateStabilityMetrics(assessment) {
    const indicators = assessment.model_type === 'model_30' ? KEY_INDICATORS_30 : KEY_INDICATORS_50;
    const metrics = {
        liquidity: [],
        profitability: [],
        leverage: [],
        efficiency: [],
        growth: [],
        'cash flow': [],
        capital: []
    };
    
    // Extract values for key indicators
    Object.keys(indicators).forEach(key => {
        const value = assessment[key];
        if (value !== undefined && value !== null) {
            const category = indicators[key].category.toLowerCase();
            metrics[category].push({
                name: indicators[key].name,
                value: value,
                key: key
            });
        }
    });
    
    return metrics;
}

function analyzeStabilityFindings(assessment) {
    const metrics = calculateStabilityMetrics(assessment);
    const findings = [];
    
    // Helper function to safely get numeric value
    const getNumeric = (val) => {
        if (val === undefined || val === null) return null;
        const num = Number(val);
        return isNaN(num) ? null : num;
    };
    
    // ===== LIQUIDITY ANALYSIS =====
    if (metrics.liquidity.length > 0) {
        const currentRatio = getNumeric(assessment.current_ratio);
        const quickRatio = getNumeric(assessment.quick_assets_assets);
        const cashLiability = getNumeric(assessment.cash_curr_liab);
        const workingCap = getNumeric(assessment.working_cap_assets);
        
        if (currentRatio !== null) {
            if (currentRatio >= 1.5) {
                findings.push({ level: 'positive', text: `<strong>Strong Current Ratio:</strong> ${currentRatio.toFixed(2)}x - Company can cover short-term obligations 1.5+ times over. Excellent liquidity position.` });
            } else if (currentRatio >= 1.0) {
                findings.push({ level: 'neutral', text: `<strong>Adequate Current Ratio:</strong> ${currentRatio.toFixed(2)}x - Meets minimum standard but limited buffer for emergencies.` });
            } else {
                findings.push({ level: 'negative', text: `<strong>⚠️ Liquidity Risk:</strong> Current Ratio ${currentRatio.toFixed(2)}x below 1.0 - Company may struggle to meet short-term obligations.` });
            }
        }
        
        if (quickRatio !== null) {
            if (quickRatio >= 1.0) {
                findings.push({ level: 'positive', text: `<strong>Strong Quick Ratio:</strong> ${quickRatio.toFixed(2)}x - Without inventory, still maintains solid liquidity.` });
            } else if (quickRatio >= 0.5) {
                findings.push({ level: 'neutral', text: `<strong>Moderate Quick Ratio:</strong> ${quickRatio.toFixed(2)}x - Depends on inventory sales for full liquidity.` });
            } else {
                findings.push({ level: 'negative', text: `<strong>⚠️ Weak Quick Ratio:</strong> ${quickRatio.toFixed(2)}x - Limited liquid assets relative to current liabilities.` });
            }
        }
        
        if (workingCap !== null) {
            if (workingCap >= 0.2) {
                findings.push({ level: 'positive', text: `<strong>Healthy Working Capital:</strong> ${(workingCap * 100).toFixed(1)}% of assets - Strong operational flexibility.` });
            } else if (workingCap >= 0.05) {
                findings.push({ level: 'neutral', text: `<strong>Adequate Working Capital:</strong> ${(workingCap * 100).toFixed(1)}% of assets - Sufficient but limited room for expansion.` });
            } else if (workingCap >= 0) {
                findings.push({ level: 'negative', text: `<strong>⚠️ Tight Working Capital:</strong> ${(workingCap * 100).toFixed(1)}% of assets - Limited resources for operations and growth.` });
            } else {
                findings.push({ level: 'negative', text: `<strong>⚠️ Negative Working Capital:</strong> Current liabilities exceed current assets - Operational strain.` });
            }
        }
    }
    
    // ===== PROFITABILITY ANALYSIS =====
    if (metrics.profitability.length > 0) {
        const roa = getNumeric(assessment.net_income_assets);
        const roe = getNumeric(assessment.net_income_equity);
        const gpm = getNumeric(assessment.gross_profit_sales);
        
        if (roa !== null) {
            if (roa >= 0.1) {
                findings.push({ level: 'positive', text: `<strong>Excellent ROA:</strong> ${(roa * 100).toFixed(1)}% - Company generates strong profits from its assets.` });
            } else if (roa >= 0.05) {
                findings.push({ level: 'positive', text: `<strong>Good ROA:</strong> ${(roa * 100).toFixed(1)}% - Solid asset utilization and operational efficiency.` });
            } else if (roa > 0) {
                findings.push({ level: 'neutral', text: `<strong>Low ROA:</strong> ${(roa * 100).toFixed(1)}% - Below average profitability; operational inefficiencies exist.` });
            } else {
                findings.push({ level: 'negative', text: `<strong>⚠️ Negative ROA:</strong> ${(roa * 100).toFixed(1)}% - Operating losses indicate fundamental business problems.` });
            }
        }
        
        if (roe !== null) {
            if (roe >= 0.15) {
                findings.push({ level: 'positive', text: `<strong>Excellent ROE:</strong> ${(roe * 100).toFixed(1)}% - Strong returns on shareholder investment.` });
            } else if (roe >= 0.08) {
                findings.push({ level: 'positive', text: `<strong>Good ROE:</strong> ${(roe * 100).toFixed(1)}% - Reasonable returns for equity holders.` });
            } else if (roe > 0) {
                findings.push({ level: 'neutral', text: `<strong>Low ROE:</strong> ${(roe * 100).toFixed(1)}% - Limited return on shareholder capital.` });
            } else {
                findings.push({ level: 'negative', text: `<strong>⚠️ Negative ROE:</strong> ${(roe * 100).toFixed(1)}% - Destroying shareholder value.` });
            }
        }
        
        if (gpm !== null) {
            if (gpm >= 0.3) {
                findings.push({ level: 'positive', text: `<strong>Strong Gross Margin:</strong> ${(gpm * 100).toFixed(1)}% - Healthy pricing power and cost control.` });
            } else if (gpm >= 0.15) {
                findings.push({ level: 'neutral', text: `<strong>Moderate Gross Margin:</strong> ${(gpm * 100).toFixed(1)}% - Acceptable but room for improvement in cost management.` });
            } else {
                findings.push({ level: 'negative', text: `<strong>⚠️ Thin Gross Margin:</strong> ${(gpm * 100).toFixed(1)}% - Limited profitability on sales; vulnerable to cost increases.` });
            }
        }
    }
    
    // ===== LEVERAGE & SOLVENCY ANALYSIS =====
    if (metrics.leverage.length > 0) {
        const debtToWorth = getNumeric(assessment.total_debt_net_worth);
        const equityToLiab = getNumeric(assessment.equity_liability);
        const operFunds = getNumeric(assessment.oper_funds_liability);
        
        if (debtToWorth !== null) {
            if (debtToWorth <= 0.5) {
                findings.push({ level: 'positive', text: `<strong>Very Conservative Debt:</strong> Debt-to-Worth ${debtToWorth.toFixed(2)}x - Low financial risk; strong balance sheet.` });
            } else if (debtToWorth <= 1.0) {
                findings.push({ level: 'positive', text: `<strong>Conservative Leverage:</strong> Debt-to-Worth ${debtToWorth.toFixed(2)}x - Controlled debt levels; manageable obligations.` });
            } else if (debtToWorth <= 2.0) {
                findings.push({ level: 'neutral', text: `<strong>Moderate Leverage:</strong> Debt-to-Worth ${debtToWorth.toFixed(2)}x - Within acceptable range but requires monitoring.` });
            } else if (debtToWorth <= 3.0) {
                findings.push({ level: 'negative', text: `<strong>⚠️ High Leverage:</strong> Debt-to-Worth ${debtToWorth.toFixed(2)}x - Heavy debt dependence; limited financial flexibility.` });
            } else {
                findings.push({ level: 'negative', text: `<strong>🔴 Very High Leverage:</strong> Debt-to-Worth ${debtToWorth.toFixed(2)}x - Significant financial distress risk.` });
            }
        }
        
        if (equityToLiab !== null) {
            if (equityToLiab >= 1.0) {
                findings.push({ level: 'positive', text: `<strong>Strong Equity Cushion:</strong> Equity-to-Liability ${equityToLiab.toFixed(2)}x - Equity exceeds debt; protective buffer for creditors.` });
            } else if (equityToLiab >= 0.5) {
                findings.push({ level: 'neutral', text: `<strong>Moderate Equity Position:</strong> Equity-to-Liability ${equityToLiab.toFixed(2)}x - Reasonable but declining equity base.` });
            } else {
                findings.push({ level: 'negative', text: `<strong>⚠️ Weak Equity Position:</strong> Equity-to-Liability ${equityToLiab.toFixed(2)}x - Liabilities dominate balance sheet.` });
            }
        }
    }
    
    // ===== CASH FLOW ANALYSIS =====
    const cfToAssets = getNumeric(assessment.cash_flow_assets);
    if (cfToAssets !== null) {
        if (cfToAssets >= 0.1) {
            findings.push({ level: 'positive', text: `<strong>Excellent Cash Generation:</strong> Operating CF is ${(cfToAssets * 100).toFixed(1)}% of assets - Strong cash position supports operations and investment.` });
        } else if (cfToAssets >= 0.05) {
            findings.push({ level: 'positive', text: `<strong>Good Cash Flow:</strong> Operating CF is ${(cfToAssets * 100).toFixed(1)}% of assets - Solid cash generation from core operations.` });
        } else if (cfToAssets > 0) {
            findings.push({ level: 'neutral', text: `<strong>Weak Cash Flow:</strong> Operating CF is ${(cfToAssets * 100).toFixed(1)}% of assets - Limited cash generation despite accounting profits (quality concern).` });
        } else {
            findings.push({ level: 'negative', text: `<strong>⚠️ Negative Operating Cash Flow:</strong> Company burns cash despite reported profits - Critical red flag.` });
        }
    }
    
    // ===== CAPITAL STRUCTURE ANALYSIS =====
    if (metrics.capital.length > 0) {
        const retainedEarn = getNumeric(assessment.retained_earn_assets);
        
        if (retainedEarn !== null) {
            if (retainedEarn >= 0.2) {
                findings.push({ level: 'positive', text: `<strong>Strong Retained Earnings:</strong> ${(retainedEarn * 100).toFixed(1)}% of assets - Significant reinvested profits strengthen equity base.` });
            } else if (retainedEarn >= 0.05) {
                findings.push({ level: 'neutral', text: `<strong>Moderate Retained Earnings:</strong> ${(retainedEarn * 100).toFixed(1)}% of assets - Some profit retention but limited cumulative strength.` });
            } else if (retainedEarn >= 0) {
                findings.push({ level: 'negative', text: `<strong>⚠️ Low Retained Earnings:</strong> ${(retainedEarn * 100).toFixed(1)}% of assets - Weak internal capital accumulation; may indicate historical losses.` });
            } else {
                findings.push({ level: 'negative', text: `<strong>🔴 Negative Retained Earnings:</strong> Accumulated losses exceed profits - Balance sheet erosion.` });
            }
        }
    }
    
    // ===== GROWTH & EFFICIENCY ANALYSIS =====
    const profitGrowth = getNumeric(assessment.after_tax_profit_growth);
    if (profitGrowth !== null) {
        if (profitGrowth > 0.2) {
            findings.push({ level: 'positive', text: `<strong>Strong Growth:</strong> After-tax profit growing at ${(profitGrowth * 100).toFixed(1)}% - Expanding business and market position.` });
        } else if (profitGrowth > 0.1) {
            findings.push({ level: 'positive', text: `<strong>Healthy Growth:</strong> After-tax profit growing at ${(profitGrowth * 100).toFixed(1)}% - Positive business momentum.` });
        } else if (profitGrowth > 0) {
            findings.push({ level: 'neutral', text: `<strong>Modest Growth:</strong> After-tax profit growing at ${(profitGrowth * 100).toFixed(1)}% - Slow expansion; may indicate market maturity.` });
        } else if (profitGrowth > -0.1) {
            findings.push({ level: 'negative', text: `<strong>⚠️ Slight Decline:</strong> Profit declining at ${(profitGrowth * 100).toFixed(1)}% - Early warning of business contraction.` });
        } else {
            findings.push({ level: 'negative', text: `<strong>🔴 Sharp Decline:</strong> Profit declining at ${(profitGrowth * 100).toFixed(1)}% - Significant deterioration in profitability.` });
        }
    }
    
    const assetTurnover = getNumeric(assessment.total_asset_turnover);
    if (assetTurnover !== null) {
        if (assetTurnover >= 2.0) {
            findings.push({ level: 'positive', text: `<strong>Excellent Asset Efficiency:</strong> Total Asset Turnover ${assetTurnover.toFixed(2)}x - Highly efficient asset utilization.` });
        } else if (assetTurnover >= 1.0) {
            findings.push({ level: 'neutral', text: `<strong>Moderate Asset Turnover:</strong> ${assetTurnover.toFixed(2)}x - Reasonable asset productivity.` });
        } else {
            findings.push({ level: 'negative', text: `<strong>⚠️ Low Asset Turnover:</strong> ${assetTurnover.toFixed(2)}x - Underutilized assets; capital-intensive operations.` });
        }
    }
    
    return findings;
}

function generateStabilityConclusion(assessment) {
    const prob = assessment.probability;
    const metrics = calculateStabilityMetrics(assessment);
    const findings = analyzeStabilityFindings(assessment);
    
    // Count positive, neutral, negative findings
    const positiveCount = findings.filter(f => f.level === 'positive').length;
    const neutralCount = findings.filter(f => f.level === 'neutral').length;
    const negativeCount = findings.filter(f => f.level === 'negative').length;
    
    let conclusion = '';
    
    // ML prediction takes precedence
    if (prob > 0.85) {
        conclusion = `<strong>🔴 Critical Financial Distress:</strong> The predictive model indicates extremely high probability of financial difficulties. 
        The company shows multiple signs of severe stress: `;
        if (positiveCount === 0) {
            conclusion += `fundamental analysis confirms this with no positive indicators across liquidity, profitability, and leverage metrics. 
            Immediate and comprehensive financial restructuring is essential.`;
        } else {
            conclusion += `though some positive indicators exist (${positiveCount} strong metrics), the overall financial position remains precarious. 
            Urgent intervention required.`;
        }
    } else if (prob > 0.65) {
        conclusion = `<strong>🟠 High Financial Risk:</strong> The model detects significant warning signs of potential financial distress. 
        Fundamental analysis shows ${positiveCount} positive indicators, but ${negativeCount} concerning factors dominate. 
        Close monitoring and swift corrective actions are necessary to prevent deterioration.`;
    } else if (prob > 0.45) {
        conclusion = `<strong>🟡 Moderate Risk - Mixed Signals:</strong> The company exhibits mixed financial indicators with considerable vulnerabilities. 
        Positive metrics: ${positiveCount}, Concerns: ${negativeCount}. While currently operational, key weaknesses in 
        ${negativeCount > 2 ? 'multiple areas' : 'critical areas'} should be urgently addressed to ensure stability.`;
    } else if (prob > 0.25) {
        conclusion = `<strong>🔵 Caution - Manageable Concerns:</strong> The company appears generally financially stable with ${positiveCount} strong indicators, 
        but ${negativeCount > 0 ? `${negativeCount} areas requiring attention` : 'minimal concerns'}. 
        Some operational efficiencies could be improved to strengthen the balance sheet further.`;
    } else {
        conclusion = `<strong>🟢 Strong Financial Health:</strong> The company demonstrates solid financial stability with ${positiveCount} positive indicators 
        across all key areas. ${negativeCount > 0 ? `While ${negativeCount} minor concern(s) exist, they are manageable.` : 'No significant red flags detected.'} 
        Financial position appears sustainable and well-positioned for operations and growth.`;
    }
    
    return conclusion;
}

function renderStabilityFindings(findings) {
    if (!findings || findings.length === 0) {
        return '<p style="color: #94a3b8;">No financial data available for analysis.</p>';
    }
    
    let html = '';
    
    findings.forEach((finding, index) => {
        let bgColor, borderColor, textColor, icon;
        
        if (finding.level === 'positive') {
            bgColor = 'rgba(16, 185, 129, 0.1)';
            borderColor = '#10b981';
            textColor = '#d1fae5';
            icon = '✓';
        } else if (finding.level === 'neutral') {
            bgColor = 'rgba(245, 158, 11, 0.1)';
            borderColor = '#f59e0b';
            textColor = '#fef3c7';
            icon = '→';
        } else {
            bgColor = 'rgba(239, 68, 68, 0.1)';
            borderColor = '#ef4444';
            textColor = '#fee2e2';
            icon = '!';
        }
        
        html += `
            <div style="background-color: ${bgColor}; border-left: 4px solid ${borderColor}; padding: 16px 18px; margin-bottom: 12px; border-radius: 8px;">
                <p style="margin: 0; font-size: 0.95em; line-height: 1.7; color: ${textColor};">
                    ${finding.text}
                </p>
            </div>
        `;
    });
    
    return html;
}

function displayResultsContent(assessment) {
    const content = document.getElementById('content');
    
    // Check for errors from backend
    if (assessment.shap_error) {
        console.warn('[SHAP Error]', assessment.shap_error);
    }
    if (assessment.model_error) {
        console.warn('[Model Error]', assessment.model_error);
    }
    
    const probabilityPercent = (assessment.probability * 100).toFixed(2);
    
    // Determine status color and display text
    let statusColor, statusBgGradient;
    const prob = assessment.probability;
    
    if (prob > 0.85) {
        statusColor = '#dc3545';
        statusBgGradient = 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
    } else if (prob > 0.65) {
        statusColor = '#fd7e14';
        statusBgGradient = 'linear-gradient(135deg, #fd7e14 0%, #e86c0c 100%)';
    } else if (prob > 0.45) {
        statusColor = '#ffc107';
        statusBgGradient = 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)';
    } else if (prob > 0.25) {
        statusColor = '#17a2b8';
        statusBgGradient = 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)';
    } else {
        statusColor = '#28a745';
        statusBgGradient = 'linear-gradient(135deg, #28a745 0%, #218838 100%)';
    }
    
    const statusDisplayText = assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1);
    const modelTypeText = assessment.model_type === 'model_30' ? '30 indicators' : '50 indicators';
    
    // Calculate stability metrics and findings
    const stabilityFindings = analyzeStabilityFindings(assessment);
    const stabilityConclusion = generateStabilityConclusion(assessment);
    
    // Render top features section (only if no errors and we have features)
    const topFeaturesHtml = (assessment.top_features && assessment.top_features.length > 0 && !assessment.shap_error) 
        ? renderTopFeatures(assessment.top_features) 
        : renderNoFeaturesWarning(assessment);
    
    // Render stability findings
    const findingsHtml = renderStabilityFindings(stabilityFindings);
    
    content.innerHTML = `
        <div class="page">
            <div class="container">
                <h2 style="margin-bottom: 30px;">Financial Sustainability Assessment</h2>

                <!-- UPPER SECTION: Stability Analysis -->
                <div style="margin-bottom: 40px;">
                    <div class="card" style="background: ${statusBgGradient}; color: white; padding: 30px; margin-bottom: 20px;">
                        <div style="text-align: center;">
                            <h3>Financial Distress Assessment</h3>
                            <div style="font-size: 3em; font-weight: bold; margin: 20px 0; text-transform: uppercase;">${statusDisplayText}</div>
                            <div style="font-size: 1.2em;">
                                Predicted Financial Distress Score: <strong>${probabilityPercent}%</strong>
                            </div>
                        </div>
                    </div>

                    <div class="card" style="background-color: rgba(59, 130, 246, 0.15); border-left: 4px solid #3b82f6; margin-bottom: 20px; padding: 15px;">
                        <h4 style="margin-top: 0; color: #60a5fa;">📊 What Does This Score Mean?</h4>
                        <p style="margin: 10px 0; color: #cbd5e1;">
                            The <strong>Predicted Financial Distress Score</strong> (0-100%) indicates the probability that the company 
                            may experience significant financial difficulties. Higher scores suggest greater risk of financial distress, 
                            including potential inability to meet obligations, liquidity challenges, or operational difficulties.
                        </p>
                        <ul style="margin: 10px 0; padding-left: 20px;">
                            <li><strong>0-25%:</strong> Low Risk - Company appears financially stable</li>
                            <li><strong>25-45%:</strong> Caution - Some financial weaknesses present</li>
                            <li><strong>45-65%:</strong> Alert - Moderate risk indicators detected</li>
                            <li><strong>65-85%:</strong> Warning - Significant financial concerns</li>
                            <li><strong>85-100%:</strong> Critical - High probability of financial distress</li>
                        </ul>
                    </div>

                    <div class="card" style="margin-bottom: 20px;">
                        <h3>📊 Comprehensive Financial Stability Analysis</h3>
                        <p style="color: var(--text-light); margin-bottom: 15px;">
                            Detailed assessment of key financial indicators - independent of machine learning predictions. 
                            Analyzes liquidity, profitability, leverage, cash generation, and growth trends:
                        </p>
                        ${findingsHtml}
                    </div>

                    <div class="card" style="background-color: rgba(16, 185, 129, 0.15); border-left: 4px solid #10b981; margin-bottom: 20px; padding: 15px;">
                        <h4 style="margin-top: 0; color: #6ee7b7;">📋 Financial Stability Conclusion</h4>
                        <p style="margin: 10px 0; font-size: 1em; line-height: 1.6; color: #cbd5e1;">
                            ${stabilityConclusion}
                        </p>
                    </div>

                    <div class="card">
                        <h3>Recommendations</h3>
                        <ul style="list-style: none; padding: 0;">
                            ${getRecommendations(assessment)}
                        </ul>
                    </div>
                </div>

                <!-- LOWER SECTION: Model Parameters & Technical Details -->
                <div style="border-top: 3px solid #ddd; padding-top: 30px; margin-top: 40px;">
                    <h3 style="margin-bottom: 20px; color: #666;">Model Parameters & Detailed Analysis</h3>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <div class="card">
                            <h3>Model Details</h3>
                            <p><strong>Model Used:</strong> ${assessment.model_type === 'model_30' ? 'Random Forest - 30 indicators' : 'LightGBM with SMOTE - 50 indicators'}</p>
                            <p><strong>Risk Category:</strong> <span style="color: ${statusColor}; font-weight: bold; text-transform: uppercase;">${statusDisplayText}</span></p>
                            <p><strong>Prediction Threshold:</strong> ${assessment.threshold !== null ? assessment.threshold.toFixed(3) : 'N/A'}</p>
                        </div>

                        <div class="card">
                            <h3>Assessment Information</h3>
                            <p><strong>Distress Score:</strong> ${probabilityPercent}%</p>
                            <p><strong>Assessment Date:</strong> ${new Date(assessment.created_at).toLocaleDateString()}</p>
                            <p><strong>Assessment ID:</strong> #${assessment.id}</p>
                        </div>
                    </div>

                    <div class="card" style="margin-bottom: 20px;">
                        <h3>Financial Distress Risk Indicator</h3>
                        <div style="background: #334155; border-radius: 10px; height: 30px; overflow: hidden;">
                            <div style="background: linear-gradient(90deg, #10b981 0%, #f59e0b 50%, #ef4444 100%); height: 100%; width: ${probabilityPercent}%; transition: width 0.3s;"></div>
                        </div>
                        <div style="margin-top: 10px; display: flex; justify-content: space-between; font-size: 0.9em; color: #94a3b8;">
                            <span>Low Risk (0%)</span>
                            <span>Medium Risk (50%)</span>
                            <span>High Risk (100%)</span>
                        </div>
                    </div>

                    ${topFeaturesHtml}

                    <div style="text-align: center; margin-top: 30px;">
                        <button class="btn btn-primary" onclick="navigateTo('assessment')" style="margin-right: 10px;">New Assessment</button>
                        <button class="btn btn-secondary" onclick="navigateTo('home')">Back to Home</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderTopFeatures(topFeatures) {
    if (!topFeatures || topFeatures.length === 0) {
        return '';
    }
    
    let html = `
        <div class="card" style="margin-bottom: 20px;">
            <h3>🔍 Most Influential Financial Indicators</h3>
            <p style="color: var(--text-light); margin-bottom: 15px;">
                These indicators had the strongest impact on the financial distress prediction:
            </p>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 2px solid #334155;">
                            <th style="text-align: left; padding: 10px; color: #60a5fa;">Indicator</th>
                            <th style="text-align: right; padding: 10px; color: #60a5fa;">Current Value</th>
                            <th style="text-align: right; padding: 10px; color: #60a5fa;">Impact</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    topFeatures.forEach((feature, index) => {
        const shap = feature.shap_value;
        const impactBar = Math.abs(shap) > 0.5 ? '█' : (Math.abs(shap) > 0.2 ? '▓' : '░');
        
        html += `
            <tr style="border-bottom: 1px solid #334155;">
                <td style="padding: 10px; color: #cbd5e1;"><strong>${index + 1}. ${feature.feature}</strong></td>
                <td style="text-align: right; padding: 10px; color: #cbd5e1;">${typeof feature.value === 'number' ? feature.value.toFixed(4) : feature.value}</td>
                <td style="text-align: right; padding: 10px;">
                    <div style="background: #334155; border-radius: 4px; padding: 4px; font-family: monospace; font-size: 0.9em; color: #60a5fa;">
                        ${impactBar.repeat(Math.min(5, Math.ceil(Math.abs(shap) * 10)))} ${Math.abs(shap).toFixed(3)}
                    </div>
                </td>
            </tr>
        `;
    });
    
    html += `
                    </tbody>
                </table>
            </div>
            <p style="color: #94a3b8; margin-top: 15px; font-size: 0.9em;">
                <strong>Note:</strong> SHAP values show how each indicator contributed to the final prediction. 
                Positive values increase financial distress risk, negative values reduce it.
            </p>
        </div>
    `;
    
    return html;
}

function renderNoFeaturesWarning(assessment) {
    if (assessment.shap_error) {
        return `
            <div class="card" style="background-color: rgba(245, 158, 11, 0.15); border-left: 4px solid #f59e0b; margin-bottom: 20px; padding: 15px;">
                <h4 style="margin-top: 0; color: #fcd34d;">⚠️ Feature Importance Unavailable</h4>
                <p style="margin: 10px 0; color: #cbd5e1;">
                    The detailed analysis of which indicators contributed most to this prediction could not be calculated.
                </p>
                <p style="margin: 10px 0; font-size: 0.9em; color: #666;">
                    However, the overall distress score and recommendations above are still valid based on your financial data.
                </p>
            </div>
        `;
    }
    return '';
}


function getRecommendations(assessment) {
    const recommendations = [];
    const probability = assessment.probability;
    
    if (probability >= 0.7) {
        recommendations.push(`
            <li style="padding: 12px 15px; margin-bottom: 12px; background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; color: #fee2e2; border-radius: 6px;">
                <strong>Critical Alert:</strong> The company shows high financial distress risk. Immediate financial restructuring is recommended.
            </li>
        `);
        recommendations.push(`
            <li style="padding: 12px 15px; margin-bottom: 12px; background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; color: #fee2e2; border-radius: 6px;">
                <strong>Action Required:</strong> Review debt obligations, cash flow management, and operational efficiency.
            </li>
        `);
    } else if (probability >= 0.3) {
        recommendations.push(`
            <li style="padding: 12px 15px; margin-bottom: 12px; background: rgba(245, 158, 11, 0.1); border-left: 4px solid #f59e0b; color: #fef3c7; border-radius: 6px;">
                <strong>Moderate Risk:</strong> The company has some financial weaknesses that need attention.
            </li>
        `);
        recommendations.push(`
            <li style="padding: 12px 15px; margin-bottom: 12px; background: rgba(245, 158, 11, 0.1); border-left: 4px solid #f59e0b; color: #fef3c7; border-radius: 6px;">
                <strong>Recommendation:</strong> Improve profitability margins, reduce debt levels, and strengthen working capital.
            </li>
        `);
    } else {
        recommendations.push(`
            <li style="padding: 12px 15px; margin-bottom: 12px; background: rgba(16, 185, 129, 0.1); border-left: 4px solid #10b981; color: #d1fae5; border-radius: 6px;">
                <strong>Stable Financial Position:</strong> The company shows good financial health and low distress risk.
            </li>
        `);
        recommendations.push(`
            <li style="padding: 12px 15px; margin-bottom: 12px; background: rgba(16, 185, 129, 0.1); border-left: 4px solid #10b981; color: #d1fae5; border-radius: 6px;">
                <strong>Continue:</strong> Maintain current financial practices and monitor key indicators regularly.
            </li>
        `);
    }
    
    return recommendations.join('');
}
