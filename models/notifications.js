import mongoose from 'mongoose';

// Constants for Validations
const NOTIFICATION_TYPES = ['event', 'general', 'alert', 'reminder', 'promotion', 'update', 'warning'];

// Schema Definition
const notificationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500, 
  },
  is_read: {
    type: Boolean,
    default: false,
    index: true,
  },
  type: {
    type: String,
    enum: NOTIFICATION_TYPES,
    required: true,
    index: true,
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
  // New field for notification priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
});

// Pre-save Hook to Update Timestamps
notificationSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

// Relationships
notificationSchema.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: '_id',
  justOne: true,
});

// Static Method to Get Unread Notifications Count for a User
notificationSchema.statics.getUnreadCount = async function (userId) {
  return this.countDocuments({ user_id: userId, is_read: false });
};

// Instance Method to Mark Notification as Read
notificationSchema.methods.markAsRead = async function () {
  this.is_read = true;
  await this.save();
};

// Static Method to Get Notifications by Type
notificationSchema.statics.getByType = async function (userId, type) {
  return this.find({ user_id: userId, type }).sort({ created_at: -1 });
};

// Instance Method to Send Notification (Simulated for Implementation)
notificationSchema.methods.sendNotification = async function () {
  // Simulate sending the notification via an external service or internal mechanism
  console.log(`Sending notification to user ${this.user_id}: ${this.message}`);
  // Here you could implement actual notification sending logic (e.g., email, push notification)
  // For example, using a service like Firebase Cloud Messaging or similar
};

// Index for Performance
notificationSchema.index({ user_id: 1, created_at: -1 });

// Export the Notification Model
const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
