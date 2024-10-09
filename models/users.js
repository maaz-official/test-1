import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true, index: true },
  password_hash: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Inactive', 'Suspended'], default: 'Active', index: true },
  created_at: { type: Date, default: Date.now, index: true },
  updated_at: { type: Date, default: Date.now },
});

// Relationships and indexing
userSchema.virtual('profile', { ref: 'UserProfile', localField: '_id', foreignField: 'user_id', justOne: true });
userSchema.virtual('notifications', { ref: 'Notification', localField: '_id', foreignField: 'user_id' });
userSchema.virtual('reviews', { ref: 'Review', localField: '_id', foreignField: 'reviewer_user_id' });
userSchema.virtual('admin', { ref: 'Admin', localField: '_id', foreignField: 'user_id', justOne: true });

// Indexes for performance
userSchema.index({ created_at: 1, status: 1 });

const User = mongoose.model('User', userSchema);
export default User;
