import mongoose from 'mongoose';

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
  },
  role: {
    type: String,
    enum: PARTICIPANT_ROLES,
    required: true,
    index: true,
    default: 'participant',
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
});

// Pre-save Hook to Update Timestamps
participationSchema.pre('save', function (next) {
  this.updated_at = Date.now();
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

// Static Method to Get Participation Summary for a User
participationSchema.statics.getUserParticipationSummary = async function (userId) {
  return this.aggregate([
    {
      $match: { user_id: userId },
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
      },
    },
  ]);
};

// Export the Participation Model
const Participation = mongoose.model('Participation', participationSchema);
export default Participation;
