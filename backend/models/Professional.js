const mongoose = require('mongoose');

const ProfessionalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  services: {
    type: [String],
    required: [true, 'At least one service is required'],
  },
  description: {
    type: String,
    maxlength: 1000,
  },
  hourlyRate: {
    type: Number,
    min: 0,
  },
  experienceYears: {
    type: Number,
    min: 0,
  },
  portfolio: {
    type: [String], // Cloudinary URLs
    default: [],
  },
  availability: [
    {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
      booked: { type: Boolean, default: false },
    },
  ],
  avgRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  idVerified: {
    type: Boolean,
    default: false,
  },
  idDocument: {
    type: String, // Cloudinary URL
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for fast search
ProfessionalSchema.index({ services: 1 });
ProfessionalSchema.index({ isPremium: -1, avgRating: -1 });

module.exports = mongoose.model('Professional', ProfessionalSchema);
