// backend/middleware/auth.middleware.js

const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  let token;

  // Look for 'Authorization: Bearer <token>' in request headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // If no token found
  if (!token) {
    return res.status(401).json({
      message: 'Not authorized — please log in first'
    });
  }

  try {
    // Verify the token using your JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

    // Attach user info to req.user
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name
    };

    next(); // Pass to the next handler
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Session expired. Please login again.'
      });
    }
    return res.status(401).json({
      message: 'Token is invalid or has expired'
    });
  }
};

// Admin middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};

module.exports = { protect, adminOnly };