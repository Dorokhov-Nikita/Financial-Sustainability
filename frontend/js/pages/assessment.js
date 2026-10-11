// Assessment Page
let currentAssessment = null;
let allFeatures = [];

async function renderAssessment() {
    const content = document.getElementById('content');
    
    try {
        // Load feature info
        const response = await API.getFeatures();
        allFeatures = response.features;
    } catch (error) {
        console.error('Error loading features:', error);
    }
    
    content.innerHTML = `
        <div class="page">
            <div class="container">
                <h2 style="margin-bottom: 30px;">Financial Assessment</h2>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <button class="btn btn-primary" onclick="showInputMode()" style="padding: 15px;">Manual Input</button>
                    <button class="btn btn-primary" onclick="showFileMode()" style="padding: 15px;">Upload CSV</button>
                </div>

                <div id="assessmentMode"></div>
            </div>
        </div>
    `;

    // Show input mode by default
    showInputMode();
}

function showInputMode() {
    const modeDiv = document.getElementById('assessmentMode');
    
    modeDiv.innerHTML = `
        <div class="card">
            <h3>Enter Financial Indicators</h3>
            <p style="color: var(--text-light); margin-bottom: 20px;">Select model type and enter financial data</p>
            
            <div style="margin-bottom: 20px;">
                <label>Model Type:</label>
                <select id="modelType" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                    <option value="model_30">Random Forest (30 Features)</option>
                    <option value="model_50">LightGBM SMOTE (50 Features)</option>
                </select>
            </div>

            <div id="featuresForm"></div>
            
            <button class="btn btn-success" onclick="submitAssessment()" style="width: 100%; margin-top: 20px;">Analyze</button>
        </div>
    `;
    
    updateFeaturesForm();
    
    document.getElementById('modelType').addEventListener('change', updateFeaturesForm);
}

function updateFeaturesForm() {
    const modelType = document.getElementById('modelType').value;
    const numFeatures = modelType === 'model_30' ? 30 : 50;
    const formDiv = document.getElementById('featuresForm');
    
    formDiv.innerHTML = '';
    
    const features = allFeatures.slice(0, numFeatures);
    
    let html = '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">';
    
    features.forEach(feature => {
        html += `
            <div>
                <label style="display: block; margin-bottom: 5px; font-size: 0.9em;">
                    ${feature.description}
                </label>
                <input type="number" 
                       step="0.0001" 
                       id="feature_${feature.name}" 
                       placeholder="Enter value (use . for decimal)" 
                       style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
                       onkeypress="if(event.key===','){event.preventDefault();return false;}">
            </div>
        `;
    });
    
    html += '</div>';
    formDiv.innerHTML = html;
}

function showFileMode() {
    const modeDiv = document.getElementById('assessmentMode');
    
    modeDiv.innerHTML = `
        <div class="card">
            <h3>Upload CSV File</h3>
            <p style="color: var(--text-light); margin-bottom: 20px;">CSV should have columns matching the financial indicators</p>
            
            <div style="margin-bottom: 20px;">
                <label>Model Type:</label>
                <select id="fileModelType" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                    <option value="model_30">Random Forest (30 Features)</option>
                    <option value="model_50">LightGBM SMOTE (50 Features)</option>
                </select>
            </div>

            <input type="file" id="csvFile" accept=".csv" style="margin-bottom: 20px;">
            <div id="fileError" style="color: red; margin-bottom: 10px;"></div>
            
            <button class="btn btn-success" onclick="submitCSV()" style="width: 100%;">Analyze</button>
        </div>
    `;
}

async function submitAssessment() {
    try {
        const modelType = document.getElementById('modelType').value;
        const numFeatures = modelType === 'model_30' ? 30 : 50;
        
        const features = {};
        const featuresToUse = allFeatures.slice(0, numFeatures);
        
        let isValid = true;
        for (const feature of featuresToUse) {
            const value = document.getElementById(`feature_${feature.name}`).value;
            if (!value) {
                showAlert('assessmentAlert', `Missing value for ${feature.description}`, 'error');
                isValid = false;
                break;
            }
            features[feature.name] = parseFloat(value);
        }
        
        if (!isValid) return;
        
        const result = await API.analyzeAssessment(modelType, features);
        currentAssessment = result;
        const assessmentIdStr = String(result.assessment_id);
        navigateTo('result', assessmentIdStr);
        
    } catch (error) {
        console.error('[ERROR] Analysis failed:', error);
        showAlert('assessmentAlert', `Error: ${error.message}`, 'error');
    }
}

async function submitCSV() {
    try {
        const fileInput = document.getElementById('csvFile');
        const modelType = document.getElementById('fileModelType').value;
        
        if (!fileInput.files.length) {
            document.getElementById('fileError').innerText = 'Please select a file';
            return;
        }
        
        const file = fileInput.files[0];
        const text = await file.text();
        const lines = text.trim().split('\n');
        
        // Try to parse headers - handle both with and without leading spaces
        const rawHeaders = lines[0].split(',').map(h => h.trim());
        const headersLower = rawHeaders.map(h => h.toLowerCase());
        const headersWithSpace = rawHeaders.map(h => ' ' + h);
        
        if (lines.length < 2) {
            document.getElementById('fileError').innerText = 'CSV must have at least one data row';
            return;
        }
        
        const values = lines[1].split(',').map(v => parseFloat(v.trim()));
        
        const features = {};
        const numFeatures = modelType === 'model_30' ? 30 : 50;
        const featuresToUse = allFeatures.slice(0, numFeatures);
        
        for (let i = 0; i < Math.min(rawHeaders.length, values.length); i++) {
            if (isNaN(values[i])) continue;
            
            const headerLower = headersLower[i];
            const headerWithSpace = headersWithSpace[i];
            
            // Try to find matching feature
            let feature = featuresToUse.find(f => f.name === headerLower);
            if (!feature) {
                feature = featuresToUse.find(f => f.description.toLowerCase() === headerLower);
            }
            if (!feature) {
                feature = featuresToUse.find(f => f.description === headerWithSpace.trim());
            }
            
            if (feature) {
                features[feature.name] = values[i];
            }
        }
        
        console.log('[submitCSV] About to call API.analyzeAssessment with modelType:', modelType);
        const result = await API.analyzeAssessment(modelType, features);
        console.log('[submitCSV] CSV Analysis result from API:', result);
        console.log('[submitCSV] result.assessment_id:', result.assessment_id, 'type:', typeof result.assessment_id);
        
        currentAssessment = result;
        const assessmentIdStr = String(result.assessment_id);
        console.log('[submitCSV] After String() conversion:', assessmentIdStr, 'type:', typeof assessmentIdStr);
        console.log('[submitCSV] About to call navigateTo with:', 'result', assessmentIdStr);
        navigateTo('result', assessmentIdStr);
        
    } catch (error) {
        console.error('[ERROR] CSV Analysis failed:', error);
        document.getElementById('fileError').innerText = `Error: ${error.message}`;
    }
}

function showAlert(elementId, message, type = 'info') {
    const div = document.createElement('div');
    div.className = `alert alert-${type}`;
    div.innerText = message;
    
    const container = document.getElementById(elementId);
    if (container) {
        container.innerHTML = '';
        container.appendChild(div);
    }
}
