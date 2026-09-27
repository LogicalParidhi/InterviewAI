# services/resume_parser.py

"""
Resume file (PDF ya DOCX) se plain text nikalta hai.
Ye text baad me question_generator.py ko diya jayega.
"""

import os
import pdfplumber
from docx import Document


class ResumeParsingError(Exception):
    pass


def parse_resume(file_path: str) -> str:
    """
    file_path: locally saved resume file ka path (temp upload folder se)
    Returns: extracted plain text
    """
    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".pdf":
        return _parse_pdf(file_path)
    elif ext in (".docx", ".doc"):
        return _parse_docx(file_path)
    else:
        raise ResumeParsingError(f"Unsupported resume file type: {ext}")


def _parse_pdf(file_path: str) -> str:
    text_chunks = []
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_chunks.append(page_text)
    except Exception as e:
        raise ResumeParsingError(f"Failed to parse PDF resume: {str(e)}")

    text = "\n".join(text_chunks).strip()
    if not text:
        raise ResumeParsingError("No readable text found in the PDF resume.")
    return text


def _parse_docx(file_path: str) -> str:
    try:
        doc = Document(file_path)
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        text = "\n".join(paragraphs).strip()
    except Exception as e:
        raise ResumeParsingError(f"Failed to parse DOCX resume: {str(e)}")

    if not text:
        raise ResumeParsingError("No readable text found in the DOCX resume.")
    return text