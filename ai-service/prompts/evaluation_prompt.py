# prompts/evaluation_prompt.py

"""
Candidate ke answer ko evaluate karne ke liye Gemini prompt banata hai.
Now includes 5 sub-category scores for detailed report breakdown.
"""


def build_evaluation_prompt(question_text: str, category: str, answer_text: str) -> str:
    prompt = f"""
You are an expert interview evaluator. Evaluate the candidate's spoken/written answer
to the interview question below.

QUESTION ({category}):
{question_text}

CANDIDATE'S ANSWER:
\"\"\"
{answer_text}
\"\"\"

INSTRUCTIONS:
- Score the answer from 0 to 10 (10 = excellent, 0 = no relevant answer given).
- Also provide 5 sub-category scores, each from 0 to 10:
  * technicalScore: How technically accurate and deep is the answer?
  * communicationScore: How clearly and articulately did the candidate express their answer?
  * grammarScore: How correct is the grammar, sentence structure, and language usage?
  * confidenceScore: How confident and assertive does the candidate sound?
  * problemSolvingScore: How well does the candidate demonstrate analytical and problem-solving ability?
- Give a short 1-2 sentence justification for the overall score.
- Give 1-2 short, constructive improvement tips.
- Be fair and objective. If the answer is empty or irrelevant, score it low and say so clearly.
- Return STRICTLY valid JSON, no markdown, no explanation text, matching this exact schema:

{{
  "score": 7,
  "technicalScore": 8,
  "communicationScore": 7,
  "grammarScore": 9,
  "confidenceScore": 6,
  "problemSolvingScore": 7,
  "justification": "short reason for the score",
  "improvementTips": ["tip 1", "tip 2"]
}}

Return ONLY the JSON object. Do not include ```json fences or any other text.
"""
    return prompt.strip()