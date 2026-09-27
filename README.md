# InterviewAI

Personalized AI mock interviews: resume-aware questions, voice answers, and practical feedback.

## Project structure

```text
InterviewAI/
├── client/                         # React + TypeScript + Vite web app
│   ├── src/
│   │   ├── components/              # Reusable UI (route guard, Google button)
│   │   ├── context/                 # Authentication state
│   │   ├── pages/                   # Landing, login, register, recovery, dashboard
│   │   └── services/                # API client
│   └── .env.example                 # Safe browser environment template
└── server/                          # Express + MongoDB API
    ├── config/                      # Database connection
    ├── controllers/                 # Authentication and recovery logic
    ├── middleware/                  # JWT route protection
    ├── models/                      # Mongoose schemas
    ├── routes/                      # API endpoints
    ├── utils/                       # Password hashing, JWTs, reset delivery
    └── .env.example                 # Safe server environment template
```

## Run locally

1. Copy `server/.env.example` to `server/.env`; generate a long random `JWT_SECRET`, set MongoDB, Google, and SMTP values.
2. Copy `client/.env.example` to `client/.env` and set the same Google client ID.
3. Start the resume/AI service in a separate terminal:
   `cd ai-service; .\venv\Scripts\python.exe app.py`
4. Run `npm run dev` in `server`, then `npm run dev` in `client`.

The AI service must be running at `http://localhost:8000` while resumes are uploaded.
If an earlier upload was saved before the AI service was running, starting a new interview will automatically retry parsing that stored PDF.

## Authentication security

- Passwords are bcrypt-hashed (12 rounds), never stored in plain text.
- Passwords need 12+ characters including upper/lowercase, number, and symbol.
- Google identity tokens are verified server-side against your Google client ID.
- Password-reset OTPs are random, SHA-256 hashed, expire in 10 minutes, and are limited to five attempts.
- Helmet, CORS allowlisting, and global/auth-specific rate limits reduce common web attacks.

Use MongoDB Atlas with a private database user, IP/network restrictions, backups, and least-privilege credentials. Application code cannot make a database impossible to attack or delete; resilient backups and access control are the real protection against that risk.
