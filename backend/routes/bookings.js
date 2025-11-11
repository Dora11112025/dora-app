const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Booking = require('../models/Booking');
const Professional = require('../models/Professional');

// @route   POST /api/bookings
// @desc    Create booking
// @access  Private (User)
router.post('/', protect, async (req, res) => {
  const { professionalId, service, date, timeSlot, address } = req.body;

  try {
    const pro = await Professional.findById(professionalId);
    if (!pro) return res.status(404).json({ msg: 'Professional not found' });

    // Check availability
    const slot = pro.availability.find(
      (a) =>
        new Date(a.start) <= new Date(date) &&
        new Date(a.end) >= new Date(date) &&
        !a.booked
    );

    if (!slot) {
      return res.status(400).json({ msg: 'Time slot not available' });
    }

    const booking = new Booking({
      user: req.user.id,
      professional: professionalId,
      service,
      date,
      timeSlot,
      address,
      totalPrice: pro.hourlyRate * 2, // example: 2 hours
    });

    await booking.save();

    // Mark slot as booked
    await Professional.findByIdAndUpdate(professionalId, {
      $set: { 'availability.$[elem].booked': true },
    }, {
      arrayFilters: [{ 'elem._id': slot._id }],
    });

    await booking.populate('user professional', 'name email');

    res.status(201).json(booking);
  } catch (err) {
    console.error('Booking error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET /api/bookings/my
// @desc    Get user's bookings
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({
      $or: [{ user: req.user.id }, { professional: req.user.id }],
    })
      .populate('user professional', 'name')
      .sort('-createdAt');

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
