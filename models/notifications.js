import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  message: {type: String},
  is_read: {type: Boolean, default: false, index: true},
  type: {type: String, enum: ['event', 'general', 'alert'], index: true},
  created_at: {type: Date, default: Date.now, index: true}
});

// Relationships
notificationSchema.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: '_id',
  justOne: true
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
