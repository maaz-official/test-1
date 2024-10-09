import mongoose from 'mongoose';

const mapSchema = new mongoose.Schema({
  event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  created_at: { type: Date, default: Date.now, index: true },
  updated_at: { type: Date, default: Date.now },
});

// Relationships
mapSchema.virtual('event', { ref: 'Event', localField: 'event_id', foreignField: '_id', justOne: true });

const Map = mongoose.model('Map', mapSchema);
export default Map;
