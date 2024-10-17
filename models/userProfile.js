const mongoose = require('mongoose');
const validator = require('validator');
const handleProfanity = require('../utils/profanity/profanityFilter');
// const profanityUtil = require('profanity-util');

const userProfileSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
    unique: true
  },
  first_name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
    validate: {
    validator: function (v) {
        const { containsProfanity } = handleProfanity(v, false);
        return !containsProfanity; 
      },
      message: 'First name contains inappropriate content.',
    },
  },
  last_name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
    validate: {
    validator: function (v) {
        const { containsProfanity } = handleProfanity(v, false);
        return !containsProfanity; 
      },
      message: 'Last  name contains inappropriate content.',
    },
  },
  profile_picture_url: {
    type: String,
    validate: {
      validator: (v) => validator.isURL(v),
      message: 'Invalid URL for profile picture'
    }
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 500,
    validate: {
    validator: function (v) {
        const { containsProfanity } = handleProfanity(v, false);
        return !containsProfanity; 
      },
      message: 'bio name contains inappropriate content.',
    },
  },
  experience_level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
    required: true
  },
  address: {
    street: { type: String, trim: true, maxlength: 100 },
    city: { type: String, trim: true, maxlength: 50 },
    state: { type: String, trim: true, maxlength: 50 },
    country: { type: String, trim: true, maxlength: 50, default: 'US' },
    zip_code: {
      type: String,
      validate: {
        validator: (v) => validator.isPostalCode(v, 'any'),
        message: 'Invalid postal code'
      }
    }
  },
  social_links: {
    twitter: { type: String, validate: (v) => validator.isURL(v) },
    linkedin: { type: String, validate: (v) => validator.isURL(v) },
    instagram: { type: String, validate: (v) => validator.isURL(v) }
  },
  privacy_settings: {
    show_phone_number: { type: Boolean, default: false },
    show_address: { type: Boolean, default: false }
  },
  language_preference: {
    type: String,
    default: 'en',
    enum: ['en', 'es', 'fr', 'de', 'zh', 'ja'] 
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
      index: '2dsphere'
    }
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
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    index: true
  },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' 
  },
  version: {
    type: Number,
    default: 1
  }
});

// Auto-update `updated_at` field
userProfileSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

// Virtual field to populate user's favorite sports
userProfileSchema.virtual('favoriteSports', {
  ref: 'UserFavoriteSport',
  localField: '_id',
  foreignField: 'user_id'
});

// Virtual field to get the full name
userProfileSchema.virtual('full_name').get(function () {
  return `${this.first_name} ${this.last_name}`;
});

// Compound Index for Optimized Searching
userProfileSchema.index({ first_name: 1, last_name: 1 });
userProfileSchema.index({ country: 1, experience_level: 1 });

const UserProfile = mongoose.model('UserProfile', userProfileSchema);
module.exports = UserProfile;
