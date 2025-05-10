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
    
    try:
        data = request.get_json()
        message = data.get('message')
        user_tz = data.get('timezone', 'America/New_York')
        conversation_id = data.get('conversation_id')  # Get ID from request
        
        if not message:
            return jsonify({'error': 'No message provided'}), 400
        
        if not conversation_id:
            return jsonify({'error': 'No conversation ID provided'}), 400

        latest_message = Chat.query.filter_by(id=conversation_id)\
            .order_by(Chat.message_id.desc()).first()
        
        if not latest_message:
            return jsonify({'error': 'Conversation not found'}), 404
            
        message_id = latest_message.message_id + 1

        local_time = datetime.now(ZoneInfo(user_tz))
        
        flashcards = generate_flashcards(message)
        if flashcards:
            formatted_pairs = [
                f'  <div class="flashcard-pair">'
                f'    <div class="question">{fc["question"]}</div>'
                f'    <div class="answer">{fc["answer"]}</div>'
                f'  </div>'
                for fc in flashcards
            ]
            ai_response = "\n".join(formatted_pairs)
        else:
            ai_response = "No questions could be generated from the input."

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

    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        return jsonify({'error': str(e)}), 500

@chat_bp.route('/chat/conversation/<int:conversation_id>', methods=['GET'])
def get_conversation(conversation_id):
    messages = Chat.query\
        .filter_by(id=conversation_id)\
        .order_by(Chat.message_id.asc())\
        .all()
    
    formatted_messages = []
    for msg in messages:
        if msg.message and msg.message != "Conversation started":
            # Add sent message
            formatted_messages.append({
                'text': msg.message,
                'timestamp': int(msg.created_at.timestamp() * 1000),
                'type': 'sent'
            })
        if msg.response and msg.response != "Welcome to your new study session!":
            # Add received message
            formatted_messages.append({
                'text': msg.response,
                'timestamp': int(msg.created_at.timestamp() * 1000),
                'type': 'received'
            })
    
    return jsonify(formatted_messages)

@chat_bp.route('/chat/new', methods=['POST'])
def new_conversation():
    data = request.get_json()
    subject_name = data.get('subject_name')
    subject_desc = data.get('subject_desc')
    
    if not subject_name or not subject_desc:
        return jsonify({'error': 'Subject name and description are required'}), 400
    
    latest_chat = Chat.query.order_by(Chat.id.desc()).first()
    new_id = (latest_chat.id + 1) if latest_chat else 1
    
    chat = Chat(
        id=new_id,
        message_id=1,
        message="Conversation started",
        response="Welcome to your new study session!",
        created_at=datetime.now(ZoneInfo('UTC')),
        subject_name=subject_name,
        subject_desc=subject_desc
    )
    
    db.session.add(chat)
    db.session.commit()
    
    return jsonify({
        'conversation_id': new_id,
        'subject_name': subject_name,
        'subject_desc': subject_desc
    })