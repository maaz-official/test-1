import mongoose from 'mongoose';

const sportSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true, index: true },
  description: { type: String },
  icon_url: { type: String },
  created_at: { type: Date, default: Date.now, index: true },
  updated_at: { type: Date, default: Date.now },
});

// Relationships
sportSchema.virtual('events', { ref: 'Event', localField: '_id', foreignField: 'sport_id' });
sportSchema.virtual('favoriteSports', { ref: 'UserFavoriteSport', localField: '_id', foreignField: 'sport_id' });

// Index for performance
sportSchema.index({ name: 1 });

const Sport = mongoose.model('Sport', sportSchema);
export default Sport;
