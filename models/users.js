const mongoose = require('mongoose');
const argon2 = require('argon2');
const crypto = require('crypto');
const validator = require('validator');

// Constants
const RESET_PASSWORD_EXPIRATION = 60 * 60 * 1000; // 1 hour for reset token expiration
const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours lock for failed login attempts
const MAX_LOGIN_ATTEMPTS = 5; // Max login attempts before locking

// Schema Definition
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    match: [/^[a-zA-Z0-9._-]{3,30}$/, 'Invalid username format'],
    index: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: validator.isEmail,
      message: 'Invalid email format',
    },
  },
  email_verified: { 
    type: Boolean,
    default: false,
  },
  password_hash: {
    type: String,
    required: true,
  },
  phone_number: {
    type: String,
    unique: true,
    sparse: true,
    validate: {
      validator: (v) => validator.isMobilePhone(v, 'any', { strictMode: false }), // 'any' allows all phone formats
      message: 'Invalid phone number format'
    },
    index: true,
  },
  status: {
    type: String,
    enum: ['active', 'banned', 'suspended', 'pending', 'locked'],
    default: 'active',
    index: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user',
    index: true,
  },
  last_login: {
    type: Date,
    index: true,
  },
  two_factor_enabled: {
    type: Boolean,
    default: false,
  },
  two_factor_secret: {
    type: String,
    select: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  reset_password_token: {
    type: String,
    select: false,
  },
  reset_password_expires: {
    type: Date,
    select: false,
  },
  password_changed_at: {
    type: Date,
  },
  login_attempts: {
    type: Number,
    default: 0,
  },
  lock_until: {
    type: Date,
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtuals for Relationships
userSchema.virtual('profile', {
  ref: 'UserProfile',
  localField: '_id',
  foreignField: 'user_id',
  justOne: true,
});

// Password Hashing Pre-Save Hook using Argon2
userSchema.pre('save', async function (next) {
  if (!this.isModified('password_hash')) return next();

  try {
    this.password_hash = await argon2.hash(this.password_hash, {
      type: argon2.argon2id,
    });
    this.password_changed_at = Date.now();
    next();
  } catch (err) {
    next(err);
  }
});

// Compare Passwords using Argon2
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await argon2.verify(this.password_hash, candidatePassword);
};

// Generate Password Reset Token
userSchema.methods.generateResetPasswordToken = function () {
  const token = crypto.randomBytes(20).toString('hex');
  this.reset_password_token = crypto.createHash('sha256').update(token).digest('hex');
  this.reset_password_expires = Date.now() + RESET_PASSWORD_EXPIRATION;
  return token;
};

// Find User by Reset Token
userSchema.statics.findByResetPasswordToken = async function (token) {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  return await this.findOne({
    reset_password_token: hashedToken,
    reset_password_expires: { $gt: Date.now() },
  });
};

// Increment Failed Login Attempts and Lock Account if Necessary
userSchema.methods.incrementLoginAttempts = async function () {
  if (this.lock_until && this.lock_until > Date.now()) return;
  this.login_attempts += 1;
  if (this.login_attempts >= MAX_LOGIN_ATTEMPTS) {
    this.lock_until = Date.now() + LOCK_TIME;
    this.login_attempts = 0;
  }
  await this.save();
};

// Reset Failed Attempts After Successful Login
userSchema.methods.resetLoginAttempts = async function () {
  this.login_attempts = 0;
  this.lock_until = undefined;
  await this.save();
};

const User = mongoose.model('User', userSchema);
module.exports = User;