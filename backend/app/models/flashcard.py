from app import db
from datetime import datetime, timezone

class Flashcard(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    subject = db.Column(db.String(100), nullable=False)
    question = db.Column(db.Text, nullable=False)
    answer = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    conversation_id = db.Column(db.String(50), nullable=True) # Groups cards by conversation ID

    def __repr__(self):
        return f"<Flashcard {self.subject}: {self.question[:30]}>"