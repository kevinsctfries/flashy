from flask import Blueprint, jsonify, request
from app.models.model_loader import check_model_downloaded, download_model, get_download_progress

model_bp = Blueprint('model', __name__)

@model_bp.route('/model/check', methods=['GET'])
def check_model():
    return jsonify({"downloaded": check_model_downloaded()})

@model_bp.route('/model/download', methods=['POST'])
def start_download():
    try:
        token = request.json.get('token') if request.json else None
        success = download_model(token)
        if success:
            return jsonify({"status": "success"})
        else:
            progress = get_download_progress()
            if progress.get('requires_token'):
                return jsonify({"error": "Authentication required", "requires_token": True}), 401
            return jsonify({"error": progress.get('error_message', 'Download failed')}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@model_bp.route('/model/progress', methods=['GET'])
def get_progress():
    return jsonify(get_download_progress())