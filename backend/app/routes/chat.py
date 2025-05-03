from datetime import datetime
from zoneinfo import ZoneInfo
from flask import Blueprint, request, jsonify
from app import db
from app.models.chat import Chat
from app.models.model_loader import generate_flashcards

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/chat', methods=['POST', 'OPTIONS'])
def chat():
    if request.method == 'OPTIONS':
        return '', 204
    
    data = request.get_json()
    message = data.get('message')
    user_tz = data.get('timezone', 'America/New_York')
    
    if not message:
        return jsonify({'error': 'No message provided'}), 400

    # temporarily set to 1, will fix later
    conversation_id = 1

    latest_message = Chat.query.filter_by(id=conversation_id)\
        .order_by(Chat.message_id.desc()).first()
    message_id = (latest_message.message_id + 1) if latest_message else 1

    local_time = datetime.now(ZoneInfo(user_tz))
    
    try:
        flashcards = generate_flashcards(message)
        if flashcards:
            # format each Q&A pair with separate divs for questions and answers
            formatted_pairs = [
                f'<div class="question">{fc["question"]}</div><div class="answer">{fc["answer"]}</div>'
                for fc in flashcards
            ]
            ai_response = "".join(formatted_pairs)
        else:
            ai_response = "No questions could be generated from the input."


    except Exception as e:
        print(f"Flashcard generation error: {e}")
        ai_response = f"Error generating flashcards for: {message}"
    
    chat = Chat(
        id=conversation_id,
        message_id=message_id,
        message=message,
        response=ai_response,
        created_at=local_time
    )
    
    db.session.add(chat)
    db.session.commit()
    
    return jsonify({
        'reply': chat.response,
        'timestamp': int(local_time.timestamp() * 1000),
        'conversation_id': conversation_id
    })

@chat_bp.route('/chat/conversation/<int:conversation_id>', methods=['GET'])
def get_conversation(conversation_id):
    messages = Chat.query\
        .filter_by(id=conversation_id)\
        .order_by(Chat.message_id.asc())\
        .all()
    
    return jsonify([{
        'text': msg.message,
        'response': msg.response,
        'timestamp': int(msg.created_at.timestamp() * 1000),
        'type': 'received'
    } for msg in messages])