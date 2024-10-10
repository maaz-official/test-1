import mongoose from 'mongoose';

const userFavoriteSportSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true,
    validate: {
      validator: mongoose.Types.ObjectId.isValid,
      message: 'Invalid user ID'
    },
  },
  sport_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Sport', 
    required: true, 
    index: true,
    validate: {
      validator: mongoose.Types.ObjectId.isValid,
      message: 'Invalid sport ID'
    },
  },
  status: {
    type: String,
    enum: ['active', 'removed'], // Option for soft delete
    default: 'active',
    index: true
  },
  created_at: { 
    type: Date, 
    default: Date.now, 
    index: true 
  },
  updated_at: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, // Automatically manage timestamps
  toJSON: { virtuals: true }, 
  toObject: { virtuals: true }
});

// Composite index to ensure unique user-sport relationship
userFavoriteSportSchema.index({ user_id: 1, sport_id: 1 }, { unique: true });

// Virtual for populating user details
userFavoriteSportSchema.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: '_id',
  justOne: true
});

// Virtual for populating sport details
userFavoriteSportSchema.virtual('sport', {
  ref: 'Sport',
  localField: 'sport_id',
  foreignField: '_id',
  justOne: true
});

// Pre-save hook to update `updated_at` field
userFavoriteSportSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Soft delete method
userFavoriteSportSchema.methods.softDelete = async function() {
  this.status = 'removed';
  await this.save();
};

const UserFavoriteSport = mongoose.model('UserFavoriteSport', userFavoriteSportSchema);
export default UserFavoriteSport;
