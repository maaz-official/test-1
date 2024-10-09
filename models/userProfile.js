import mongoose from 'mongoose';

const userProfileSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  profile_picture_url: { type: String },
  phone_number: { type: String, unique: true, index: true },
  experience_level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'] },
  bio: { type: String },
  created_at: { type: Date, default: Date.now, index: true },
  updated_at: { type: Date, default: Date.now },
});

// Relationships
userProfileSchema.virtual('favoriteSports', { ref: 'UserFavoriteSport', localField: '_id', foreignField: 'user_id' });

const UserProfile = mongoose.model('UserProfile', userProfileSchema);
export default UserProfile;
