const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// @route   PATCH /api/users/location
// @desc    Update user location for map search
// @access  Private
router.patch('/location', protect, async (req, res) => {
  const { lat, lng } = req.body;

  if (!lat || !lng) {
    return res.status(400).json({ msg: 'Latitude and longitude required' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        location: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)], // [lng, lat]
        },
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      msg: 'Location updated',
      location: user.location,
    });
  } catch (err) {
    console.error('Location update error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET /api/users/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
