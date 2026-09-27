# services/answer_evaluator.py

"""
Candidate ke diye gaye answer ko Gemini se evaluate karwata hai —
score, justification, aur improvement tips return karta hai.
"""

import os
import json
import re
import google.generativeai as genai

from prompts.evaluation_prompt import build_evaluation_prompt

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-1.5-flash")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


class AnswerEvaluationError(Exception):
    pass


def _extract_json_object(raw_text: str) -> str:
    cleaned = raw_text.strip()
    cleaned = re.sub(r"^```(json)?", "", cleaned).strip()
    cleaned = re.sub(r"```$", "", cleaned).strip()

    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if match:
        return match.group(0)
    return cleaned


def evaluate_answer(question_text: str, category: str, answer_text: str) -> dict:
    if not GEMINI_API_KEY:
        raise AnswerEvaluationError("GEMINI_API_KEY is not set in environment variables.")

    if not answer_text or not answer_text.strip():
        # Empty answer ke liye Gemini call karne ki zaroorat nahi
        return {
            "score": 0,
            "justification": "No answer was provided for this question.",
            "improvementTips": ["Try to answer every question, even briefly, to demonstrate your thinking."],
        }

    prompt = build_evaluation_prompt(
        question_text=question_text,
        category=category,
        answer_text=answer_text,
    )

    try:
        model = genai.GenerativeModel(GEMINI_MODEL)
        response = model.generate_content(prompt)
        raw_text = response.text
    except Exception as e:
        raise AnswerEvaluationError(f"Gemini API call failed: {str(e)}")

    json_str = _extract_json_object(raw_text)

    try:
        result = json.loads(json_str)
    except json.JSONDecodeError as e:
        raise AnswerEvaluationError(f"Failed to parse Gemini response as JSON: {str(e)}")

    return _validate_and_normalize(result)


def _validate_and_normalize(result: dict) -> dict:
    score = result.get("score", 0)
    try:
        score = max(0, min(10, int(score)))
    except (ValueError, TypeError):
        score = 0

    justification = str(result.get("justification", "")).strip() or "No justification provided."

    tips = result.get("improvementTips", [])
    if not isinstance(tips, list):
        tips = []
    tips = [str(t).strip() for t in tips if str(t).strip()]

    # Sub-category scores (each 0-10, null if not provided)
    sub_score_keys = [
        "technicalScore",
        "communicationScore",
        "grammarScore",
        "confidenceScore",
        "problemSolvingScore",
    ]
    sub_scores = {}
    for key in sub_score_keys:
        raw = result.get(key)
        if raw is not None:
            try:
                sub_scores[key] = max(0, min(10, int(raw)))
            except (ValueError, TypeError):
                sub_scores[key] = None
        else:
            sub_scores[key] = None

    return {
        "score": score,
        "justification": justification,
        "improvementTips": tips,
        **sub_scores,
    }