## How to Run the Financial Sustainability Assessment Application

### Prerequisites
- Python 3.10+
- Node.js (for Live Server)
- Ports 5000 (Flask) and 8000 (Frontend) available

### Quick Start

#### 1. Open Terminal in VS Code
From the project root directory `D:\Financial Sustainability`

#### 2. Initialize Database (first time only)
```bash
python init_db.py
```

#### 3. Start Flask Backend
Open a terminal and run:
```bash
cd backend
python -m flask --app app run
```
Or:
```bash
cd backend
flask run
```
The backend will start at: **http://localhost:5000**

#### 4. Start Frontend Server
Open another terminal and run:
```bash
cd frontend
npx live-server --port=8000
```
The frontend will open at: **http://localhost:8000**

#### 5. Use the Application
- **Home Page**: Visit http://localhost:8000
- **Register**: Create new account (Sign Up)
- **Login**: Use credentials to log in
- **Assessment**: 
  - Choose model (30 or 50 features)
  - Manual Input: Enter financial indicators
  - CSV Upload: Upload data.csv file
- **Results**: View prediction and risk analysis
- **History**: See all previous assessments
- **Reference**: View financial indicators glossary

### Project Structure
```
D:\Financial Sustainability\
├── backend/
│   ├── app.py                 # Flask app entry point
│   ├── config.py              # Database configuration
│   ├── models/
│   │   ├── user.py           # Database models
│   ├── routes/
│   │   ├── auth.py           # Authentication endpoints
│   │   ├── profile.py        # User profile endpoints
│   │   ├── assessment.py     # ML assessment endpoints
│   ├── saved_models/
│   │   ├── model_30.joblib   # Random Forest model
│   │   ├── model_50.joblib   # LightGBM model
│
├── frontend/
│   ├── index.html            # Main HTML file
│   ├── css/
│   │   ├── style.css         # Styling
│   ├── js/
│   │   ├── main.js           # Navigation & auth logic
│   │   ├── api.js            # API client
│   │   ├── pages/
│   │   │   ├── home.js
│   │   │   ├── register.js
│   │   │   ├── login.js
│   │   │   ├── profile.js
│   │   │   ├── assessment.js
│   │   │   ├── result.js
│   │   │   ├── history.js
│   │   │   ├── analytics.js
│   │   │   ├── reference.js
│
├── init_db.py               # Database initialization
├── test_assessment.py       # Test suite
├── train_models.py          # ML model training script
├── data.csv                 # Training data (not included)

```

### Features
- **User Authentication**: Secure registration and login
- **Financial Assessment**: Two ML models for bankruptcy prediction
  - Random Forest (30 features) 
  - LightGBM SMOTE (50 features)
- **Manual Data Entry**: Input financial indicators manually
- **CSV Upload**: Import data from CSV files
- **Risk Analysis**: Get risk levels and recommendations
- **Assessment History**: Track all previous assessments
- **Financial Reference**: Glossary of all 50 financial indicators

### Database
- **Development**: SQLite (app.db) - auto-created on first run
- **Production**: PostgreSQL via Supabase (configured in config.py)

### Models
- **Model 30**: Random Forest with 30 financial indicators
  - Test Accuracy: 0.7333
  - Test F1: 0.5000
  - Threshold: 0.250

- **Model 50**: LightGBM SMOTE with 50 financial indicators  
  - Test Accuracy: 0.7500
  - Test F1: 0.5263
  - Threshold: 0.550

### Troubleshooting

**"Cannot find module" error in backend**
- Make sure you're running Flask from the `backend` directory
- Check that PYTHONPATH includes the project root

**"Port already in use" error**
- Change port in Live Server: `npx live-server --port=8001`
- Change Flask port: `flask run --port=5001`
- Update API_BASE_URL in frontend/js/api.js if Flask port changed

**CSS not loading**
- Hard refresh browser (Ctrl+F5 or Cmd+Shift+R)

**Models not found**
- Run `train_models.py` to regenerate models:
  ```bash
  python train_models.py
  ```

### Testing
Run the test suite:
```bash
python test_assessment.py
```

This will test:
1. User registration
2. Authentication check
3. Feature loading
4. Model analysis (30 and 50 features)
5. Assessment history retrieval
6. Assessment data retrieval

All tests should show [OK] status.
