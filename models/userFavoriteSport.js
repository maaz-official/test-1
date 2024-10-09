import mongoose from 'mongoose';

const userFavoriteSportSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sport_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Sport', required: true, index: true },
});

// Composite index for performance
userFavoriteSportSchema.index({ user_id: 1, sport_id: 1 });

const UserFavoriteSport = mongoose.model('UserFavoriteSport', userFavoriteSportSchema);
export default UserFavoriteSport;
