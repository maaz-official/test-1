import mongoose from 'mongoose';

const eventAnalyticsSchema = new mongoose.Schema({
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
    index: true
  },
  views: {type: Number, default: 0},
  participants_count: {type: Number, default: 0},
  created_at: {type: Date, default: Date.now}
});

// Relationships
eventAnalyticsSchema.virtual('event', {
  ref: 'Event',
  localField: 'event_id',
  foreignField: '_id',
  justOne: true
});

const EventAnalytics = mongoose.model('EventAnalytics', eventAnalyticsSchema);
export default EventAnalytics;
