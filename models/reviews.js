const mongoose = require('mongoose');
// Constants for Validations
const MAX_RATING = 5;
const MIN_RATING = 1;

// Schema Definition
const reviewSchema = new mongoose.Schema({
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
    index: true,
  },
  reviewer_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  rating: {
    type: Number,
    required: true,
    min: [MIN_RATING, 'Rating must be at least 1'],
    max: [MAX_RATING, 'Rating must not exceed 5'],
    index: true,
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters'], 
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
});

// Pre-save Hook to Update Timestamps
reviewSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

// Relationships
reviewSchema.virtual('event', {
  ref: 'Event',
  localField: 'event_id',
  foreignField: '_id',
  justOne: true,
});

reviewSchema.virtual('reviewer', {
  ref: 'User',
  localField: 'reviewer_user_id',
  foreignField: '_id',
  justOne: true,
});

// Composite Index for Performance
reviewSchema.index({ event_id: 1, reviewer_user_id: 1 });

// Static Method to Get Average Rating for an Event
reviewSchema.statics.getAverageRating = async function (eventId) {
  const result = await this.aggregate([
    {
      $match: { event_id: eventId },
    },
    {
      $group: {
        _id: '$event_id',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);
  return result.length > 0 ? result[0] : null;
};

// Static Method to Get Reviews with User Details
reviewSchema.statics.getReviewsWithUsers = async function (eventId) {
  return this.aggregate([
    {
      $match: { event_id: eventId },
    },
    {
      $lookup: {
        from: 'users', // Users collection
        localField: 'reviewer_user_id',
        foreignField: '_id',
        as: 'reviewerDetails',
      },
    },
    {
      $unwind: {
        path: '$reviewerDetails',
        preserveNullAndEmptyArrays: true, // Keeps reviews without user details
      },
    },
    {
      $project: {
        rating: 1,
        comment: 1,
        created_at: 1,
        updated_at: 1,
        reviewerName: { $concat: ['$reviewerDetails.firstName', ' ', '$reviewerDetails.lastName'] }, // Assuming firstName and lastName fields exist
      },
    },
  ]);
};

// Export the Review Model
const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
