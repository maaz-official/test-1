import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  reviewer_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  rating: { type: Number, min: 1, max: 5, index: true },
  comment: { type: String },
  created_at: { type: Date, default: Date.now, index: true },
  updated_at: { type: Date, default: Date.now },
});

// Relationships
reviewSchema.virtual('event', { ref: 'Event', localField: 'event_id', foreignField: '_id', justOne: true });
reviewSchema.virtual('reviewer', { ref: 'User', localField: 'reviewer_user_id', foreignField: '_id', justOne: true });

// Composite index for performance
reviewSchema.index({ event_id: 1, reviewer_user_id: 1 });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
