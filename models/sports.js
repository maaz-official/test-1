const mongoose = require('mongoose');
const handleProfanity = require('../utils/profanity/profanityFilter');
const ICON_URL_REGEX = /^(http|https):\/\/[^\s]+$/;

// Schema Definition
const sportSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    trim: true, 
    index: true,
    validate: {
      validator: function (v) {
        const { containsProfanity } = handleProfanity(v, false);
        return !containsProfanity; 
      },
      message: 'Name contains inappropriate content.',
    },
  },
  description: {
    type: String,
    trim: true,
    validate: {
      validator: function (v) {
        const { containsProfanity } = handleProfanity(v, false)
        return !containsProfanity;
      },
      message: 'Description contains inappropriate content.',
    }, 
  },
  icon_url: {
    type: String,
    validate: {
      validator: function (v) {
        return ICON_URL_REGEX.test(v); 
      },
      message: 'Icon URL must be a valid URL',
    },
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
});

// Pre-save Hook to Update Timestamps
sportSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

// Relationships
sportSchema.virtual('events', {
  ref: 'Event',
  localField: '_id',
  foreignField: 'sport_id',
});

sportSchema.virtual('favoriteSports', {
  ref: 'UserFavoriteSport',
  localField: '_id',
  foreignField: 'sport_id',
});

// Index for performance
sportSchema.index({ name: 1 });

// Static Method to Find or Create a Sport
sportSchema.statics.findOrCreate = async function (name, description, icon_url) {
  let sport = await this.findOne({ name });
  if (!sport) {
    sport = new this({ name, description, icon_url });
    await sport.save();
  }
  return sport;
};

sportSchema.statics.getAllSportsWithEventCounts = async function () {
  return this.aggregate([
    {
      $lookup: {
        from: 'events', 
        localField: '_id',
        foreignField: 'sport_id',
        as: 'events',
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        icon_url: 1,
        eventCount: { $size: '$events' },
      },
    },
  ]);
};

const Sport = mongoose.model('Sport', sportSchema);
module.exports = Sport;
