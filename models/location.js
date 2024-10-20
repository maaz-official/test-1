const mongoose = require('mongoose');

// Location Schema
const locationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    latitude: {
      type: Number,
      required: true,
      validate: {
        validator: (v) => v >= -90 && v <= 90,
        message: 'Latitude must be between -90 and 90.',
      },
    },
    longitude: {
      type: Number,
      required: true,
      validate: {
        validator: (v) => v >= -180 && v <= 180,
        message: 'Longitude must be between -180 and 180.',
      },
    },
    address: { type: String, trim: true },
    description: { type: String, trim: true },
    tags: [{ type: String }],
    accuracy: { type: Number, required: true }, // Accuracy of the location in meters
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }, // Status of the location
    lastUpdated: { type: Date, default: Date.now }, // Last updated timestamp
    trackingEnabled: { type: Boolean, default: true }, // Whether real-time tracking is enabled
    // Optional field to define geofenced areas
    geofence: {
      type: {
        type: String,
        enum: ['Point'], // 'Point' for a single point geofence
        required: true,
      },
      coordinates: { type: [Number], required: true }, // Longitude and latitude of the geofence center
      radius: { type: Number, required: true }, // Radius of the geofence in meters
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// Geospatial indexing for location and geofence
locationSchema.index({ location: '2dsphere' });
locationSchema.index({ geofence: '2dsphere' });
locationSchema.index({ latitude: 1, longitude: 1 }, { unique: true });
// Virtuals for relationships
locationSchema.virtual('events', { ref: 'Event', localField: '_id', foreignField: 'location_id' });

// Pre-save middleware for validation or logic
locationSchema.pre('save', function (next) {
  if (!this.address && !this.description) {
    const err = new Error('Either address or description must be provided.');
    return next(err);
  }
  // Update lastUpdated timestamp on save
  this.lastUpdated = Date.now();
  next();
});

// Error handling on save
locationSchema.post('save', function (doc, next) {
  console.log(`Location ${doc.name} has been saved successfully with status: ${doc.status}`);
  next();
});

// Method for updating location
locationSchema.methods.updateLocation = async function (newLatitude, newLongitude, newAccuracy) {
  this.latitude = newLatitude;
  this.longitude = newLongitude;
  this.accuracy = newAccuracy;
  this.lastUpdated = Date.now();
  await this.save();
};

// Method to deactivate tracking
locationSchema.methods.deactivateTracking = function () {
  this.trackingEnabled = false;
  return this.save();
};

// Export the model
module.exports = mongoose.model('Location', locationSchema);
