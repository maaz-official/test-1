import mongoose from 'mongoose';

const participationSchema = new mongoose.Schema({
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
    index: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['registered', 'attended', 'cancelled', 'active', 'spectating'],
    index: true
  },
  role: {
    type: String,
    enum: ['host', 'participant', 'spectator'],
    index: true
  },
  registered_at: {type: Date, default: Date.now}
});

// Relationships
participationSchema.virtual('event', {
  ref: 'Event',
  localField: 'event_id',
  foreignField: '_id',
  justOne: true
});
participationSchema.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: '_id',
  justOne: true
});

// Composite index for performance
participationSchema.index({event_id: 1, user_id: 1});

const Participation = mongoose.model('Participation', participationSchema);
export default Participation;
