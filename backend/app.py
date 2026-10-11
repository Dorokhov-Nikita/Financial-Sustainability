from flask import Flask, render_template, send_from_directory
from flask_cors import CORS
from flask_session import Session
from config import config_by_name
from models import db, init_db
from routes import register_blueprints
import os

def create_app(config_name='development'):
    """Application factory"""
    app = Flask(__name__, 
                static_folder=os.path.join(os.path.dirname(__file__), '..', 'frontend'),
                static_url_path='/')
    
    # Configuration
    app.config.from_object(config_by_name.get(config_name, 'development'))
    
    # CORS
    CORS(app, 
         supports_credentials=True,
         origins=['http://localhost:5000', 'http://localhost:3000', 'http://127.0.0.1:5000'])
    
    # Session
    app.config['SESSION_TYPE'] = 'filesystem'
    Session(app)
    # Database
    db.init_app(app)
    
    # Blueprints
    register_blueprints(app)
    
    # Serve frontend
    @app.route('/')
    def index():
        return send_from_directory(app.static_folder, 'index.html')
    
    @app.route('/<path:path>')
    def serve_frontend(path):
        if path and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        return send_from_directory(app.static_folder, 'index.html')
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return send_from_directory(app.static_folder, 'index.html')
    
    return app

if __name__ == '__main__':
    app = create_app('development')
    app.run(debug=True, host='localhost', port=5000)
