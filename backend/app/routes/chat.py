from flask import Blueprint, request, jsonify
from app import db
from app.models.chat import Chat

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/chat', methods=['POST', 'OPTIONS'])
def chat():
    if request.method == 'OPTIONS':
        return '', 204
    
    data = request.get_json()
    message = data.get('message')
    
    # Create new chat entry
    chat = Chat(
        message=message,
        response=f'Received your message: {message}',
        conversation_id='test-conversation'  # I'll get around to changing this
    )
    
    # Save to database
    db.session.add(chat)
    db.session.commit()
    
    return jsonify({
        'reply': chat.response
    })