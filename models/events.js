import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  sport_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Sport', required: true, index: true },
  host_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  description: { type: String },
  location_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true, index: true },
  date_time: { type: Date, required: true, index: true },
  capacity: { type: Number, required: true },
  status: { type: String, enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'], index: true },
  privacy_setting: { type: String, enum: ['Public', 'Private'] },
  created_at: { type: Date, default: Date.now, index: true },
  updated_at: { type: Date, default: Date.now },
});

// Relationships
eventSchema.virtual('reviews', { ref: 'Review', localField: '_id', foreignField: 'event_id' });
eventSchema.virtual('teams', { ref: 'Team', localField: '_id', foreignField: 'event_id' });
eventSchema.virtual('participants', { ref: 'Participation', localField: '_id', foreignField: 'event_id' });
eventSchema.virtual('analytics', { ref: 'EventAnalytics', localField: '_id', foreignField: 'event_id' });
eventSchema.virtual('map', { ref: 'Map', localField: '_id', foreignField: 'event_id', justOne: true });

// Composite index for performance
eventSchema.index({ sport_id: 1, date_time: 1 });

const Event = mongoose.model('Event', eventSchema);
export default Event;
