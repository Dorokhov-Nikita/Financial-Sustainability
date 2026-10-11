from flask import request, jsonify, session
from . import assessment_bp
from models import db
from models.user import FinancialAssessment
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
import io

# Load saved models
MODELS_DIR = Path(__file__).parent.parent / 'saved_models'

def load_model(model_key):
    """Load a saved model"""
    model_path = MODELS_DIR / f"{model_key}.joblib"
    if not model_path.exists():
        raise FileNotFoundError(f"Model not found: {model_path}")
    return joblib.load(model_path)

# Feature mapping from our database names to original CSV column names (WITH leading spaces as in original data)
FEATURE_MAPPING = {
    "net_income_assets": " Net Income to Total Assets",
    "net_worth_assets": " Net worth/Assets",
    "eps_persist": " Persistent EPS in the Last Four Seasons",
    "retained_earn_assets": " Retained Earnings to Total Assets",
    "net_income_equity": " Net Income to Stockholder's Equity",
    "borrowing_dep": " Borrowing dependency",
    "curr_liab_assets": " Current Liability to Assets",
    "working_cap_assets": " Working Capital to Total Assets",
    "curr_liab_curr_assets": " Current Liability to Current Assets",
    "net_value_share_a": " Net Value Per Share (A)",
    "total_exp_assets": " Total expense/Assets",
    "working_cap_equity": " Working Capital/Equity",
    "equity_lt_liab": " Equity to Long-term Liability",
    "cfo_assets": " CFO to Assets",
    "tax_rate_a": " Tax rate (A)",
    "inventory_ar_net_value": " Inventory and accounts receivable/Net value",
    "gross_profit_sales": " Gross Profit to Sales",
    "cash_assets": " Cash/Total Assets",
    "liability_assets_flag": " Liability-Assets Flag",
    "op_profit_person": " Operating profit per person",
    "cash_reinvestment": " Cash Reinvestment %",
    "quick_assets_assets": " Quick Assets/Total Assets",
    "cash_curr_liab": " Cash/Current Liability",
    "equity_liability": " Equity to Liability",
    "oper_funds_liability": " Operating Funds to Liability",
    "contingent_liab_net_worth": " Contingent liabilities/Net worth",
    "fixed_assets_turnover_freq": " Fixed Assets Turnover Frequency",
    "cash_flow_assets": " Cash Flow to Total Assets",
    "fixed_assets_assets": " Fixed Assets to Assets",
    "cash_flow_equity": " Cash Flow to Equity",
    "cash_flow_share": " Cash Flow Per Share",
    "total_asset_turnover": " Total Asset Turnover",
    "current_ratio": " Current Ratio",
    "cash_flow_liability": " Cash Flow to Liability",
    "total_asset_growth": " Total Asset Growth Rate",
    "assets_gnp": " Total assets to GNP price",
    "current_assets_assets": " Current Assets/Total Assets",
    "asset_return_growth": " Total Asset Return Growth Rate Ratio",
    "quick_ratio": " Quick Ratio",
    "total_debt_net_worth": " Total debt/Total net worth",
    "after_tax_profit_growth": " After-tax Net Profit Growth Rate",
    "lt_fund_suitability": " Long-term fund suitability ratio (A)",
    "rd_expense_rate": " Research and development expense rate",
    "interest_bearing_debt_rate": " Interest-bearing debt interest rate",
    "curr_liab_liability": " Current Liabilities/Liability",
    "quick_asset_turnover": " Quick Asset Turnover Rate",
    "sales_gross_profit_growth": " Realized Sales Gross Profit Growth Rate",
    "non_industry_income_revenue": " Non-industry income and expenditure/revenue",
    "current_asset_turnover": " Current Asset Turnover Rate",
    "net_worth_turnover": " Net Worth Turnover Rate (times)"
}

# Feature names for both models (in order)
FEATURE_NAMES = list(FEATURE_MAPPING.keys())

@assessment_bp.route('/analyze', methods=['POST'])
def analyze():
    """Analyze financial data and make prediction"""
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        # Get model type from request
        model_type = request.json.get('model_type')  # 'model_30' or 'model_50'
        if model_type not in ['model_30', 'model_50']:
            return jsonify({'error': 'Invalid model type'}), 400
        
        # Get features from request
        features_data = request.json.get('features', {})
        
        # Validate that all required features are present
        if not isinstance(features_data, dict):
            return jsonify({'error': 'Features must be a dictionary'}), 400
        
        # Load model and get its metadata
        model_artifact = load_model(model_type)
        model = model_artifact['model']
        model_features = model_artifact['features']  # These are now cleaned
        threshold = model_artifact['threshold']
        
        # Map our feature names to model feature names and create data
        X_dict = {}
        for our_name in features_data:
            # Get the mapped feature name (with leading space as in original data)
            mapped_name = FEATURE_MAPPING.get(our_name)
            if mapped_name in model_features:
                X_dict[mapped_name] = features_data[our_name]
        
        # Create DataFrame with the required features in the right order
        X = pd.DataFrame([{f: X_dict.get(f) for f in model_features}])
        
        # Check for missing values
        if X.isna().any().any():
            missing = X.columns[X.isna().any()].tolist()
            return jsonify({
                'error': f'Missing features: {", ".join(missing)}'
            }), 400
        
        # Make prediction
        prediction_prob = model.predict_proba(X)[:, 1][0]
        prediction = 1 if prediction_prob >= threshold else 0
        
        # Save to database
        assessment = FinancialAssessment(
            user_id=user_id,
            model_type=model_type,
            prediction=prediction,
            probability=float(prediction_prob)
        )
        
        # Store all features in the database
        for feature_name in FEATURE_NAMES:
            if feature_name in features_data:
                setattr(assessment, feature_name, features_data[feature_name])
        
        db.session.add(assessment)
        db.session.commit()
        
        return jsonify({
            'assessment_id': assessment.id,
            'model_type': model_type,
            'prediction': prediction,
            'probability': float(prediction_prob),
            'threshold': threshold,
            'status': 'bankrupt' if prediction == 1 else 'stable',
            'risk_level': 'high' if prediction_prob >= 0.7 else 'medium' if prediction_prob >= 0.3 else 'low'
        }), 201
    
    except FileNotFoundError as e:
        return jsonify({'error': f'Model not found: {str(e)}'}), 404
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500


@assessment_bp.route('/history', methods=['GET'])
def get_history():
    """Get user's assessment history"""
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        assessments = FinancialAssessment.query.filter_by(user_id=user_id).order_by(
            FinancialAssessment.created_at.desc()
        ).all()
        
        return jsonify({
            'assessments': [a.to_dict() for a in assessments]
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@assessment_bp.route('/<int:assessment_id>', methods=['GET'])
def get_assessment(assessment_id):
    """Get specific assessment details"""
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        assessment = FinancialAssessment.query.filter_by(
            id=assessment_id,
            user_id=user_id
        ).first()
        
        if not assessment:
            return jsonify({'error': 'Assessment not found'}), 404
        
        result = assessment.to_dict()
        
        # Add all features
        for feature_name in FEATURE_NAMES:
            result[feature_name] = getattr(assessment, feature_name)
        
        return jsonify(result), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@assessment_bp.route('/features', methods=['GET'])
def get_feature_info():
    """Get information about all features"""
    feature_descriptions = {
        "net_income_assets": "Net Income to Total Assets",
        "net_worth_assets": "Net worth/Assets",
        "eps_persist": "Persistent EPS in the Last Four Seasons",
        "retained_earn_assets": "Retained Earnings to Total Assets",
        "net_income_equity": "Net Income to Stockholder's Equity",
        "borrowing_dep": "Borrowing dependency",
        "curr_liab_assets": "Current Liability to Assets",
        "working_cap_assets": "Working Capital to Total Assets",
        "curr_liab_curr_assets": "Current Liability to Current Assets",
        "net_value_share_a": "Net Value Per Share (A)",
        "total_exp_assets": "Total expense/Assets",
        "working_cap_equity": "Working Capital/Equity",
        "equity_lt_liab": "Equity to Long-term Liability",
        "cfo_assets": "CFO to Assets",
        "tax_rate_a": "Tax rate (A)",
        "inventory_ar_net_value": "Inventory and accounts receivable/Net value",
        "gross_profit_sales": "Gross Profit to Sales",
        "cash_assets": "Cash/Total Assets",
        "liability_assets_flag": "Liability-Assets Flag",
        "op_profit_person": "Operating profit per person",
        "cash_reinvestment": "Cash Reinvestment %",
        "quick_assets_assets": "Quick Assets/Total Assets",
        "cash_curr_liab": "Cash/Current Liability",
        "equity_liability": "Equity to Liability",
        "oper_funds_liability": "Operating Funds to Liability",
        "contingent_liab_net_worth": "Contingent liabilities/Net worth",
        "fixed_assets_turnover_freq": "Fixed Assets Turnover Frequency",
        "cash_flow_assets": "Cash Flow to Total Assets",
        "fixed_assets_assets": "Fixed Assets to Assets",
        "cash_flow_equity": "Cash Flow to Equity",
        "cash_flow_share": "Cash Flow Per Share",
        "total_asset_turnover": "Total Asset Turnover",
        "current_ratio": "Current Ratio",
        "cash_flow_liability": "Cash Flow to Liability",
        "total_asset_growth": "Total Asset Growth Rate",
        "assets_gnp": "Total assets to GNP price",
        "current_assets_assets": "Current Assets/Total Assets",
        "asset_return_growth": "Total Asset Return Growth Rate Ratio",
        "quick_ratio": "Quick Ratio",
        "total_debt_net_worth": "Total debt/Total net worth",
        "after_tax_profit_growth": "After-tax Net Profit Growth Rate",
        "lt_fund_suitability": "Long-term fund suitability ratio (A)",
        "rd_expense_rate": "Research and development expense rate",
        "interest_bearing_debt_rate": "Interest-bearing debt interest rate",
        "curr_liab_liability": "Current Liabilities/Liability",
        "quick_asset_turnover": "Quick Asset Turnover Rate",
        "sales_gross_profit_growth": "Realized Sales Gross Profit Growth Rate",
        "non_industry_income_revenue": "Non-industry income and expenditure/revenue",
        "current_asset_turnover": "Current Asset Turnover Rate",
        "net_worth_turnover": "Net Worth Turnover Rate (times)"
    }
    
    return jsonify({
        'features': [
            {
                'name': name,
                'description': feature_descriptions.get(name, name)
            }
            for name in FEATURE_NAMES
        ]
    }), 200


@assessment_bp.route('/dashboard', methods=['GET'])
def get_dashboard():
    """Get analytics dashboard data"""
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        assessments = FinancialAssessment.query.filter_by(user_id=user_id).all()
        
        if not assessments:
            return jsonify({
                'total_assessments': 0,
                'stable_count': 0,
                'bankrupt_count': 0,
                'average_probability': 0,
                'average_score': 0,
                'last_assessment': None
            }), 200
        
        probabilities = [a.probability for a in assessments]
        stable_count = sum(1 for a in assessments if a.prediction == 0)
        bankrupt_count = sum(1 for a in assessments if a.prediction == 1)
        
        return jsonify({
            'total_assessments': len(assessments),
            'stable_count': stable_count,
            'bankrupt_count': bankrupt_count,
            'average_probability': sum(probabilities) / len(probabilities),
            'average_score': sum(probabilities) / len(probabilities),
            'last_assessment': assessments[0].to_dict() if assessments else None
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

