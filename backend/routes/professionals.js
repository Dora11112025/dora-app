const express = require('express');
const router = express.Router();
const { protect, professional } = require('../middleware/auth');
const Professional = require('../models/Professional');
const User = require('../models/User');
const upload = require('../utils/upload');

// @route   POST /api/professionals/profile
// @desc    Create or update professional profile
// @access  Private (Professional)
router.post('/profile', protect, professional, upload.array('photos', 5), async (req, res) => {
  const {
    services,
    description,
    hourlyRate,
    experienceYears,
    availability,
    idDocument,
  } = req.body;

  const photos = req.files ? req.files.map((file) => file.path) : [];

  try {
    let pro = await Professional.findOne({ user: req.user.id });

    const profileData = {
      services: JSON.parse(services || '[]'),
      description,
      hourlyRate: parseFloat(hourlyRate),
      experienceYears: parseInt(experienceYears),
      availability: JSON.parse(availability || '[]'),
    };

    if (photos.length > 0) {
      profileData.$push = { portfolio: { $each: photos } };
    }

    if (idDocument) {
      profileData.idDocument = idDocument;
      profileData.idVerified = false; // Admin must approve
    }

    if (pro) {
      pro = await Professional.findOneAndUpdate(
        { user: req.user.id },
        profileData,
        { new: true, runValidators: true }
      );
    } else {
      profileData.user = req.user.id;
      pro = new Professional(profileData);
      await pro.save();
    }

    await pro.populate('user', 'name email phone location');

    res.json(pro);
  } catch (err) {
    console.error('Profile error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET /api/professionals/search
// @desc    Search professionals with geo + filters
// @access  Public
router.get('/search', async (req, res) => {
  const {
    service,
    lat,
    lng,
    maxDistance = 50000, // 50km
    minRating = 0,
    sort = 'distance', // distance, rating, premium
  } = req.query;

  try {
    const match = {};
    if (service) match.services = service;
    if (minRating) match.avgRating = { $gte: parseFloat(minRating) };

    const pipeline = [
      { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $match: { ...match, 'user.role': 'professional' } },
    ];

    // Add geo distance if lat/lng provided
    if (lat && lng) {
      pipeline.push(
        {
          $addFields: {
            distance: {
              $round: [
                {
                  $divide: [
                    {
                      $geoNear: {
                        near: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
                        distanceField: 'calcDistance',
                        spherical: true,
                      },
                    },
                    1000,
                  ],
                },
                1,
              ],
            },
          },
        },
        { $match: { calcDistance: { $lte: parseFloat(maxDistance) * 1000 } } }
      );
    }

    // Sorting
    let sortObj = {};
    if (sort === 'premium') sortObj = { isPremium: -1, avgRating: -1, distance: 1 };
    else if (sort === 'rating') sortObj = { avgRating: -1 };
    else sortObj = { distance: 1 }; // default: closest first

    pipeline.push({ $sort: sortObj });

    const pros = await Professional.aggregate(pipeline);

    res.json(pros);
  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ msg: 'Search failed' });
  }
});

module.exports = router;
