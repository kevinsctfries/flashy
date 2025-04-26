from flask import Blueprint, request, jsonify
from app.models.flashcard import Flashcard
from app import db

flashcard_bp = Blueprint("flashcard", __name__)

@flashcard_bp.route("/flashcards", methods=["POST"])
def generate_flashcard():
    data = request.get_json()

    subject = data.get("subject")
    question = data.get("question")
    answer = data.get("answer")
    conversation_id = data.get("conversation_id")

    if not subject or not question or not answer:
        return jsonify({"error": "Subject, question, and answer are required."}), 400
    
    new_flashcard = Flashcard(
        subject=subject,
        question=question,
        answer=answer,
        conversation_id=conversation_id
    )

    db.session.add(new_flashcard)
    db.session.commit()

    return jsonify({
        "id": new_flashcard.id,
        "subject": new_flashcard.subject,
        "question": new_flashcard.question,
        "answer": new_flashcard.answer,
        "conversation_id": new_flashcard.conversation_id
    }), 201

@flashcard_bp.route('/flashcards/<conversation_id>', methods=['GET'])
def get_flashcards(conversation_id):
    flashcards = Flashcard.query.filter_by(conversation_id=conversation_id).all()
    return jsonify([{'subject': f.subject, 'question': f.question, 'answer': f.answer} for f in flashcards])
