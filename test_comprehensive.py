#!/usr/bin/env python
"""Comprehensive test suite for Financial Sustainability Assessment"""

import requests
import json
import time
import random

BASE_URL = 'http://localhost:5000/api'
FEATURES = [
    "net_income_assets", "net_worth_assets", "eps_persist", "retained_earn_assets",
    "net_income_equity", "borrowing_dep", "curr_liab_assets", "working_cap_assets",
    "curr_liab_curr_assets", "net_value_share_a", "total_exp_assets", "working_cap_equity",
    "equity_lt_liab", "cfo_assets", "tax_rate_a", "inventory_ar_net_value",
    "gross_profit_sales", "cash_assets", "liability_assets_flag", "op_profit_person",
    "cash_reinvestment", "quick_assets_assets", "cash_curr_liab", "equity_liability",
    "oper_funds_liability", "contingent_liab_net_worth", "fixed_assets_turnover_freq",
    "cash_flow_assets", "fixed_assets_assets", "cash_flow_equity", "cash_flow_share",
    "total_asset_turnover", "current_ratio", "cash_flow_liability", "total_asset_growth",
    "assets_gnp", "current_assets_assets", "asset_return_growth", "quick_ratio",
    "total_debt_net_worth", "after_tax_profit_growth", "lt_fund_suitability",
    "rd_expense_rate", "interest_bearing_debt_rate", "curr_liab_liability",
    "quick_asset_turnover", "sales_gross_profit_growth", "non_industry_income_revenue",
    "current_asset_turnover", "net_worth_turnover"
]

def run_tests():
    """Run comprehensive tests"""
    print("=" * 60)
    print("FINANCIAL SUSTAINABILITY ASSESSMENT - COMPREHENSIVE TEST")
    print("=" * 60)
    
    # Create session for auth persistence
    session = requests.Session()
    
    # 1. Test registration
    print("\n1. Testing registration...")
    username = f'testuser{int(time.time())}'
    email = f'test{int(time.time())}@example.com'
    
    data = {
        'username': username,
        'email': email,
        'password': 'Pass123!'
    }
    
    r = session.post(f'{BASE_URL}/auth/register', json=data)
    assert r.status_code == 201, f"Registration failed: {r.status_code}"
    user_data = r.json()
    print(f"   [OK] User registered: {username}")
    
    # 2. Test auth check
    print("\n2. Testing authentication...")
    r = session.get(f'{BASE_URL}/auth/check')
    assert r.status_code == 200, f"Auth check failed: {r.status_code}"
    assert r.json()['authenticated'] == True
    print(f"   [OK] Authentication verified")
    
    # 3. Test get features
    print("\n3. Testing feature loading...")
    r = session.get(f'{BASE_URL}/assessment/features')
    assert r.status_code == 200, f"Features failed: {r.status_code}"
    features = r.json()['features']
    assert len(features) == 50
    print(f"   [OK] Loaded {len(features)} features")
    
    # 4. Test analysis with model_30
    print("\n4. Testing model_30 analysis...")
    test_features = {feat: random.uniform(0, 1) for feat in FEATURES[:30]}
    
    r = session.post(f'{BASE_URL}/assessment/analyze', json={
        'model_type': 'model_30',
        'features': test_features
    })
    assert r.status_code == 201, f"Analysis failed: {r.status_code}"
    result = r.json()
    assessment_id = result['assessment_id']
    print(f"   [OK] Analysis completed")
    print(f"       - Assessment ID: {assessment_id}")
    print(f"       - Prediction: {result['status']}")
    print(f"       - Probability: {result['probability']:.2%}")
    print(f"       - Risk Level: {result['risk_level']}")
    
    # 5. Test analysis with model_50
    print("\n5. Testing model_50 analysis...")
    test_features = {feat: random.uniform(0, 1) for feat in FEATURES}
    
    r = session.post(f'{BASE_URL}/assessment/analyze', json={
        'model_type': 'model_50',
        'features': test_features
    })
    assert r.status_code == 201, f"Analysis failed: {r.status_code}"
    result = r.json()
    print(f"   [OK] Analysis completed")
    print(f"       - Prediction: {result['status']}")
    print(f"       - Probability: {result['probability']:.2%}")
    
    # 6. Test assessment history
    print("\n6. Testing assessment history...")
    r = session.get(f'{BASE_URL}/assessment/history')
    assert r.status_code == 200, f"History failed: {r.status_code}"
    assessments = r.json()['assessments']
    print(f"   [OK] Found {len(assessments)} assessment(s)")
    
    # 7. Test get specific assessment
    print("\n7. Testing assessment retrieval...")
    r = session.get(f'{BASE_URL}/assessment/{assessment_id}')
    assert r.status_code == 200, f"Get assessment failed: {r.status_code}"
    assessment = r.json()
    print(f"   [OK] Assessment retrieved successfully")
    
    # 8. Test dashboard
    print("\n8. Testing analytics dashboard...")
    r = session.get(f'{BASE_URL}/assessment/dashboard')
    assert r.status_code == 200, f"Dashboard failed: {r.status_code}"
    dashboard = r.json()
    print(f"   [OK] Dashboard loaded")
    print(f"       - Total Assessments: {dashboard['total_assessments']}")
    print(f"       - Stable Count: {dashboard['stable_count']}")
    print(f"       - Bankrupt Count: {dashboard['bankrupt_count']}")
    print(f"       - Average Probability: {dashboard['average_probability']:.2%}")
    
    # 9. Test profile
    print("\n9. Testing user profile...")
    r = session.get(f'{BASE_URL}/profile/')
    assert r.status_code == 200, f"Profile failed: {r.status_code}"
    profile = r.json()
    print(f"   [OK] Profile retrieved")
    print(f"       - Username: {profile['username']}")
    print(f"       - Email: {profile['email']}")
    
    print("\n" + "=" * 60)
    print("ALL TESTS PASSED!")
    print("=" * 60)
    print("\nSystem is ready for production use.")
    print("Frontend available at: http://localhost:8000")
    print("Backend available at: http://localhost:5000")

if __name__ == '__main__':
    try:
        run_tests()
    except AssertionError as e:
        print(f"\n[FAILED] TEST FAILED: {e}")
        exit(1)
    except Exception as e:
        print(f"\n[ERROR] ERROR: {e}")
        exit(1)
