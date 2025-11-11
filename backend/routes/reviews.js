const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Review = require('../models/Review');
const Professional = require('../models/Professional');
const Booking = require('../models/Booking');

// @route   POST /api/reviews
// @desc    Create review after booking
// @access  Private (User)
router.post('/', protect, async (req, res) => {
  const { professionalId, bookingId, rating, comment } = req.body;

  try {
    // Validate booking
    const booking = await Booking.findOne({
      _id: bookingId,
      user: req.user.id,
      professional: professionalId,
      status: 'completed',
    });

    if (!booking) {
      return res.status(400).json({ msg: 'Cannot review: booking not completed' });
    }

    // Prevent duplicate review
    const existing = await Review.findOne({ booking: bookingId });
    if (existing) {
      return res.status(400).json({ msg: 'Already reviewed' });
    }

    const review = new Review({
      user: req.user.id,
      professional: professionalId,
      booking: bookingId,
      rating: parseInt(rating),
      comment,
    });

    await review.save();
    await review.populate('user', 'name');

    // Update pro rating
    const stats = await Review.aggregate([
      { $match: { professional: professionalId } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          total: { $sum: 1 },
        },
      },
    ]);

    await Professional.findByIdAndUpdate(professionalId, {
      avgRating: stats[0]?.avgRating || 0,
      totalReviews: stats[0]?.total || 0,
    });

    res.status(201).json(review);
  } catch (err) {
    console.error('Review error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
