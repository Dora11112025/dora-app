const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendSMS } = require('../utils/sms');
const { protect } = require('../middleware/auth');

// Helper: Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @route   POST /api/auth/register
// @desc    Register user
router.post('/register', async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create user
    user = new User({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role: role || 'user',
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const token = generateToken(user.id);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneVerified: user.phoneVerified,
      },
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneVerified: user.phoneVerified,
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST /api/auth/verify-phone
// @desc    Send SMS verification code
router.post('/verify-phone', protect, async (req, res) => {
  const { phone } = req.body;

  if (!phone || !/^\+?[1-9]\d{1,14}$/.test(phone)) {
    return res.status(400).json({ msg: 'Valid phone number required' });
  }

  try {
    // Update phone if changed
    if (req.user.phone !== phone) {
      req.user.phone = phone;
      req.user.phoneVerified = false;
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    req.user.phoneVerificationCode = code;
    await req.user.save();

    // Send SMS
    const message = `Your Dora verification code: ${code}`;
    const sent = await sendSMS(phone, message);

    if (sent) {
      res.json({ msg: 'Verification code sent' });
    } else {
      res.status(500).json({ msg: 'Failed to send SMS' });
    }
  } catch (err) {
    console.error('SMS error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST /api/auth/verify-code
// @desc    Verify SMS code
router.post('/verify-code', protect, async (req, res) => {
  const { code } = req.body;

  if (req.user.phoneVerificationCode === code) {
    req.user.phoneVerified = true;
    req.user.phoneVerificationCode = undefined;
    await req.user.save();

    res.json({ msg: 'Phone verified successfully' });
  } else {
    res.status(400).json({ msg: 'Invalid verification code' });
  }
});

module.exports = router;
