import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

// Constants
const SALT_WORK_FACTOR = 12;  // Increase salt rounds for stronger security
const RESET_PASSWORD_EXPIRATION = 60 * 60 * 1000; // 1 hour

// Schema Definition
const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    unique: true, 
    required: true, 
    index: true, 
    lowercase: true,
    trim: true, 
    match: [/\S+@\S+\.\S+/, 'Invalid email format'],
  },
  password_hash: { 
    type: String, 
    required: true 
  },
  phone: {
    type: String,
    unique: true,
    sparse: true, // Allows for optional unique field
    match: [/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'], // E.164 format validation
  },
  status: { 
    type: String, 
    enum: ['active', 'ban', 'suspended', 'pending', 'locked'],  // Added more states
    default: 'active', 
    index: true 
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator', 'creator'],
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
    select: false // Stored securely if 2FA is enabled
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
    select: false, // Excludes field from query by default
  },
  reset_password_expires: {
    type: Date,
    select: false,
  },
  password_changed_at: {
    type: Date, // Useful for session invalidation after password changes
  },
  login_attempts: {
    type: Number,
    default: 0,  // Track failed login attempts
  },
  lock_until: {
    type: Date, // Temporarily lock account after too many failed login attempts
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, // Automatic timestamps
  toJSON: { virtuals: true }, // Include virtuals in JSON output
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
userSchema.index({ created_at: 1, status: 1 });
userSchema.index({ email: 1, phone: 1 });
userSchema.index({ role: 1, last_login: 1 });

// Password Hashing Pre-Save Hook
userSchema.pre('save', async function (next) {
  if (!this.isModified('password_hash')) return next();

  try {
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    this.password_hash = await bcrypt.hash(this.password_hash, salt);
    this.password_changed_at = Date.now(); // Update password change timestamp
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
  const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours

  if (this.lock_until && this.lock_until > Date.now()) {
    return; // Account is already locked
  }

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
