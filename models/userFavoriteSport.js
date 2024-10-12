const mongoose = require('mongoose');
const { isValidObjectId } = require('mongoose'); 
const validator = require('validator');

const userFavoriteSportSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true,
    validate: {
      validator: isValidObjectId,
      message: 'Invalid user ID'
    },
  },
  sport_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Sport', 
    required: true, 
    index: true,
    validate: {
      validator: isValidObjectId,
      message: 'Invalid sport ID'
    },
  },
  status: {
    type: String,
    enum: ['active', 'removed', 'archived'],
    default: 'active',
    index: true
  },
  ip_address: {
    type: String,
    validate: {
      validator: (v) => validator.isIP(v),
      message: 'Invalid IP address'
    },
    required: true 
  },
  geo_location: {
    type: { type: String, enum: ['Point'], default: 'Point' }, 
    coordinates: { type: [Number], required: false }, 
  },
  version: {
    type: Number, 
    default: 1 
  },
  status_history: [{
    status: String,
    changed_at: { type: Date, default: Date.now }
  }], 
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, 
    index: true
  },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    default: null
  },
  deleted_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null 
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
  deleted_at: {
    type: Date,
    default: null,
    index: true 
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Composite index to ensure unique user-sport relationship
userFavoriteSportSchema.index({ user_id: 1, sport_id: 1 }, { unique: true });

// Virtual for populating user details
userFavoriteSportSchema.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: '_id',
  justOne: true
});

// Virtual for populating sport details
userFavoriteSportSchema.virtual('sport', {
  ref: 'Sport',
  localField: 'sport_id',
  foreignField: '_id',
  justOne: true
});

// Pre-save hook to handle versioning and IP validation
userFavoriteSportSchema.pre('save', function (next) {
  if (this.isModified()) {
    this.updated_at = Date.now();
    this.version += 1; 
  }
  next();
});

// Pre-save hook to log status changes
userFavoriteSportSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.status_history.push({ status: this.status });
  }
  next();
});

// Soft delete method
userFavoriteSportSchema.methods.softDelete = async function (deleted_by) {
  this.status = 'removed';
  this.deleted_by = deleted_by;
  this.deleted_at = Date.now();
  await this.save();
};

// Restore method for soft deleted records
userFavoriteSportSchema.methods.restore = async function () {
  this.status = 'active';
  this.deleted_by = null;
  this.deleted_at = null;
  await this.save();
};

// Rate limiting example (simple implementation)
userFavoriteSportSchema.methods.rateLimit = async function (userId) {
  const ONE_MINUTE = 60 * 1000;
  const limit = 5; // Limit to 5 changes per minute
  
  const recentChanges = await this.model('UserFavoriteSport').countDocuments({
    user_id: userId,
    created_at: { $gt: Date.now() - ONE_MINUTE }
  });

  if (recentChanges >= limit) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }
};

// Pre-save hook for auto-archiving after 1 year
userFavoriteSportSchema.pre('save', function (next) {
  const ONE_YEAR = 365 * 24 * 60 * 60 * 1000;
  
  if (this.created_at && Date.now() - this.created_at > ONE_YEAR && this.status !== 'archived') {
    this.status = 'archived';
  }
  next();
});

const UserFavoriteSport = mongoose.model('UserFavoriteSport', userFavoriteSportSchema);
module.exports = UserFavoriteSport;
