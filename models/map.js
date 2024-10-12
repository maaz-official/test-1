const mongoose = require('mongoose');
// Constants for Validations
const COORDINATE_RANGE = {
  LATITUDE: { MIN: -90, MAX: 90 },
  LONGITUDE: { MIN: -180, MAX: 180 },
};

// Error Handling Class
class MapError extends Error {
  constructor(message) {
    super(message);
    this.name = 'MapError';
  }
}

// Schema Definition
const mapSchema = new mongoose.Schema({
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
    index: true,
  },
  latitude: {
    type: Number,
    required: true,
    validate: {
      validator: (value) => value >= COORDINATE_RANGE.LATITUDE.MIN && value <= COORDINATE_RANGE.LATITUDE.MAX,
      message: (props) => `${props.value} is not a valid latitude!`,
    },
  },
  longitude: {
    type: Number,
    required: true,
    validate: {
      validator: (value) => value >= COORDINATE_RANGE.LONGITUDE.MIN && value <= COORDINATE_RANGE.LONGITUDE.MAX,
      message: (props) => `${props.value} is not a valid longitude!`,
    },
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  version: {
    type: Number,
    default: 1,
  },
});

// Pre-save Hook to Update Timestamps and Increment Version
mapSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  this.version += 1; // Increment version for every update
  next();
});

// Relationships
mapSchema.virtual('event', {
  ref: 'Event',
  localField: 'event_id',
  foreignField: '_id',
  justOne: true,
});

// Index for Geospatial Queries
mapSchema.index({ location: '2dsphere' });

// Static Method to Find Nearby Events
mapSchema.statics.findNearby = async function (latitude, longitude, maxDistance) {
  try {
    const results = await this.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude], // Note: [longitude, latitude] for GeoJSON
          },
          $maxDistance: maxDistance, // distance in meters
        },
      },
    }).populate('event');

    return results;
  } catch (error) {
    throw new MapError('Error finding nearby events: ' + error.message);
  }
};

// Instance Method to Get Coordinates
mapSchema.methods.getCoordinates = function () {
  return {
    latitude: this.latitude,
    longitude: this.longitude,
  };
};

mapSchema.methods.calculateDistance = function (lat, lon) {
  const R = 6371e3; // Radius of the Earth in meters
  const φ1 = (this.latitude * Math.PI) / 180; // φ in radians
  const φ2 = (lat * Math.PI) / 180; // φ2 in radians
  const Δφ = ((lat - this.latitude) * Math.PI) / 180; // Δφ in radians
  const Δλ = ((lon - this.longitude) * Math.PI) / 180; // Δλ in radians

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// Method to Return Map Details
mapSchema.methods.getDetails = function () {
  return {
    event_id: this.event_id,
    coordinates: this.getCoordinates(),
    created_at: this.created_at,
    updated_at: this.updated_at,
    version: this.version,
  };
};

// Export the Map Model
const Map = mongoose.model('Map', mapSchema);
module.exports = Map;
