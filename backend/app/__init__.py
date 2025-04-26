from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from settings import Config
from flask_cors import CORS

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    db.init_app(app)

    from app.routes.flashcard import flashcard_bp
    from app.routes.upload import upload_bp
    from app.routes.chat import chat_bp

    app.register_blueprint(flashcard_bp, url_prefix="/api")
    app.register_blueprint(upload_bp, url_prefix="/api")
    app.register_blueprint(chat_bp, url_prefix="/api")

    return app