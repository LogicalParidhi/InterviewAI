import joblib

model = joblib.load("ml/model.pkl")
vectorizer = joblib.load("ml/vectorizer.pkl")
encoder = joblib.load("ml/encoder.pkl")

resume = """
Java developer with experience in Java, Spring Boot, REST APIs,
MySQL, Git, Data Structures and backend development.
"""

# Resume -> TF-IDF
X = vectorizer.transform([resume])

# Prediction
prediction = model.predict(X)[0]

# Category ID -> Category name
category = encoder.inverse_transform([prediction])[0]

print("\nPredicted Category ID:", prediction)
print("Predicted Category:", category)

# Confidence
probabilities = model.predict_proba(X)[0]

confidence = max(probabilities) * 100

print("Confidence:", round(confidence, 2), "%")

# Top 5
print("\nTop 5 Predictions:")

top5 = probabilities.argsort()[-5:][::-1]

for i in top5:
    role = encoder.inverse_transform([i])[0]
    score = probabilities[i] * 100

    print(f"{role}: {score:.2f}%")