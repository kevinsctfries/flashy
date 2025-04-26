from datetime import datetime
from zoneinfo import ZoneInfo
from app import db

class Chat(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.Text, nullable=False)
    response = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)
    conversation_id = db.Column(db.String(50), nullable=False)