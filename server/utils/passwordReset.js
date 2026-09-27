const crypto = require('crypto');
const nodemailer = require('nodemailer');

const hashOtp = (code) => crypto.createHash('sha256').update(code).digest('hex');
const createOtp = () => crypto.randomInt(100000, 1000000).toString();

const sendResetCode = async ({ email, code }) => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM || user;

  if (!host || !user || !pass) {
    if (process.env.NODE_ENV === 'production') throw new Error('Email delivery is not configured');
    console.info(`[DEV ONLY] Password reset code for ${email}: ${code}`);
    return;
  }
  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass },
  });
  await transporter.sendMail({
    from,
    to: email,
    subject: 'Your InterviewAI password reset code',
    text: `Your InterviewAI password reset code is ${code}. It expires in 10 minutes. Do not share it with anyone.`,
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #020617;
      color: #f1f5f9;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #020617;
      padding: 40px 0;
    }
    .container {
      max-width: 480px;
      margin: 0 auto;
      background-color: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 16px;
      padding: 40px 32px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
    }
    .logo {
      text-align: center;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.025em;
      margin-bottom: 24px;
      color: #ffffff;
    }
    .logo span {
      color: #6366f1;
    }
    .title {
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
      text-align: center;
      margin-bottom: 12px;
    }
    .text {
      font-size: 15px;
      line-height: 24px;
      color: #94a3b8;
      text-align: center;
      margin-bottom: 32px;
    }
    .code-container {
      background-color: #020617;
      border: 1px dashed #4f46e5;
      border-radius: 12px;
      padding: 16px;
      text-align: center;
      margin-bottom: 32px;
    }
    .code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 36px;
      font-weight: 800;
      color: #818cf8;
      letter-spacing: 6px;
    }
    .footer {
      font-size: 12px;
      color: #64748b;
      text-align: center;
      line-height: 18px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="logo">Interview<span>AI</span></div>
      <div class="title">Reset your password</div>
      <div class="text">
        We received a request to reset your password. Use the verification code below to proceed. This code will expire in 10 minutes.
      </div>
      <div class="code-container">
        <span class="code" style="padding-left: 6px;">${code}</span>
      </div>
      <div class="text" style="font-size: 13px; margin-bottom: 40px; color: #64748b;">
        If you did not request this, you can safely ignore this email. Your password will remain unchanged.
      </div>
      <div class="footer">
        &copy; 2026 InterviewAI. All rights reserved.<br>
        Securing your credentials with industry-standard encryption.
      </div>
    </div>
  </div>
</body>
</html>`,
  });
};

module.exports = { hashOtp, createOtp, sendResetCode };
