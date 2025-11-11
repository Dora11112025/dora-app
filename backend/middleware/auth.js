const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ msg: 'User not found' });
    }
    next();
  } catch (err) {
    console.error('Token error:', err.message);
    return res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Role-based middleware
const professional = (req, res, next) => {
  if (req.user.role !== 'professional') {
    return res.status(403).json({ msg: 'Access denied: Professional only' });
  }
  next();
};

const admin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied: Admin only' });
  }
  next();
};

module.exports = { protect, professional, admin };
