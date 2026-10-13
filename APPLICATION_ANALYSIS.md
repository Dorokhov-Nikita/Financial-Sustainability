# Financial Sustainability Assessment Application - Complete Analysis

## 📋 Overview
A full-stack web application for predicting financial distress and assessing company bankruptcy risk. Uses machine learning models with 30 or 50 financial indicators, integrated with PostgreSQL backend (Supabase).

**Stack:**
- **Frontend:** HTML, CSS, JavaScript (Vanilla, no frameworks)
- **Backend:** Flask (Python)
- **Database:** PostgreSQL (Supabase)
- **ML Models:** LightGBM and Random Forest (model_30: 30 indicators, model_50: 50 indicators)
- **Charts:** Chart.js
- **Explanation:** SHAP (SHapley Additive exPlanations)

---

## 🔄 User Flow & Authentication

### 1. **Application Entry Point (main.js)**

**On page load:**
- `DOMContentLoaded` → `checkAuthentication()` → `updateUI()`
- If authenticated: `navigateTo('home')`
- If not authenticated: `navigateTo('login')`

**Session Management:**
- Uses Flask session (filesystem-based, server-side)
- Credentials: `credentials: 'include'` in all API requests (cookies sent automatically)
- Session check: `API.checkAuth()` → `/api/auth/check` returns `{authenticated: bool, user_id: int}`

### 2. **Register Page (auth.js - register)**
**Input fields:**
- Username (text, unique, required)
- Email (text, unique, required)
- Password (text, required)

**Process:**
1. User submits form
2. API calls `POST /api/auth/register`
3. Backend validates: username/email uniqueness, all fields present
4. Password hashed with werkzeug.security.generate_password_hash()
5. User record created in `user_data` table (Supabase): `{id, email, password, username}`
6. **Server sets session:** `session['user_id'] = user.id`, `session['username'] = user.username`
7. Response returns `{message, user: {id, username, email}}`
8. **Frontend immediately redirects to Home** (auto-login after register)

### 3. **Login Page (auth.js - login)**
**Input fields:**
- Username (text, required)
- Password (text, required)

**Process:**
1. User submits form
2. API calls `POST /api/auth/login`
3. Backend queries `user_data` table by username
4. Compares password with `user.check_password(password)` (werkzeug hash comparison)
5. If valid: sets session `{user_id, username}`
6. Returns user object
7. Frontend redirects to Home

**On logout:** `session.clear()` (server-side), frontend redirects to login

### 4. **Home Page (home.js)**
**For unauthenticated users:**
- Shows welcome text and feature list
- "Sign In" and "Sign Up" buttons to auth pages

**For authenticated users:**
- Welcome message: "Welcome to Financial Sustainability Assessment"
- Explains application purpose
- Lists available features

**Navigation header:**
- Changes based on auth state
- For authenticated: Home, Assessment, History, Analytics, Reference + Profile button + Logout button
- For unauthenticated: Home, Login, Register

---

## 📊 Assessment Workflow

### 5. **Assessment Page (assessment.js)**

**Two input modes:**

#### **Mode A: Manual Input**
1. Select Model Type: "30 indicators" or "50 indicators"
2. Enter Company ID (optional, for filtering later)
3. Form dynamically shows 30 or 50 input fields based on model selection
4. Each field represents a financial indicator (e.g., "Net Income to Total Assets")
5. User enters decimal values
6. "Analyze" button submits

**Form layout:** 2-column grid, input fields styled with dark background (#0f172a)

#### **Mode B: Upload CSV**
1. Select Model Type
2. Enter Company ID (optional)
3. Upload CSV file
4. Frontend parses CSV:
   - Reads header row to identify columns
   - Reads data rows
   - Maps CSV columns to model features
   - Shows form with parsed values (same 2-column grid layout as manual input)
5. User can edit values before submission
6. "Analyze" button submits

**Feature to CSV column mapping:**
- Looks for exact column name matches (case-insensitive)
- Falls back to prompt user if column not found

### 6. **Assessment Submission (assessment.js → api.js → backend)**

**Frontend (assessment.js - submitAssessment()):**
1. Collect form values: `{feature_name: value, ...}`
2. Call `API.analyzeAssessment(modelType, features, companyId)`
3. Payload: `{model_type: "model_30"/"model_50", features: {...}, company_id: int or null}`

**Backend (routes/assessment.py - /analyze POST):**

1. **Authentication check:** Get user_id from session
2. **Model loading:** `load_model(model_type)` reads joblib file
   - Model artifact structure: `{model: sklearn_model, features: [...], feature_medians: {...}, threshold: float}`
   - model_30: Random Forest Classifier
   - model_50: LightGBM with SMOTE pipeline

3. **Feature processing:**
   - Maps database column names to original CSV feature names (FEATURE_MAPPING)
   - Fills missing features with median values from training data
   - Example: `current_ratio` missing in model_30 → filled with `feature_medians['current_ratio']`

4. **Prediction:**
   - Creates pandas DataFrame with exactly 30 or 50 features (in model's expected order)
   - Passes to model: `model.predict_proba(X)` → returns probability of bankruptcy
   - Probability range: 0.0 to 1.0

5. **Status classification:**
   - `prob > 0.85` → 'critical'
   - `prob > 0.65` → 'warning'
   - `prob > 0.45` → 'alert'
   - `prob > 0.25` → 'caution'
   - else → 'safe'

6. **Database storage:**
   - Creates `FinancialAssessment` record
   - Stores: user_id, company_id, model_type, probability, status
   - Stores all 50 feature values (model_30 assessments have NULL for model_50-only features)
   - Stores prediction timestamp

7. **Response:**
   ```json
   {
     "assessment_id": 123,
     "model_type": "model_30",
     "probability": 0.72,
     "threshold": 0.5,
     "status": "warning"
   }
   ```

8. **Frontend receives response and navigates:** `navigateTo('result', assessment_id)`

---

## 🎯 Result Page (result.js)

### Display Structure (divided into 2 sections):

#### **Upper Section: Stability Assessment & Recommendations**

**1. Risk Status Card:**
- Shows probability as percentage
- Color-coded status badge (Critical/Warning/Alert/Caution/Safe)
- Visual risk gauge (circular progress indicator)

**2. Key Stability Findings:**
Automatically analyzes key indicators to generate insights:

**Liquidity Analysis:**
- Current Ratio: if >= 1.5 "Strong", >= 1.0 "Adequate", < 1.0 "Risk"
- Quick Ratio: quality of highly liquid assets
- Working Capital: operational flexibility
- Cash/Current Liability: immediate payment ability

**Profitability Analysis:**
- Net Income to Assets (ROA): asset efficiency
- Net Income to Equity (ROE): shareholder return
- Gross Profit to Sales: operational margin

**Leverage Analysis:**
- Equity to Liability: debt/equity balance
- Total Debt to Net Worth: financial structure (model_50 only)
- Operating Funds to Liability: operational solvency

**Cash Flow Analysis:**
- Cash Flow to Assets: cash generation ability

**Overall Health Score:**
- Calculated from standardized metric ranges
- Combines all available indicators into single 0-100 score

**Recommendations:**
- Based on specific findings, provides actionable advice
- Examples: "Improve current ratio by X days of sales", "Increase profitability", etc.

#### **Lower Section: Model Details & Feature Importance**

**1. Assessment Details Card:**
- Model Type: "30 indicators" or "50 indicators"
- Bankruptcy Risk Probability
- Prediction Threshold (0.5 default)
- Company ID (if provided)
- Assessment Date

**2. Most Influential Financial Indicators (SHAP values):**
- Top 10-15 indicators that influenced prediction
- Shows positive/negative impact direction
- Bar chart visualization
- Color coded: red = increases risk, blue = decreases risk

**SHAP Calculation Flow:**
```
Assessment features → Load model + TreeExplainer → Calculate SHAP values
→ Sort by absolute value → Top 10-15 → Display
```

For binary classification models, SHAP returns array where:
- Negative values = contribute to class 0 (no bankruptcy)
- Positive values = contribute to class 1 (bankruptcy risk)

---

## 📈 Analytics Page (analytics.js)

### Section 1: Metrics Summary (10 metric cards)

Each card displays average metric across all user's assessments (optional filtering by company_id):

1. **Total Assessments** - Count of all assessments
2. **Average Risk Probability** - Mean bankruptcy risk score
3. **High Risk Assessments** - Count where prob > 0.65
4. **Medium Risk Assessments** - Count where 0.45 < prob <= 0.65
5. **Low Risk Assessments** - Count where prob <= 0.45
6. **Avg Return on Assets (ROA)** - Average net_income_assets
   - Formula: (Σ net_income_assets) ÷ (valid count)
   - Filtered: excludes null/undefined/NaN values
7. **Avg Current Ratio** - Average current_ratio (model_50 only)
   - Formula: (Σ current_ratio) ÷ (valid count)
   - Problem: mathematically inaccurate (should sum current assets ÷ sum current liabilities), but user requested no formula changes
8. **Avg Equity-to-Liabilities Ratio** - Average equity_liability
9. **Avg Cash Flow to Assets** - Average cash_flow_assets
10. **Working Capital Health** - Average working_cap_assets

**Null-value handling:**
- Old method: `value || 0` (incorrectly included zeros)
- Current method: `getAverage()` function filters array to exclude null/undefined/NaN before averaging
  ```javascript
  const getAverage = (assessments, key) => {
      const validValues = assessments.map(a => a[key])
          .filter(v => v !== null && v !== undefined && !isNaN(v));
      return validValues.length > 0 ? validValues.reduce((a,b) => a+b, 0) / validValues.length : 0;
  };
  ```

**Tooltip feature:**
- On hover, shows explanation of metric (CSS-based, no formulas shown)
- Example: "Measures company's ability to generate profit from assets"

### Section 2: Company Filter
- Dropdown to filter all metrics/charts by company_id
- Shows list of all unique company_ids user has entered

### Section 3: Recent Assessments Table
Displays all user's assessments in table:
- Columns: Assessment ID, Company ID, Model Type, Risk Status, Probability, Date, Action
- Sorting: by assessment ID (ascending)
- Filterable by company_id (dropdown above)
- Clickable rows → navigate to result page

### Section 4: Metric Visualization
- 4 chart types displayed sequentially (no selector dropdown):
  1. **Line Chart** - Risk trends over time
  2. **Bar Chart** - Risk distribution
  3. **Pie Chart** - Risk category breakdown
  4. **Doughnut Chart** - Alternative breakdown view

- Chart data: assessments (filtered by company_id)
- Axes: X = Assessment date/ID, Y = Probability

---

## 📜 History Page (history.js)

**Simple table view:**
- Displays all user's past assessments
- Filter by Company ID (dropdown at top)
- Columns: ID, Company ID, Model Type, Status, Probability, Date
- Sortable by any column (click header)
- Clickable rows navigate to result page

**Table data fetched via:** `API.getAssessments()` → `GET /api/assessment/history`

---

## 📚 Reference Page (reference.js)

**Complete financial indicator encyclopedia:**
- Displays all 50 financial indicators used in models
- Organized into 12 categories:
  1. Profitability
  2. Liquidity
  3. Leverage
  4. Efficiency
  5. Cash Flow
  6. Capital Structure
  7. Growth
  8. Solvency
  9. Valuation
  10. Risk
  11. Cost of Debt
  12. Innovation

**For each indicator, displays:**
- **Name** - Display name (e.g., "Current Ratio")
- **Category** - Financial category
- **Formula** - Calculation method (e.g., "Current Assets ÷ Current Liabilities")
- **Description** - Detailed explanation of meaning, interpretation, healthy ranges

**Features array structure:**
```javascript
{
  name: "Current Ratio",
  category: "Liquidity",
  formula: "Current Assets ÷ Current Liabilities",
  desc: "Measures company's ability to pay short-term obligations..."
}
```

---

## 👤 Profile Page (profile.js)

**Displays:**
- Current username
- Current email
- Change password form

**Features:**
- `GET /api/profile/` - Fetch user info
- `PUT /api/profile/` - Update profile data
- `POST /api/profile/change-password` - Change password

---

## 🗄️ Database Schema

### User Table (`user_data`)
```
id (INTEGER, PRIMARY KEY, auto-increment)
email (TEXT, UNIQUE)
password (TEXT) - hashed with werkzeug.security
username (TEXT, UNIQUE)
created_at (TIMESTAMP, optional)
```

### FinancialAssessment Table
```
id (INTEGER, PRIMARY KEY, auto-increment)
user_id (INTEGER, FOREIGN KEY → user_data.id)
company_id (INTEGER, optional) - user-provided company identifier
model_type (TEXT) - "model_30" or "model_50"
probability (FLOAT) - 0.0 to 1.0
status (TEXT) - "critical", "warning", "alert", "caution", "safe"
created_at (TIMESTAMP)

--- Feature columns (all FLOAT, NULLABLE) ---
50 columns for all possible features:
net_income_assets, retained_earn_assets, working_cap_assets, 
equity_liability, cash_flow_assets, oper_funds_liability,
cash_curr_liab, quick_assets_assets, net_income_equity,
gross_profit_sales, current_ratio, total_debt_net_worth,
after_tax_profit_growth, total_asset_turnover,
... (46 more columns for model_50-only indicators)
```

**Note:** model_30 assessments have NULL values for model_50-only features like `current_ratio`

---

## 🔌 API Endpoints

### Authentication (`/api/auth`)
- `POST /auth/register` - Create new user
  - Body: `{username, email, password}`
  - Response: `{message, user: {id, username, email}}`
  - Sets: Flask session

- `POST /auth/login` - Authenticate user
  - Body: `{username, password}`
  - Response: `{message, user}`
  - Sets: Flask session

- `POST /auth/logout` - Clear session
  - Response: `{message}`

- `GET /auth/check` - Check authentication status
  - Response: `{authenticated: bool, user_id: int}`

- `GET /auth/me` - Get current user info
  - Response: `{id, username, email}`

### Assessment (`/api/assessment`)
- `POST /assessment/analyze` - Create assessment and predict
  - Body: `{model_type, features: {...}, company_id}`
  - Response: `{assessment_id, model_type, probability, threshold, status}`
  - Database: Creates FinancialAssessment record

- `GET /assessment/<id>` - Get assessment details + SHAP values
  - Response: Assessment record + all 50 feature values + SHAP top 10

- `GET /assessment/history` - Get all user's assessments
  - Query params: `?company_id=123` (optional filter)
  - Response: `{assessments: [...], company_ids: [...]}`

- `GET /assessment/medians/<model_type>` - Get feature medians for missing value filling
  - Response: `{model_type, medians: {feature: value, ...}}`

### Profile (`/api/profile`)
- `GET /profile/` - Get user profile
  - Response: `{id, username, email}`

- `PUT /profile/` - Update profile
  - Body: `{username, email}`
  - Response: `{message, user}`

- `POST /profile/change-password` - Change password
  - Body: `{current_password, new_password}`
  - Response: `{message}` or error

### Analytics (via Assessment endpoints)
- No dedicated analytics endpoints
- All metrics calculated client-side using assessment data

---

## 🧠 ML Models

### Model Storage
Models stored as joblib artifacts in `backend/models/`:
- `model_30.joblib` - 30 indicator model
- `model_50.joblib` - 50 indicator model

### Model Artifact Structure
```python
{
  'model': sklearn_model_or_pipeline,  # LightGBM or RandomForest
  'features': ['feature1', 'feature2', ...],  # Expected feature order
  'feature_medians': {'feature1': 0.5, 'feature2': 0.8, ...},  # For missing value filling
  'threshold': 0.5  # Decision threshold for binary classification
}
```

### Feature Mapping (routes/assessment.py)
Maps database column names to original CSV feature names (many have leading spaces):
```python
FEATURE_MAPPING = {
    'net_income_assets': ' Net Income to Total Assets',
    'current_ratio': ' Current Ratio',
    ...
}
```
**Important:** Leading spaces in feature names must be preserved for model compatibility

### Model Types
- **model_30** - Random Forest with 30 most important indicators
- **model_50** - LightGBM (with SMOTE for imbalanced data) with all 50 indicators

### Prediction Process
1. Load model artifact
2. Extract features from input (fill missing with medians)
3. Create DataFrame with features in exact model order
4. Call `model.predict_proba(X)` → returns probability [P(class_0), P(class_1)]
5. Extract P(class_1) as bankruptcy risk probability
6. Classify: if prob > threshold (0.5) → high risk, else → low risk
7. Map probability to status (critical/warning/alert/caution/safe)

### SHAP Explanation
- Uses `shap.TreeExplainer` for tree-based models
- Calculates Shapley values: contribution of each feature to prediction
- For binary classification: returns per-class SHAP values
- Uses class 1 (bankruptcy) values for display
- Sorts by absolute value to find top influential features

---

## 🎨 Frontend Architecture

### File Structure
```
frontend/
├── index.html - Single-page app shell
├── css/
│   └── style.css - Dark theme styling (611 lines)
├── js/
│   ├── api.js - API client wrapper (104 lines)
│   ├── main.js - App routing/navigation (171 lines)
│   └── pages/
│       ├── home.js
│       ├── auth.js - Register/Login
│       ├── profile.js
│       ├── assessment.js - Manual input + CSV upload
│       ├── result.js - Results + SHAP visualization
│       ├── history.js - Assessment history table
│       ├── analytics.js - Metrics + charts (450+ lines)
│       └── reference.js - 50 indicators guide
```

### Styling
- Dark theme: `#0f172a` (dark blue-gray background)
- Text: `#f1f5f9` (light gray)
- Accents: `#3b82f6` (blue)
- Status colors: red (critical), orange (warning), yellow (alert), green (safe)

### Tooltips
- CSS-based (no title attributes)
- Structure: `.tooltip-container` div with `.tooltip-icon` and `.tooltip-text`
- On hover: `.tooltip-text` becomes visible
- Positioned above element with arrow pointer

### Responsive Design
- Mobile-first approach
- 2-column grids for most forms (1 column on mobile)
- Dark inputs: `background-color: #0f172a`, `color: #f1f5f9`
- Proper contrast for accessibility

---

## ⚙️ Technical Implementation Details

### Session Management
- **Server-side:** Flask session (filesystem)
- **Client-side:** No tokens, relies on cookies
- **CORS:** Enabled for localhost:5000 with credentials
- **Authentication check:** Every protected endpoint checks `session.get('user_id')`

### Error Handling
- Frontend: Try-catch blocks, displays error alerts
- Backend: JSON error responses with HTTP status codes
- Common errors:
  - 401: Not authenticated
  - 404: Resource not found
  - 400: Invalid input
  - 409: Conflict (username/email exists)
  - 500: Server error

### Feature Validation
- Frontend: Type checks, decimal number validation
- Backend: Schema validation via SQLAlchemy, NULL handling
- Missing features: Filled with median values from training data

### Database Transactions
- Create assessment: wrapped in try-catch with rollback on error
- Session commit after each write operation

### Performance Considerations
- Analytics page: Calculates metrics client-side (fast for < 1000 assessments)
- SHAP calculation: Server-side (slower, cached in response)
- Chart rendering: Uses Chart.js library (efficient, canvas-based)

---

## 🔐 Security Notes

1. **Password hashing:** werkzeug.security (PBKDF2-SHA256)
2. **Session security:** Server-side session storage
3. **CORS:** Restricted to localhost origins
4. **SQL injection:** SQLAlchemy ORM prevents injection
5. **CSRF:** Not explicitly implemented (could add CSRF tokens for production)

---

## 📌 Key Technical Quirks & Gotchas

### 1. Feature Mapping Leading Spaces
FEATURE_MAPPING dict has feature names with leading spaces from original CSV:
```
' Net Income to Total Assets' ← note the space
'current_ratio' → maps to ' Current Ratio'
```
This MUST be preserved for model compatibility.

### 2. Null Value Handling in model_30
model_30 assessments store NULL for features like `current_ratio` (model_50-only).
Frontend must check `value !== null && value !== undefined` before using.

### 3. Incorrect Portfolio Metrics (Known Issue)
Analytics page shows "Avg Current Ratio" as simple average of individual ratios.
Mathematically inaccurate: should be (Σ Current Assets) ÷ (Σ Current Liabilities)
But user requested no formula changes, so implemented as-is.

### 4. Status Thresholds (Arbitrary)
Probability thresholds for status classification:
- 0.85: critical
- 0.65: warning
- 0.45: alert
- 0.25: caution
- else: safe

No documentation of these thresholds' rationale in codebase.

### 5. SHAP Output Format
For binary classification, SHAP returns different shapes depending on model type:
- RandomForest: shape (n_samples, n_features) for class 1
- LightGBM: shape (n_samples, 2, n_features) - returns both classes

Code handles both with conditional checks.

### 6. CSV Upload Column Mapping
If CSV column name not found, Frontend prompts user to select column.
Very simple matching: exact case-insensitive string comparison.

---

## 🚀 Deployment/Running

**Development:**
```bash
# Backend
cd backend
python run.py  # Starts Flask on localhost:5000

# Frontend
# Served by Flask from /frontend folder
# Access via http://localhost:5000
```

**Database:**
- PostgreSQL via Supabase
- Connection string: `postgresql://postgres:nikkpi04040@db.inuvmikfydrwazyudpem.supabase.co:5432/postgres`
- Database name: `Financial-Sustainability Project`
- Tables: user_data, FinancialAssessment (auto-created via SQLAlchemy)

**Models:**
- Place `model_30.joblib` and `model_50.joblib` in `backend/models/` folder
- Models loaded on-demand during prediction

---

## 📊 User Journey Map

```
┌─ User opens app
│  └─ Check authentication
│     ├─ If not authenticated
│     │  └─ Show: Home → Login/Register pages
│     │     ├─ Register: username, email, password → auto-login → Home
│     │     └─ Login: username, password → Home
│     │
│     └─ If authenticated
│        └─ Show: Home → Assessment page
│           ├─ Manual Input: Select model → Enter 30/50 indicators → Analyze
│           └─ Upload CSV: Select model → Upload CSV → Edit values → Analyze
│              └─ Submit → Prediction → Result page
│                 ├─ View: Risk status + Stability findings + SHAP
│                 └─ Navigate: History → View all assessments
│                            Analytics → View metrics & trends
│                            Reference → View 50 indicators guide
│
└─ User can switch pages via header navigation
   Profile → View/edit user info
   Logout → Return to login
```

---

## ✅ Quality Checklist

- [x] All 8 pages implemented
- [x] Two model types (30 and 50 indicators)
- [x] Manual input and CSV upload
- [x] Database integration (Supabase PostgreSQL)
- [x] Authentication (register/login/logout/session)
- [x] SHAP explanations for predictions
- [x] Analytics with metrics and charts
- [x] Dark theme UI
- [x] Tooltips for financial metrics
- [x] Company-level filtering
- [x] Responsive design (mobile-friendly grid layouts)
- [x] Error handling and validation
- [ ] Production security hardening (CSRF tokens, rate limiting, etc.)

---

**Last Updated:** Session checkpoint analysis  
**Application Status:** Fully functional for development use
