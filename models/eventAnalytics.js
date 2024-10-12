const mongoose = require('mongoose');

// Event Analytics Schema
const eventAnalyticsSchema = new mongoose.Schema({
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
    index: true
  },
  unique_views: { type: Number, default: 0, min: 0 }, // Track unique views
  total_views: { type: Number, default: 0, min: 0 }, // Track total views
  participants_count: { type: Number, default: 0, min: 0 }, // Total participants
  returning_participants: { type: Number, default: 0, min: 0 }, // Count of returning participants
  reactions: {
    likes: { type: Number, default: 0, min: 0 },
    shares: { type: Number, default: 0, min: 0 },
    comments: { type: Number, default: 0, min: 0 }
  },
  average_session_duration: { type: Number, default: 0, min: 0 }, // Duration in seconds
  created_at: { type: Date, default: Date.now },
  start_date: { type: Date }, // Start date for analytics tracking
  end_date: { type: Date }, // End date for analytics tracking
});

// Relationships
eventAnalyticsSchema.virtual('event', {
  ref: 'Event',
  localField: 'event_id',
  foreignField: '_id',
  justOne: true
});

// Instance Methods
eventAnalyticsSchema.methods.incrementViews = async function (isUnique = false) {
  if (isUnique) {
    this.unique_views += 1;
  }
  this.total_views += 1;
  await this.save();
};

eventAnalyticsSchema.methods.incrementParticipants = async function (isReturning = false) {
  this.participants_count += 1;
  if (isReturning) {
    this.returning_participants += 1;
  }
  await this.save();
};

eventAnalyticsSchema.methods.incrementReactions = async function (type) {
  if (type === 'like') {
    this.reactions.likes += 1;
  } else if (type === 'share') {
    this.reactions.shares += 1;
  } else if (type === 'comment') {
    this.reactions.comments += 1;
  }
  await this.save();
};

// Static Methods
eventAnalyticsSchema.statics.getAnalyticsSummary = async function (eventId) {
  return this.aggregate([
    { $match: { event_id: eventId } },
    {
      $project: {
        unique_views: 1,
        total_views: 1,
        participants_count: 1,
        returning_participants: 1,
        reactions: 1,
        average_session_duration: 1,
      },
    },
  ]);
};

// Custom Validation
eventAnalyticsSchema.pre('save', function (next) {
  if (this.unique_views < 0 || this.total_views < 0 || this.participants_count < 0) {
    return next(new Error('View counts and participant counts must be non-negative.'));
  }
  next();
});

// EventAnalytics Model
const EventAnalytics = mongoose.model('EventAnalytics', eventAnalyticsSchema);
module.exports = EventAnalytics;
