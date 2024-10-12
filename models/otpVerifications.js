const mongoose = require('mongoose');

const otpVerificationSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '5m', 
  },
  attempts: {
    type: Number,
    default: 0,
  }
});

const OtpVerification = mongoose.model('OtpVerification', otpVerificationSchema);
module.exports = OtpVerification;
