from flask import request, jsonify, session
from routes import analytics_bp
from models.user import Assessment, Result

@analytics_bp.route('/dashboard', methods=['GET'])
def get_dashboard():
    """Get analytics dashboard data"""
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    # Get all assessments
    assessments = Assessment.query.filter_by(user_id=user_id).all()
    
    if not assessments:
        return jsonify({
            'total_assessments': 0,
            'average_score': 0,
            'last_assessment': None,
            'assessments': []
        }), 200
    
    # Calculate stats
    results = [a.result for a in assessments if a.result]
    scores = [r.sustainability_score for r in results if r and r.sustainability_score]
    
    average_score = sum(scores) / len(scores) if scores else 0
    last_assessment = max(assessments, key=lambda a: a.created_at)
    
    # Prepare data for chart
    assessments_data = [{
        'id': a.id,
        'title': a.title,
        'score': a.result.sustainability_score if a.result else None,
        'health': a.result.overall_health if a.result else None,
        'date': a.created_at.isoformat()
    } for a in sorted(assessments, key=lambda a: a.created_at)]
    
    return jsonify({
        'total_assessments': len(assessments),
        'average_score': round(average_score, 2),
        'last_assessment': {
            'title': last_assessment.title,
            'date': last_assessment.created_at.isoformat(),
            'score': last_assessment.result.sustainability_score if last_assessment.result else None
        },
        'assessments': assessments_data
    }), 200

@analytics_bp.route('/comparison', methods=['GET'])
def get_comparison():
    """Get comparison between assessments"""
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    assessments = Assessment.query.filter_by(user_id=user_id).all()
    
    comparison_data = []
    for a in assessments:
        if a.result:
            comparison_data.append({
                'title': a.title,
                'revenue': a.revenue,
                'profit_margin': a.profit_margin,
                'debt_to_equity': a.debt_to_equity,
                'current_ratio': a.current_ratio,
                'roa': a.roa,
                'roe': a.roe,
                'sustainability_score': a.result.sustainability_score,
                'date': a.created_at.isoformat()
            })
    
    return jsonify(comparison_data), 200
