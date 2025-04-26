from flask import Blueprint

flashcard_bp = Blueprint("flashcard", __name__)

@flashcard_bp.route("/generate")
def generate_flashcard():
    return "Flashcard generation route works!"