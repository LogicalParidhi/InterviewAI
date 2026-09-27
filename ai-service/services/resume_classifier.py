import os
import joblib


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MODEL_PATH = os.path.join(BASE_DIR, "ml", "model.pkl")
VECTORIZER_PATH = os.path.join(BASE_DIR, "ml", "vectorizer.pkl")
ENCODER_PATH = os.path.join(BASE_DIR, "ml", "encoder.pkl")


model = joblib.load(MODEL_PATH)
vectorizer = joblib.load(VECTORIZER_PATH)
encoder = joblib.load(ENCODER_PATH)


def classify_resume(resume_text: str):

    # Resume text ko numbers/features mein convert karo
    X = vectorizer.transform([resume_text])

    # Prediction probabilities
    probabilities = model.predict_proba(X)[0]

    # Highest probability wala class
    predicted_index = probabilities.argmax()

    # Class ID → actual role
    predicted_role = encoder.inverse_transform([predicted_index])[0]

    confidence = float(probabilities[predicted_index])

    return {
        "category": predicted_role,
        "confidence": round(confidence * 100, 2)
    }