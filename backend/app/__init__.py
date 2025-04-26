from flask import Flask

def create_app():
    app = Flask(__name__)

    from .routes.flashcard import flashcard_bp
    from .routes.upload import upload_bp

    app.register_blueprint(flashcard_bp, url_prefix="/api")
    app.register_blueprint(upload_bp, url_prefix="/api")

    return app