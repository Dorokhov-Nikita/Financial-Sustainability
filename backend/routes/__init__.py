from flask import Blueprint

# Create blueprints
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')
profile_bp = Blueprint('profile', __name__, url_prefix='/api/profile')
assessment_bp = Blueprint('assessment', __name__, url_prefix='/api/assessment')

def register_blueprints(app):
    """Register all blueprints with the app"""
    from .import auth, profile, assessment
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(assessment_bp)
