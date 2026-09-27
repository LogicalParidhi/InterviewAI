# app.py

import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

from routes.resume import resume_bp
from routes.interview import interview_bp


def create_app():
    app = Flask(__name__)
    CORS(app)  # Node.js backend / frontend se cross-origin calls allow karega

    # Blueprints register karo — Node backend inhi paths pe hit karega
    app.register_blueprint(resume_bp, url_prefix="/api/resume")
    app.register_blueprint(interview_bp, url_prefix="/api/interview")

    @app.route("/health", methods=["GET"])
    def health_check():
        return jsonify({"success": True, "message": "AI service is running"}), 200

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"success": False, "error": "Route not found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"success": False, "error": "Internal server error"}), 500

    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    debug = os.environ.get("FLASK_ENV", "development") == "development"
    app.run(host="0.0.0.0", port=port, debug=debug)