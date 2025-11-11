const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['user', 'professional', 'admin'],
    default: 'user',
  },
  phone: {
    type: String,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'],
  },
  phoneVerified: {
    type: Boolean,
    default: false,
  },
  phoneVerificationCode: String, // temp
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [lng, lat]
      default: [0, 0],
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// 2dsphere index for geo queries
UserSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', UserSchema);
