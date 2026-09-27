const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { OAuth2Client } = require('google-auth-library');
const { hashOtp, createOtp, sendResetCode } = require('../utils/passwordReset');

const googleClient = new OAuth2Client();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+[1-9]\d{7,14}$/;
const isStrongPassword = (password) => typeof password === 'string' && password.length >= 12 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password);
const normalizePhone = (phone) => phone ? phone.replace(/[\s()-]/g, '') : undefined;
const findUserByIdentifier = (identifier) => {
  const value = String(identifier || '').trim().toLowerCase();
  return emailPattern.test(value) ? User.findOne({ email: value }) : User.findOne({ phone: normalizePhone(value) });
};

const sendAuthResponse = (res, statusCode, user) =>
  res.status(statusCode).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    },
  });

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedPhone = normalizePhone(phone);

    // Validation
    if (!name?.trim() || (!normalizedEmail && !normalizedPhone) || !password) {
      return res.status(400).json({ success: false, message: 'Please provide your name, a valid email or phone number, and password' });
    }
    if (normalizedEmail && !emailPattern.test(normalizedEmail)) return res.status(400).json({ success: false, message: 'Enter a valid email address' });
    if (normalizedPhone && !phonePattern.test(normalizedPhone)) return res.status(400).json({ success: false, message: 'Enter a valid phone number with country code' });
    if (!isStrongPassword(password)) return res.status(400).json({ success: false, message: 'Password must be 12+ characters and include upper, lower, number, and symbol' });

    // Check if user already exists
    const userExists = await User.findOne({ $or: [normalizedEmail ? { email: normalizedEmail } : null, normalizedPhone ? { phone: normalizedPhone } : null].filter(Boolean) });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      password,
    });

    if (user) {
      return sendAuthResponse(res, 201, user);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Register Error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { identifier, email, password } = req.body;
    const loginIdentifier = identifier || email;

    // Validation
    if (!loginIdentifier || !password) {
      return res.status(400).json({ success: false, message: 'Please provide your email or phone number and password' });
    }

    // Check for user (need to select password explicitly since select: false is set in schema)
    const user = await findUserByIdentifier(loginIdentifier).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    return sendAuthResponse(res, 200, user);
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Authenticate with a Google ID token
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
      return res.status(503).json({ success: false, message: 'Google sign-in is not configured' });
    }

    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential is required' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    const payload = ticket.getPayload();

    if (!payload?.sub || !payload.email || !payload.email_verified) {
      return res.status(401).json({ success: false, message: 'Google account email could not be verified' });
    }

    let user = await User.findOne({ googleId: payload.sub }).select('+googleId');
    if (user) {
      return sendAuthResponse(res, 200, user);
    }

    const existingEmailUser = await User.findOne({ email: payload.email });
    if (existingEmailUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists. Sign in with your password first.',
      });
    }

    user = await User.create({
      name: payload.name || payload.email.split('@')[0],
      email: payload.email,
      googleId: payload.sub,
    });

    return sendAuthResponse(res, 201, user);
  } catch (error) {
    console.error('Google Login Error:', error.message);
    return res.status(401).json({ success: false, message: 'Google sign-in failed. Please try again.' });
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    // req.user was populated by protect middleware
    return res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    console.error('Get Me Error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc Request a short-lived one-time reset code. Always returns the same response to avoid account enumeration.
const requestPasswordReset = async (req, res) => {
  try {
    const { identifier } = req.body;
    const email = String(identifier || '').trim().toLowerCase();
    if (!emailPattern.test(email)) return res.status(400).json({ success: false, message: 'Enter a valid email address' });
    const user = await User.findOne({ email }).select('+passwordReset.codeHash +passwordReset.expiresAt +passwordReset.attempts');
    if (user && user.email) {
      const code = createOtp();
      user.passwordReset = { codeHash: hashOtp(code), expiresAt: new Date(Date.now() + 10 * 60 * 1000), attempts: 0 };
      await user.save({ validateBeforeSave: false });
      await sendResetCode({ email: user.email, code });
    }
    return res.status(200).json({ success: true, message: 'If an account matches, a reset code has been sent.' });
  } catch (error) {
    console.error('Password reset request error:', error.message);
    return res.status(503).json({ success: false, message: 'Unable to send a reset code right now. Please try again later.' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { identifier, code, password } = req.body;
    if (!identifier || !code || !password) return res.status(400).json({ success: false, message: 'Identifier, code, and new password are required' });
    const email = String(identifier).trim().toLowerCase();
    if (!emailPattern.test(email)) return res.status(400).json({ success: false, message: 'Enter a valid email address' });
    if (!isStrongPassword(password)) return res.status(400).json({ success: false, message: 'Password must be 12+ characters and include upper, lower, number, and symbol' });
    const user = await User.findOne({ email }).select('+password +passwordReset.codeHash +passwordReset.expiresAt +passwordReset.attempts');
    const reset = user?.passwordReset;
    if (!user || !reset?.codeHash || !reset.expiresAt || reset.expiresAt < new Date() || reset.attempts >= 5) {
      return res.status(400).json({ success: false, message: 'This reset code is invalid or expired. Request a new one.' });
    }
    if (hashOtp(String(code)) !== reset.codeHash) {
      user.passwordReset.attempts += 1;
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({ success: false, message: 'This reset code is invalid or expired. Request a new one.' });
    }
    user.password = password;
    user.passwordReset = undefined;
    await user.save();
    return sendAuthResponse(res, 200, user);
  } catch (error) {
    console.error('Password reset error:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to reset password' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleLogin,
  getMe,
  requestPasswordReset,
  resetPassword,
};
