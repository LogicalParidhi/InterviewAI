QUESTION_CATEGORIES = [
    "introduction",
    "technical",
    "behavioral",
    "situational",
    "closing",
]


def build_question_prompt(
    resume_text: str,
    job_role: str,
    difficulty: str,
    interview_type: str,
    duration: int,
    num_questions: int,
    previous_questions: list = None
) -> str:
    total_seconds = duration * 60

    recent_questions = "\n".join(
        f"- {question}"
        for question in (previous_questions or [])[-30:]
    ) or "None"

    prompt = f"""
You are a Senior Technical Interviewer. Generate exactly {num_questions} interview questions
for a candidate based on their resume, target job role, difficulty level, and interview type.

JOB ROLE:
{job_role}

DIFFICULTY LEVEL:
{difficulty}

INTERVIEW TYPE:
{interview_type}

CANDIDATE RESUME:
\"\"\"
{resume_text}
\"\"\"

TOTAL INTERVIEW TIME LIMIT:
{duration} minutes ({total_seconds} seconds)

QUESTIONS ALREADY USED IN RECENT INTERVIEWS:
{recent_questions}

INSTRUCTIONS:
- Generate exactly {num_questions} questions.
- Do not repeat, closely paraphrase, or reuse the same focus as recent questions.
- Use different resume skills, projects, and question angles in every new interview.
- Mix architecture, debugging, testing, performance, security, scalability, trade-offs, and teamwork.
- Cover a mix of these categories: {", ".join(QUESTION_CATEGORIES)}.
- The first question must have category "introduction".
- The last question must have category "closing".
- Identify named skills, project names, and project details from the resume.
- Every technical question must explicitly mention at least one skill or project from the resume.
- Use project-specific questions about architecture, contribution, debugging, testing, scale, or trade-offs.
- Do not ask generic questions such as "Explain React".
- Do not invent technologies that are not in the resume.
- Match the selected difficulty level:
  - Easy: Basics, definitions, and simple practical scenarios.
  - Medium: Trade-offs, debugging, database work, and project implementation.
  - Hard: Architecture, scalability, concurrency, performance tuning, and complex edge cases.
- Assign a timeLimitSeconds value from 60 to 180 seconds.
- The sum of all timeLimitSeconds must equal exactly {total_seconds}.
- Return only valid JSON. Do not use Markdown or explanations.

Use this exact JSON structure:

[
  {{
    "id": "q1",
    "text": "question text here",
    "category": "introduction | technical | behavioral | situational | closing",
    "timeLimitSeconds": 90,
    "order": 1
  }}
]
"""

    return prompt.strip()