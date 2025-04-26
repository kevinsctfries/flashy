from app import create_app, db
from app.models.flashcard import Flashcard

app = create_app()

with app.app_context():
    db.create_all()
    print("Database initialized and tables created.")