# routes/interview.py

"""
Interview-related AI endpoints:
- Generate questions from resume + job role + requirements
- Evaluate a candidate's answer
"""

from flask import Blueprint, request, jsonify

from services.question_generator import generate_questions, QuestionGenerationError
from services.answer_evaluator import evaluate_answer, AnswerEvaluationError

interview_bp = Blueprint("interview", __name__)


@interview_bp.route("/generate-questions", methods=["POST"])
def generate_questions_endpoint():
    """
    POST /api/interview/generate-questions
    Body (JSON):
    {
      "resumeText": "...",     // resume se extracted text (DB se already stored)
      "jobRole": "Backend Developer",
      "requirements": "3+ years experience, Node.js, MongoDB, REST APIs",
      "numQuestions": 6         // optional, default 6
    }

    Returns: { success, data: Question[], error }
    """
    body = request.get_json(silent=True) or {}

    resume_text = body.get("resumeText")
    job_role = body.get("jobRole")
    requirements = body.get("requirements", "")
    num_questions_raw = body.get("numQuestions")
    duration_raw = body.get("duration", 20)
    difficulty = body.get("difficulty", "Medium")
    interview_type = body.get("interviewType", "Technical")
    previous_questions = body.get("previousQuestions", [])
    if not isinstance(previous_questions, list):
        previous_questions = []

    if not resume_text:
        return jsonify({"success": False, "error": "resumeText is required."}), 400
    if not job_role:
        return jsonify({"success": False, "error": "jobRole is required."}), 400

    num_questions = None
    if num_questions_raw is not None:
        try:
            num_questions = int(num_questions_raw)
        except (ValueError, TypeError):
            num_questions = None

    try:
        duration = int(duration_raw)
    except (ValueError, TypeError):
        duration = 20

    try:
        questions = generate_questions(
            resume_text=resume_text,
            job_role=job_role,
            requirements=requirements,
            num_questions=num_questions,
            duration=duration,
            difficulty=difficulty,
            interview_type=interview_type,
            previous_questions=previous_questions,
        )
        return jsonify({"success": True, "data": questions}), 200

    except QuestionGenerationError as e:
        return jsonify({"success": False, "error": str(e)}), 422
    except Exception as e:
        return jsonify({"success": False, "error": f"Unexpected error: {str(e)}"}), 500


@interview_bp.route("/evaluate-answer", methods=["POST"])
def evaluate_answer_endpoint():
    """
    POST /api/interview/evaluate-answer
    Body (JSON):
    {
      "questionText": "...",
      "category": "technical",
      "answerText": "..."
    }

    Returns: { success, data: { score, justification, improvementTips }, error }
    """
    body = request.get_json(silent=True) or {}

    question_text = body.get("questionText")
    category = body.get("category", "technical")
    answer_text = body.get("answerText", "")

    if not question_text:
        return jsonify({"success": False, "error": "questionText is required."}), 400

    try:
        result = evaluate_answer(
            question_text=question_text,
            category=category,
            answer_text=answer_text,
        )
        return jsonify({"success": True, "data": result}), 200

    except AnswerEvaluationError as e:
        return jsonify({"success": False, "error": str(e)}), 422
    except Exception as e:
        return jsonify({"success": False, "error": f"Unexpected error: {str(e)}"}), 500
