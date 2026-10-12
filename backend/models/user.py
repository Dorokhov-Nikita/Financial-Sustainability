from . import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

class User(db.Model):
    """User model"""
    __tablename__ = 'user_data'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    
    def set_password(self, password):
        """Set password hash"""
        self.password = generate_password_hash(password)
    
    def check_password(self, password):
        """Verify password"""
        return check_password_hash(self.password, password)
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email
        }


class FinancialAssessment(db.Model):
    """Financial Assessment model"""
    __tablename__ = 'financial_assessments'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user_data.id'), nullable=False)
    company_id = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    # Model and result info
    model_type = db.Column(db.String(20), nullable=False)  # 'model_30' or 'model_50'
    probability = db.Column(db.Float, nullable=False)  # Probability of bankruptcy (0-1)
    
    # All 50 features stored
    net_income_assets = db.Column(db.Float)
    net_worth_assets = db.Column(db.Float)
    eps_persist = db.Column(db.Float)
    retained_earn_assets = db.Column(db.Float)
    net_income_equity = db.Column(db.Float)
    borrowing_dep = db.Column(db.Float)
    curr_liab_assets = db.Column(db.Float)
    working_cap_assets = db.Column(db.Float)
    curr_liab_curr_assets = db.Column(db.Float)
    net_value_share_a = db.Column(db.Float)
    total_exp_assets = db.Column(db.Float)
    working_cap_equity = db.Column(db.Float)
    equity_lt_liab = db.Column(db.Float)
    cfo_assets = db.Column(db.Float)
    tax_rate_a = db.Column(db.Float)
    inventory_ar_net_value = db.Column(db.Float)
    gross_profit_sales = db.Column(db.Float)
    cash_assets = db.Column(db.Float)
    liability_assets_flag = db.Column(db.Float)
    op_profit_person = db.Column(db.Float)
    cash_reinvestment = db.Column(db.Float)
    quick_assets_assets = db.Column(db.Float)
    cash_curr_liab = db.Column(db.Float)
    equity_liability = db.Column(db.Float)
    oper_funds_liability = db.Column(db.Float)
    contingent_liab_net_worth = db.Column(db.Float)
    fixed_assets_turnover_freq = db.Column(db.Float)
    cash_flow_assets = db.Column(db.Float)
    fixed_assets_assets = db.Column(db.Float)
    cash_flow_equity = db.Column(db.Float)
    cash_flow_share = db.Column(db.Float)
    total_asset_turnover = db.Column(db.Float)
    current_ratio = db.Column(db.Float)
    cash_flow_liability = db.Column(db.Float)
    total_asset_growth = db.Column(db.Float)
    assets_gnp = db.Column(db.Float)
    current_assets_assets = db.Column(db.Float)
    asset_return_growth = db.Column(db.Float)
    quick_ratio = db.Column(db.Float)
    total_debt_net_worth = db.Column(db.Float)
    after_tax_profit_growth = db.Column(db.Float)
    lt_fund_suitability = db.Column(db.Float)
    rd_expense_rate = db.Column(db.Float)
    interest_bearing_debt_rate = db.Column(db.Float)
    curr_liab_liability = db.Column(db.Float)
    quick_asset_turnover = db.Column(db.Float)
    sales_gross_profit_growth = db.Column(db.Float)
    non_industry_income_revenue = db.Column(db.Float)
    current_asset_turnover = db.Column(db.Float)
    net_worth_turnover = db.Column(db.Float)
    
    def to_dict(self, include_features=False):
        """Convert to dictionary"""
        prob = self.probability
        
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
        
        result = {
            'id': self.id,
            'user_id': self.user_id,
            'company_id': self.company_id,
            'created_at': self.created_at.isoformat(),
            'model_type': self.model_type,
            'probability': self.probability,
            'status': status
        }
        
        # Include all features if requested
        if include_features:
            feature_names = [
                'net_income_assets', 'net_worth_assets', 'eps_persist', 'retained_earn_assets',
                'net_income_equity', 'borrowing_dep', 'curr_liab_assets', 'working_cap_assets',
                'curr_liab_curr_assets', 'net_value_share_a', 'total_exp_assets', 'working_cap_equity',
                'equity_lt_liab', 'cfo_assets', 'tax_rate_a', 'inventory_ar_net_value',
                'gross_profit_sales', 'cash_assets', 'liability_assets_flag', 'op_profit_person',
                'cash_reinvestment', 'quick_assets_assets', 'cash_curr_liab', 'equity_liability',
                'oper_funds_liability', 'contingent_liab_net_worth', 'fixed_assets_turnover_freq',
                'cash_flow_assets', 'fixed_assets_assets', 'cash_flow_equity', 'cash_flow_share',
                'total_asset_turnover', 'current_ratio', 'cash_flow_liability', 'total_asset_growth',
                'assets_gnp', 'current_assets_assets', 'asset_return_growth', 'quick_ratio',
                'total_debt_net_worth', 'after_tax_profit_growth', 'lt_fund_suitability',
                'rd_expense_rate', 'interest_bearing_debt_rate', 'curr_liab_liability',
                'quick_asset_turnover', 'sales_gross_profit_growth', 'non_industry_income_revenue',
                'current_asset_turnover', 'net_worth_turnover'
            ]
            for feature_name in feature_names:
                result[feature_name] = getattr(self, feature_name, None)
        
        return result
