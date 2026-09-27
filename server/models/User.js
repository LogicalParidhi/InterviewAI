const mongoose = require('mongoose');
const { hashPassword, comparePassword } = require('../utils/hashPassword');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    email: {
      type: String,
      required: function () { return !this.phone; },
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    phone: {
      type: String,
      required: function () { return !this.email; },
      unique: true,
      sparse: true,
      trim: true,
      match: [/^\+[1-9]\d{7,14}$/, 'Please add a valid phone number with country code'],
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      minlength: [12, 'Password must be at least 12 characters'],
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      select: false,
    },
    passwordReset: {
      codeHash: { type: String, select: false },
      expiresAt: { type: Date, select: false },
      attempts: { type: Number, default: 0, select: false },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.password) {
    return next();
  }

  if (!this.isModified('password')) {
    return next();
  }
  try {
    this.password = await hashPassword(this.password);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await comparePassword(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
