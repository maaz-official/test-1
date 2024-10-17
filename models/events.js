const mongoose = require('mongoose');
const sanitizeHtml = require('sanitize-html'); 
const handleProfanity = require('../utils/profanity/profanityFilter');

// Event Schema
const eventSchema = new mongoose.Schema(
  {
      title: {
        type: String,
        required: true,
        trim: true,
        minlength: 3, 
        maxlength: 100,
        validate: {
          validator: function (v) {
            const { containsProfanity } = handleProfanity(v, false);
            return !containsProfanity; 
          },
          message: 'Title contains inappropriate content.',
        },
      },
    sport_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sport',
      required: true,
      index: true,
    },
    host_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500, // Max length for description
      validate: {
        validator: function (v) {
          const { containsProfanity } = handleProfanity(v, false);
          return !containsProfanity; 
        },
        message: 'Description contains inappropriate content.',
      },
      set: v => sanitizeHtml(v, { allowedTags: [], allowedAttributes: {} }),
    },
    location_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: true,
      index: true,
    },
    date_time: {
      type: Date,
      required: true,
      index: true,
      validate: {
        validator: function (v) {
          return v > new Date(); 
        },
        message: 'Event date must be in the future.',
      },
    },
    end_time: {
      type: Date,
      required: true,
      validate: {
        validator: function (v) {
          return v > this.date_time; 
        },
        message: 'End time must be after the start time.',
      },
    },
    capacity: {
      type: Number,
      required: true,
      min: 1, // Ensure capacity is at least 1
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      index: true,
    },
    event_type: {
      type: String,
      enum: ['game', 'tournament', 'matchmaking'],
      index: true,
    },
    is_live: { type: Boolean, default: false, index: true },
    privacy_setting: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
    tags: [{ type: String, index: true }], 
    coordinates: {
      type: { type: String, enum: ['Point'], required: true }, // 'Point' for GeoJSON
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    created_at: { type: Date, default: Date.now, index: true },
    updated_at: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// Geospatial indexing for coordinates
eventSchema.index({ coordinates: '2dsphere' });

// Relationships
eventSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'event_id',
});
eventSchema.virtual('teams', {
  ref: 'Team',
  localField: '_id',
  foreignField: 'event_id',
});
eventSchema.virtual('participants', {
  ref: 'Participation',
  localField: '_id',
  foreignField: 'event_id',
});
eventSchema.virtual('analytics', {
  ref: 'EventAnalytics',
  localField: '_id',
  foreignField: 'event_id',
});
eventSchema.virtual('map', {
  ref: 'Map',
  localField: '_id',
  foreignField: 'event_id',
  justOne: true,
});

// Composite index for performance
eventSchema.index({ sport_id: 1, date_time: 1, status: 1 });

// Pre-save middleware for timestamp updates
eventSchema.pre('save', function (next) {
  if (!this.isModified('updated_at')) {
    this.updated_at = Date.now();
  }
  this.title = sanitizeHtml(this.title, { allowedTags: [], allowedAttributes: {} });
  this.description = sanitizeHtml(this.description, { allowedTags: [], allowedAttributes: {} });
  next();
});

// Method to update event status
eventSchema.methods.updateStatus = async function (newStatus) {
  this.status = newStatus;
  return await this.save();
};

// Method to check if event is live
eventSchema.methods.isEventLive = function () {
  return this.is_live && this.status === 'ongoing';
};

// Error handling on save
eventSchema.post('save', function (doc, next) {
  console.log(`Event ${doc.title} has been saved successfully with status: ${doc.status}`);
  next();
});

// Event Model
const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
