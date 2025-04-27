from app import db

class Chat(db.Model):
    __tablename__ = 'chat'
    id = db.Column(db.Integer, primary_key=True) # temporarily set to 1
    message_id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.Text, nullable=False)
    response = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)
    subject_name = db.Column(db.String(100), nullable=True)
    subject_desc = db.Column(db.Text, nullable=True)

    __table_args__ = (
        db.PrimaryKeyConstraint('id', 'message_id'),
    )