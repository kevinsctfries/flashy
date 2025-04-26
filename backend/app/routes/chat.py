from datetime import datetime
from zoneinfo import ZoneInfo
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
    user_tz = data.get('timezone', 'America/New_York')  # Default to ET if not provided
    
    if not message:
        return jsonify({'error': 'No message provided'}), 400
    
    # Create timestamp in user's timezone
    local_time = datetime.now(ZoneInfo(user_tz))
    
    chat = Chat(
        message=message,
        response=f'Received your message: {message}',
        conversation_id='test-conversation',
        created_at=local_time
    )
    
    db.session.add(chat)
    db.session.commit()
    
    return jsonify({
        'reply': chat.response,
        'timestamp': int(local_time.timestamp() * 1000)
    })

@chat_bp.route('/chat/conversation/<conversation_id>', methods=['GET'])
def get_conversation(conversation_id):
    messages = Chat.query\
        .filter_by(conversation_id=conversation_id)\
        .order_by(Chat.created_at.asc())\
        .all()
    
    return jsonify([{
        'text': msg.message,
        'response': msg.response,
        'timestamp': int(msg.created_at.timestamp() * 1000),
        'type': 'chat'
    } for msg in messages])