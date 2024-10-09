const locationSchema = new mongoose.Schema({
    name: { type: String, required: true, index: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String },
    created_at: { type: Date, default: Date.now, index: true },
    updated_at: { type: Date, default: Date.now },
  });
  
  // Relationships
  locationSchema.virtual('events', { ref: 'Event', localField: '_id', foreignField: 'location_id' });
  
  module.exports = mongoose.model('Location', locationSchema);
  