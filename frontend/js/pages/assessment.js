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
            <p style="color: var(--text-light); margin-bottom: 20px;">Select number of indicators and enter financial data</p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div>
                    <label>Indicators:</label>
                    <select id="modelType" style="width: 100%; padding: 10px; border: 1px solid #334155; border-radius: 4px; background-color: #0f172a; color: #f1f5f9;">
                        <option value="model_30">30 indicators</option>
                        <option value="model_50">50 indicators</option>
                    </select>
                </div>
                <div>
                    <label>Company ID:</label>
                    <input type="number" id="companyId" placeholder="Optional" style="width: 100%; padding: 10px; border: 1px solid #334155; border-radius: 4px; background-color: #0f172a; color: #f1f5f9;">
                </div>
            </div>

            <div id="featuresForm"></div>
            
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button class="btn btn-success" onclick="submitAssessment()" style="flex: 1;">Analyze</button>
                <button class="btn btn-secondary" onclick="navigateTo('reference')" style="flex: 1;" title="View financial indicator explanations">📖 Reference</button>
            </div>
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
                       style="width: 100%; padding: 8px; border: 1px solid #334155; border-radius: 4px; background-color: #0f172a; color: #f1f5f9;"
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
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div>
                    <label>Indicators:</label>
                    <select id="fileModelType" style="width: 100%; padding: 10px; border: 1px solid #334155; border-radius: 4px; background-color: #0f172a; color: #f1f5f9;">
                        <option value="model_30">30 indicators</option>
                        <option value="model_50">50 indicators</option>
                    </select>
                </div>
                <div>
                    <label>Company ID:</label>
                    <input type="number" id="fileCompanyId" placeholder="Optional" style="width: 100%; padding: 10px; border: 1px solid #334155; border-radius: 4px; background-color: #0f172a; color: #f1f5f9;">
                </div>
            </div>

            <input type="file" id="csvFile" accept=".csv" style="margin-bottom: 20px;" onchange="handleCSVUpload()">
            <div id="fileError" style="color: #fca5a5; margin-bottom: 10px;"></div>
            <div id="csvFieldsContainer" style="display: none;"></div>
        </div>
    `;
}

async function handleCSVUpload() {
    try {
        const fileInput = document.getElementById('csvFile');
        const modelType = document.getElementById('fileModelType').value;
        const fileError = document.getElementById('fileError');
        const fieldsContainer = document.getElementById('csvFieldsContainer');
        
        fileError.innerText = '';
        
        if (!fileInput.files.length) {
            fieldsContainer.style.display = 'none';
            return;
        }
        
        const file = fileInput.files[0];
        const text = await file.text();
        const lines = text.trim().split('\n');
        
        if (lines.length < 2) {
            fileError.innerText = 'CSV must have at least one data row';
            fieldsContainer.style.display = 'none';
            return;
        }
        
        const rawHeaders = lines[0].split(',').map(h => h.trim());
        const headersLower = rawHeaders.map(h => h.toLowerCase());
        const headersWithSpace = rawHeaders.map(h => ' ' + h);
        const values = lines[1].split(',').map(v => parseFloat(v.trim()));
        
        const numFeatures = modelType === 'model_30' ? 30 : 50;
        const featuresToUse = allFeatures.slice(0, numFeatures);
        
        const parsedFeatures = {};
        
        for (let i = 0; i < Math.min(rawHeaders.length, values.length); i++) {
            if (isNaN(values[i])) continue;
            
            const headerLower = headersLower[i];
            const headerWithSpace = headersWithSpace[i];
            
            let feature = featuresToUse.find(f => f.name === headerLower);
            if (!feature) {
                feature = featuresToUse.find(f => f.description.toLowerCase() === headerLower);
            }
            if (!feature) {
                feature = featuresToUse.find(f => f.description === headerWithSpace.trim());
            }
            
            if (feature) {
                parsedFeatures[feature.name] = values[i];
            }
        }
        
        // Show form with parsed values
        renderCSVFieldsForm(parsedFeatures, modelType);
        fieldsContainer.style.display = 'block';
        
    } catch (error) {
        console.error('CSV Upload Error:', error);
        document.getElementById('fileError').innerText = `Error: ${error.message}`;
        document.getElementById('csvFieldsContainer').style.display = 'none';
    }
}

function renderCSVFieldsForm(parsedFeatures, modelType) {
    const numFeatures = modelType === 'model_30' ? 30 : 50;
    const featuresToUse = allFeatures.slice(0, numFeatures);
    const container = document.getElementById('csvFieldsContainer');
    
    let html = '<h4 style="margin-top: 20px; margin-bottom: 15px;">Review and Edit Values:</h4>';
    html += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">';
    
    featuresToUse.forEach(feature => {
        const value = parsedFeatures[feature.name];
        const displayValue = value !== undefined && value !== null ? value : '';
        html += `
            <div>
                <label style="display: block; margin-bottom: 5px; font-size: 0.9em;">
                    ${feature.description}
                </label>
                <input type="number" 
                       step="0.0001" 
                       id="csv_feature_${feature.name}" 
                       value="${displayValue}"
                       placeholder="Enter value (use . for decimal)" 
                       style="width: 100%; padding: 8px; border: 1px solid #334155; border-radius: 4px; background-color: #0f172a; color: #f1f5f9;"
                       onkeypress="if(event.key===','){event.preventDefault();return false;}">
            </div>
        `;
    });
    
    html += '</div>';
    html += '<div style="display: flex; gap: 10px; margin-top: 20px;">';
    html += '<button class="btn btn-success" onclick="submitCSVAnalysis()" style="flex: 1;">Analyze</button>';
    html += '<button class="btn btn-secondary" onclick="navigateTo(\'reference\')" style="flex: 1;" title="View financial indicator explanations">📖 Reference</button>';
    html += '</div>';
    
    container.innerHTML = html;
}

async function submitCSVAnalysis() {
    try {
        const modelType = document.getElementById('fileModelType').value;
        const companyId = document.getElementById('fileCompanyId').value ? parseInt(document.getElementById('fileCompanyId').value) : null;
        const numFeatures = modelType === 'model_30' ? 30 : 50;
        const featuresToUse = allFeatures.slice(0, numFeatures);
        
        const features = {};
        const emptyFields = [];
        
        for (const feature of featuresToUse) {
            const value = document.getElementById(`csv_feature_${feature.name}`).value;
            if (value === '' || value === null) {
                emptyFields.push(feature);
            } else {
                features[feature.name] = parseFloat(value);
            }
        }
        
        // If there are empty fields, show warning dialog
        if (emptyFields.length > 0) {
            showMedianFillDialog(emptyFields, features, modelType, companyId);
            return;
        }
        
        // All fields filled, proceed with analysis
        const result = await API.analyzeAssessment(modelType, features, companyId);
        currentAssessment = result;
        const assessmentIdStr = String(result.assessment_id);
        navigateTo('result', assessmentIdStr);
        
    } catch (error) {
        console.error('[ERROR] CSV Analysis failed:', error);
        document.getElementById('fileError').innerText = `Error: ${error.message}`;
    }
}

// Global variable to store pending features for median fill
let pendingMedianFill = {
    features: {},
    modelType: null,
    companyId: null
};

async function showMedianFillDialog(emptyFields, filledFeatures, modelType, companyId = null) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    
    try {
        const medianData = await API.getMedians(modelType);
        const medians = medianData.medians;
        
        // Store features globally for confirmMedianFill to access
        pendingMedianFill.features = filledFeatures;
        pendingMedianFill.modelType = modelType;
        pendingMedianFill.medians = medians;
        pendingMedianFill.companyId = companyId;
        
        const emptyFieldsList = emptyFields.map(f => f.description).join('<br>');
        
        modalBody.innerHTML = `
            <h3>Fill Missing Values?</h3>
            <p style="margin: 15px 0;">The following fields are empty:</p>
            <div style="background-color: #0f172a; border: 1px solid #334155; padding: 10px; border-radius: 4px; margin-bottom: 15px; max-height: 200px; overflow-y: auto; color: #f1f5f9;">
                ${emptyFieldsList}
            </div>
            <p style="margin-bottom: 15px;">Would you like to fill them with median values from the training data?</p>
            <div style="display: flex; gap: 10px;">
                <button class="btn btn-success" onclick="confirmMedianFill()" style="flex: 1;">Agree</button>
                <button class="btn btn-secondary" onclick="document.getElementById('modal').style.display = 'none';" style="flex: 1;">Cancel</button>
            </div>
        `;
        
        modal.style.display = 'flex';
        
    } catch (error) {
        console.error('Error fetching medians:', error);
        document.getElementById('fileError').innerText = 'Error loading median values';
    }
}

async function confirmMedianFill() {
    try {
        const { features: filledFeatures, modelType, medians, companyId } = pendingMedianFill;
        
        const numFeatures = modelType === 'model_30' ? 30 : 50;
        const featuresToUse = allFeatures.slice(0, numFeatures);
        
        // Fill in medians for empty fields
        for (const feature of featuresToUse) {
            if (!filledFeatures[feature.name] && medians[feature.name] !== undefined) {
                filledFeatures[feature.name] = medians[feature.name];
            }
        }
        
        // Close modal
        document.getElementById('modal').style.display = 'none';
        
        // Proceed with analysis
        const result = await API.analyzeAssessment(modelType, filledFeatures, companyId);
        currentAssessment = result;
        const assessmentIdStr = String(result.assessment_id);
        navigateTo('result', assessmentIdStr);
        
    } catch (error) {
        console.error('[ERROR] Analysis with medians failed:', error);
        document.getElementById('fileError').innerText = `Error: ${error.message}`;
    }
}

async function submitAssessment() {
    try {
        const modelType = document.getElementById('modelType').value;
        const companyId = document.getElementById('companyId').value ? parseInt(document.getElementById('companyId').value) : null;
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
        
        const result = await API.analyzeAssessment(modelType, features, companyId);
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

