import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import validator from 'validator'; // Assuming you're using 'validator' for validation

// Constants
const SALT_WORK_FACTOR = 12;  // Increased salt rounds for stronger security
const RESET_PASSWORD_EXPIRATION = 60 * 60 * 1000; // 1 hour for reset token expiration
const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours lock for failed login attempts

// Schema Definition
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    match: [/^[a-zA-Z0-9._-]{3,30}$/, 'Invalid username format'], // Restricting special characters
    index: true
  },
  email: { 
    type: String, 
    unique: true, 
    required: true, 
    index: true, 
    lowercase: true,
    trim: true, 
    validate: {
      validator: (v) => validator.isEmail(v),
      message: 'Invalid email format'
    }
  },
  password_hash: { 
    type: String, 
    required: true 
  },
  phone_number: {
    type: String,
    unique: true,
    sparse: true,
    validate: {
      validator: (v) => validator.isMobilePhone(v, null, { strictMode: true }),
      message: 'Invalid phone number format'
    },
    index: true
  },
  status: { 
    type: String, 
    enum: ['active', 'banned', 'suspended', 'pending', 'locked'],  
    default: 'active', 
    index: true 
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user',
    index: true
  },
  last_login: {
    type: Date,
    index: true
  },
  two_factor_enabled: {
    type: Boolean,
    default: false,
  },
  two_factor_secret: {
    type: String,
    select: false 
  },
  created_at: { 
    type: Date, 
    default: Date.now, 
    index: true 
  },
  updated_at: { 
    type: Date, 
    default: Date.now 
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
  toObject: { virtuals: true }
});

// Virtuals for Relationships
userSchema.virtual('profile', { 
  ref: 'UserProfile', 
  localField: '_id', 
  foreignField: 'user_id', 
  justOne: true 
});
userSchema.virtual('notifications', { 
  ref: 'Notification', 
  localField: '_id', 
  foreignField: 'user_id' 
});
userSchema.virtual('reviews', { 
  ref: 'Review', 
  localField: '_id', 
  foreignField: 'reviewer_user_id' 
});
userSchema.virtual('admin', { 
  ref: 'Admin', 
  localField: '_id', 
  foreignField: 'user_id', 
  justOne: true 
});

// Indexes for Performance
userSchema.index({ email: 1, phone_number: 1 });
userSchema.index({ username: 1, status: 1 });
userSchema.index({ role: 1, last_login: 1 });

// Password Hashing Pre-Save Hook
userSchema.pre('save', async function (next) {
  if (!this.isModified('password_hash')) return next();

  try {
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    this.password_hash = await bcrypt.hash(this.password_hash, salt);
    this.password_changed_at = Date.now();
    next();
  } catch (err) {
    next(err);
  }
});

// Compare Passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password_hash);
};

// Password Reset Token Generation
userSchema.methods.generateResetPasswordToken = function() {
  const token = crypto.randomBytes(20).toString('hex');
  this.reset_password_token = crypto.createHash('sha256').update(token).digest('hex');
  this.reset_password_expires = Date.now() + RESET_PASSWORD_EXPIRATION;
  return token; // Raw token to be sent via email
};

// Find User by Reset Token
userSchema.statics.findByResetPasswordToken = async function(token) {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  return await this.findOne({
    reset_password_token: hashedToken,
    reset_password_expires: { $gt: Date.now() }, // Ensure token has not expired
  });
};

// Increment Failed Login Attempts and Lock Account if Necessary
userSchema.methods.incrementLoginAttempts = async function() {
  if (this.lock_until && this.lock_until > Date.now()) return;

  this.login_attempts += 1;

  if (this.login_attempts >= 5) { // Lock after 5 failed attempts
    this.lock_until = Date.now() + LOCK_TIME;
    this.login_attempts = 0; // Reset failed attempts
  }

  await this.save();
};

// Reset Failed Attempts After Successful Login
userSchema.methods.resetLoginAttempts = async function() {
  this.login_attempts = 0;
  this.lock_until = undefined;
  await this.save();
};

const User = mongoose.model('User', userSchema);
export default User;
