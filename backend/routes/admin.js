const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const Professional = require('../models/Professional');
const Message = require('../models/Message');
const Category = require('../models/Category');

// @route   PATCH /api/admin/professionals/:id/premium
// @desc    Toggle premium status
router.patch('/professionals/:id/premium', protect, admin, async (req, res) => {
  try {
    const pro = await Professional.findById(req.params.id);
    if (!pro) return res.status(404).json({ msg: 'Professional not found' });

    pro.isPremium = !pro.isPremium;
    await pro.save();

    res.json({ msg: 'Premium status updated', isPremium: pro.isPremium });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   PATCH /api/admin/professionals/:id/verify-id
// @desc    Approve ID document
router.patch('/professionals/:id/verify-id', protect, admin, async (req, res) => {
  try {
    const pro = await Professional.findByIdAndUpdate(
      req.params.id,
      { idVerified: true },
      { new: true }
    );
    res.json({ msg: 'ID verified', idVerified: pro.idVerified });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET /api/admin/flagged-messages
// @desc    Get off-platform messages
router.get('/flagged-messages', protect, admin, async (req, res) => {
  try {
    const messages = await Message.find({ flagged: true })
      .populate('sender recipient', 'name email')
      .sort('-createdAt');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST /api/admin/categories
// @desc    Add service category
router.post('/categories', protect, admin, async (req, res) => {
  const { name } = req.body;
  try {
    let cat = await Category.findOne({ name });
    if (cat) return res.status(400).json({ msg: 'Category exists' });

    cat = new Category({ name });
    await cat.save();
    res.status(201).json(cat);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
