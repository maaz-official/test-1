const mongoose = require('mongoose');
// Constants for Validations
const PARTICIPATION_STATUSES = ['registered', 'attended', 'cancelled', 'active', 'spectating'];
const PARTICIPANT_ROLES = ['host', 'participant', 'spectator'];

const participationSchema = new mongoose.Schema({
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
    index: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: PARTICIPATION_STATUSES,
    required: true,
    index: true,
    default: 'registered',
    validate: {
      validator: function (value) {
        // Custom validation logic can be added here if necessary
        return PARTICIPATION_STATUSES.includes(value);
      },
      message: props => `${props.value} is not a valid status!`
    }
  },
  role: {
    type: String,
    enum: PARTICIPANT_ROLES,
    required: true,
    index: true,
    default: 'participant',
    validate: {
      validator: function (value) {
        return PARTICIPANT_ROLES.includes(value);
      },
      message: props => `${props.value} is not a valid role!`
    }
  },
  registered_at: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  deleted_at: {
    type: Date,
    default: null, // For soft deletes
    index: true,
  },
  last_interaction: {
    type: Date,
    default: Date.now, // For tracking the last interaction with the event
  },
  engagement_score: {
    type: Number,
    default: 0, // Track engagement based on activity
  },
});

// Pre-save Hook to Update Timestamps and Handle Deletion
participationSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  // Soft delete handling
  if (this.deleted_at && !this.isNew) {
    this.deleted_at = Date.now(); // Set deleted_at timestamp on soft delete
  }
  next();
});

// Relationships
participationSchema.virtual('event', {
  ref: 'Event',
  localField: 'event_id',
  foreignField: '_id',
  justOne: true,
});
participationSchema.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: '_id',
  justOne: true,
});

// Composite Index for Performance
participationSchema.index({ event_id: 1, user_id: 1 });

// Instance Methods
participationSchema.methods.updateStatus = async function (newStatus) {
  if (!PARTICIPATION_STATUSES.includes(newStatus)) {
    throw new Error('Invalid status update.');
  }
  this.status = newStatus;
  await this.save();
};

participationSchema.methods.calculateEngagementScore = function () {
  // Implement logic to calculate engagement score
  this.engagement_score = this.status === 'attended' ? this.engagement_score + 10 : this.engagement_score;
};

// Static Method to Get Participation Summary for a User
participationSchema.statics.getUserParticipationSummary = async function (userId) {
  return this.aggregate([
    {
      $match: { user_id: userId, deleted_at: null }, // Exclude soft-deleted participations
    },
    {
      $lookup: {
        from: 'events',
        localField: 'event_id',
        foreignField: '_id',
        as: 'eventDetails',
      },
    },
    {
      $unwind: {
        path: '$eventDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        eventName: '$eventDetails.name',
        status: 1,
        role: 1,
        registered_at: 1,
        updated_at: 1,
        last_interaction: 1,
        engagement_score: 1,
      },
    },
    {
      $sort: { registered_at: -1 }, // Sort by registration date
    }
  ]);
};

// Export the Participation Model
const Participation = mongoose.model('Participation', participationSchema);
module.exports = Participation;
