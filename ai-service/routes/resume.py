# routes/resume.py

"""
Resume-related endpoints.
Node.js backend resume file yahan bhejega (ya uska temp path), aur
ye route extracted text wapas karega, jo Node DB me store karega.
"""

import os
import tempfile
from flask import Blueprint, request, jsonify

from services.resume_parser import parse_resume, ResumeParsingError

resume_bp = Blueprint("resume", __name__)


@resume_bp.route("/parse", methods=["POST"])
def parse_resume_endpoint():
    """
    POST /api/resume/parse
    multipart/form-data with a 'resume' file field.
    Returns: { success, data: { text }, error }
    """
    if "resume" not in request.files:
        return jsonify({"success": False, "error": "No 'resume' file provided."}), 400

    file = request.files["resume"]
    if file.filename == "":
        return jsonify({"success": False, "error": "Empty filename."}), 400

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in (".pdf", ".docx", ".doc"):
        return jsonify({"success": False, "error": f"Unsupported file type: {ext}"}), 400

    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            file.save(tmp.name)
            tmp_path = tmp.name

        extracted_text = parse_resume(tmp_path)

        return jsonify({
            "success": True,
            "data": {"text": extracted_text},
        }), 200

    except ResumeParsingError as e:
        return jsonify({"success": False, "error": str(e)}), 422
    except Exception as e:
        return jsonify({"success": False, "error": f"Unexpected error: {str(e)}"}), 500
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)