import os
import joblib


# ai-service folder ka path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ML files ke paths
MODEL_PATH = os.path.join(BASE_DIR, "ml", "model.pkl")
VECTORIZER_PATH = os.path.join(BASE_DIR, "ml", "vectorizer.pkl")


# Trained model aur TF-IDF vectorizer load karo
model = joblib.load(MODEL_PATH)
vectorizer = joblib.load(VECTORIZER_PATH)


def predict_role(resume_text: str):

    # Resume text ko TF-IDF numerical features mein convert karo
    resume_vector = vectorizer.transform([resume_text])

    # Trained ML model se role predict karo
    predicted_role = model.predict(resume_vector)[0]

    # Agar model probability support karta hai
    confidence = None

    if hasattr(model, "predict_proba"):
        probabilities = model.predict_proba(resume_vector)[0]
        confidence = float(max(probabilities))

    return {
        "role": predicted_role,
        "confidence": confidence
    }