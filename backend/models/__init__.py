from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def init_db(app):
    """Initialize database with the app"""
    with app.app_context():
        db.create_all()
