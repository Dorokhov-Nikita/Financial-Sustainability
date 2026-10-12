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

@assessment_bp.route('/medians/<model_type>', methods=['GET'])
def get_medians(model_type):
    """Get feature medians for a specific model"""
    if model_type not in ['model_30', 'model_50']:
        return jsonify({'error': 'Invalid model type'}), 400
    
    try:
        artifact = load_model(model_type)
        medians = artifact.get('feature_medians', {})
        
        # Transform medians from description keys to db_name keys
        transformed_medians = {}
        for db_name, description in FEATURE_MAPPING.items():
            if description in medians:
                transformed_medians[db_name] = medians[description]
        
        return jsonify({
            'medians': transformed_medians,
            'model_type': model_type
        }), 200
    except FileNotFoundError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        return jsonify({'error': f'Error loading medians: {str(e)}'}), 500

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
        
        # Load model artifact
        artifact = load_model(model_type)
        model = artifact['model']
        model_features = artifact['features']
        threshold = artifact['threshold']
        
        # Get features from request
        features_data = request.json.get('features', {})
        
        # Validate that all required features are present
        if not isinstance(features_data, dict):
            return jsonify({'error': 'Features must be a dictionary'}), 400
        
        # Map our feature names to model feature names and create data
        X_dict = {}
        for our_name, value in features_data.items():
            # Get the mapped feature name (with leading space as in original data)
            mapped_name = FEATURE_MAPPING.get(our_name)
            if mapped_name and mapped_name in model_features:
                X_dict[mapped_name] = value
        
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
        
        # Determine status based on probability
        prob = float(prediction_prob)
        if prob > 0.85:
            status = 'critical'
        elif prob > 0.65:
            status = 'warning'
        elif prob > 0.45:
            status = 'alert'
        elif prob > 0.25:
            status = 'caution'
        else:
            status = 'safe'
        
        # Get company_id from request
        company_id = request.json.get('company_id')
        
        # Save to database
        assessment = FinancialAssessment(
            user_id=user_id,
            company_id=company_id,
            model_type=model_type,
            probability=prob
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
            'probability': prob,
            'threshold': threshold,
            'status': status
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
        query = FinancialAssessment.query.filter_by(user_id=user_id)
        
        # Filter by company_id if provided
        company_id = request.args.get('company_id', type=int)
        if company_id:
            query = query.filter_by(company_id=company_id)
        
        assessments = query.order_by(FinancialAssessment.id.asc()).all()
        
        # Get unique company_ids
        all_assessments = FinancialAssessment.query.filter_by(user_id=user_id).all()
        company_ids = sorted(set(a.company_id for a in all_assessments if a.company_id is not None))
        
        return jsonify({
            'assessments': [a.to_dict(include_features=True) for a in assessments],
            'company_ids': company_ids
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
            result[feature_name] = getattr(assessment, feature_name, None)
        
        # Load model to get threshold and calculate SHAP
        try:
            model_artifact = load_model(assessment.model_type)
            result['threshold'] = model_artifact['threshold']
            
            # Prepare data for SHAP
            model = model_artifact['model']
            model_features = model_artifact['features']
            
            # Create DataFrame with assessment features
            feature_values = {}
            for feature in model_features:
                # Find matching database column name
                db_name = None
                for db_col, mapped_name in FEATURE_MAPPING.items():
                    if mapped_name == feature:
                        db_name = db_col
                        break
                
                if db_name:
                    feature_values[feature] = getattr(assessment, db_name)
            
            X = pd.DataFrame([feature_values])
            
            # Calculate SHAP values
            try:
                import shap
                
                # Validate that we have all features
                missing_features = [f for f in model_features if f not in X.columns]
                if missing_features:
                    raise ValueError(f"Missing features in data: {missing_features}")
                
                # Ensure feature order matches model_features exactly
                X_ordered = X[model_features]
                
                # Use TreeExplainer for tree-based models
                if 'lgbm' in assessment.model_type.lower() or hasattr(model, 'named_steps'):
                    # For pipeline with LightGBM
                    actual_model = model[-1] if hasattr(model, 'named_steps') else model
                else:
                    # For Random Forest
                    actual_model = model
                
                explainer = shap.TreeExplainer(actual_model)
                shap_values = explainer.shap_values(X_ordered)
                
                # Handle different output formats from SHAP
                # For binary classification, we need class 1 (bankruptcy risk)
                if isinstance(shap_values, list):
                    # List format - take positive class [1]
                    if len(shap_values) > 1:
                        shap_vals = shap_values[1][0]
                        base_value = explainer.expected_value[1] if isinstance(explainer.expected_value, list) else explainer.expected_value
                    else:
                        raise ValueError(f"Unexpected SHAP list format: {len(shap_values)} elements")
                elif hasattr(shap_values, 'ndim'):
                    # Array format
                    if shap_values.ndim == 3:
                        # RandomForest returns (n_samples, n_features, n_classes)
                        # Take positive class (index 1)
                        shap_vals = shap_values[0, :, 1]
                        # For RF, expected_value corresponds to classes - take class 1
                        if isinstance(explainer.expected_value, (list, np.ndarray)):
                            base_value = explainer.expected_value[1] if len(explainer.expected_value) > 1 else explainer.expected_value[0]
                        else:
                            base_value = explainer.expected_value
                    elif shap_values.ndim == 2:
                        # LightGBM returns (n_samples, n_features)
                        # Note: LightGBM TreeExplainer returns SHAP for positive class directly
                        shap_vals = shap_values[0]
                        # LightGBM expected_value for binary classification
                        if isinstance(explainer.expected_value, (list, np.ndarray)):
                            base_value = explainer.expected_value[1] if len(explainer.expected_value) > 1 else explainer.expected_value[0]
                        else:
                            base_value = explainer.expected_value
                    else:
                        raise ValueError(f"Unexpected SHAP array dimensions: {shap_values.ndim}")
                else:
                    raise ValueError(f"Unexpected SHAP output type: {type(shap_values)}")
                
                # Validate shap_vals length matches model_features
                if len(shap_vals) != len(model_features):
                    raise ValueError(f"SHAP values length ({len(shap_vals)}) doesn't match model features ({len(model_features)})")
                
                # Create feature importance list with proper correspondence
                feature_importance = []
                for i, feature in enumerate(model_features):
                    shap_val = shap_vals[i]
                    try:
                        feature_value = float(X_ordered[feature].iloc[0])
                    except (KeyError, IndexError) as e:
                        raise ValueError(f"Cannot get value for feature '{feature}': {str(e)}")
                    
                    try:
                        shap_float = float(shap_val) if isinstance(shap_val, (int, float, np.number)) else float(shap_val)
                    except (TypeError, ValueError) as e:
                        raise ValueError(f"Cannot convert SHAP value for '{feature}' to float: {str(e)}")
                    
                    feature_importance.append({
                        'feature': feature,
                        'value': feature_value,
                        'shap_value': shap_float,
                        'abs_shap': abs(shap_float)
                    })
                
                # Sort by absolute SHAP value and take top 10
                feature_importance.sort(key=lambda x: x['abs_shap'], reverse=True)
                result['top_features'] = feature_importance[:10]
                result['base_value'] = float(base_value)
                
            except Exception as shap_error:
                # Log detailed error and return meaningful message
                error_detail = f"{type(shap_error).__name__}: {str(shap_error)}"
                print(f"SHAP calculation failed: {error_detail}")
                import traceback
                traceback.print_exc()
                result['top_features'] = []
                result['base_value'] = None
                result['shap_error'] = error_detail  # Include error in response for debugging
        
        except Exception as model_error:
            # If model loading/threshold fails, still return assessment with probability
            error_detail = f"{type(model_error).__name__}: {str(model_error)}"
            print(f"Model loading error: {error_detail}")
            result['threshold'] = None
            result['top_features'] = []
            result['base_value'] = None
            result['model_error'] = error_detail
        
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

