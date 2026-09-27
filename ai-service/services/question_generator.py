# services/question_generator.py

"""
Resume text + job role + requirements ke basis pe Gemini API se
interview questions generate karta hai. Output frontend ke
Question[] type (id, text, category, timeLimitSeconds, order)
ke exact shape me hota hai.
"""

import os
import json
import re
import google.generativeai as genai

from prompts.question_prompt import build_question_prompt

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-1.5-flash")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


class QuestionGenerationError(Exception):
    pass


def _extract_json_array(raw_text: str) -> str:
    """
    Gemini kabhi kabhi ```json fences ya extra text bhej deta hai,
    isliye safe tarike se JSON array nikalte hain.
    """
    cleaned = raw_text.strip()
    cleaned = re.sub(r"^```(json)?", "", cleaned).strip()
    cleaned = re.sub(r"```$", "", cleaned).strip()

    # agar phir bhi extra text ho, sirf [ ... ] wala part nikaal lo
    match = re.search(r"\[.*\]", cleaned, re.DOTALL)
    if match:
        return match.group(0)
    return cleaned


def generate_questions(
    resume_text: str,
    job_role: str,
    requirements: str = "",
    num_questions: int = None,
    duration: int = 20,
    difficulty: str = "Medium",
    interview_type: str = "Technical",
    previous_questions: list = None
) -> list:
    if not GEMINI_API_KEY:
        raise QuestionGenerationError("GEMINI_API_KEY is not set in environment variables.")

    if num_questions is None:
        if duration <= 10:
            num_questions = 5
        elif duration <= 15:
            num_questions = 7
        elif duration <= 20:
            num_questions = 9
        else:
            num_questions = 13

    prompt = build_question_prompt(
        resume_text=resume_text,
        job_role=job_role,
        difficulty=difficulty,
        interview_type=interview_type,
        duration=duration,
        num_questions=num_questions,
        previous_questions=previous_questions or [],
    )

    try:
        model = genai.GenerativeModel(GEMINI_MODEL)
        response = model.generate_content(prompt)
        raw_text = response.text
    except Exception as e:
        raise QuestionGenerationError(f"Gemini API call failed: {str(e)}")

    json_str = _extract_json_array(raw_text)

    try:
        questions = json.loads(json_str)
    except json.JSONDecodeError as e:
        raise QuestionGenerationError(f"Failed to parse Gemini response as JSON: {str(e)}")

    return _validate_and_normalize(questions)


def _validate_and_normalize(questions: list) -> list:
    """
    Ensure ki har question ka structure frontend ke Question type se match kare.
    Missing/invalid fields ko safe defaults se fill karte hain.
    """
    valid_categories = {"introduction", "technical", "behavioral", "situational", "closing"}
    normalized = []

    for idx, q in enumerate(questions):
        if not isinstance(q, dict) or "text" not in q:
            continue

        category = q.get("category", "technical")
        if category not in valid_categories:
            category = "technical"

        normalized.append({
            "id": q.get("id") or f"q{idx + 1}",
            "text": str(q["text"]).strip(),
            "category": category,
            "timeLimitSeconds": int(q.get("timeLimitSeconds", 90)),
            "order": int(q.get("order", idx + 1)),
        })

    if not normalized:
        raise QuestionGenerationError("Gemini did not return any valid questions.")

    return normalized
