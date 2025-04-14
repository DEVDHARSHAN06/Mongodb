const jwt = require('jsonwebtoken');
const config = require('../config/config');

// Main authentication middleware
const auth = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if token exists
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'No authentication token provided' 
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Attach user to request object
    req.user = decoded.user;
    next();
  } catch (err) {
    return res.status(401).json({ 
      success: false,
      message: 'Invalid authentication token' 
    });
  }
};

// Doctor-specific middleware
auth.isDoctor = (req, res, next) => {
  if (req.user && req.user.role === 'doctor') {
    next();
  } else {
    return res.status(403).json({ 
      success: false,
      message: 'Doctor privileges required' 
    });
  }
};

// Patient-specific middleware
auth.isPatient = (req, res, next) => {
  if (req.user && req.user.role === 'patient') {
    next();
  } else {
    return res.status(403).json({ 
      success: false,
      message: 'Patient privileges required' 
    });
  }
};

// Admin check middleware (optional)
auth.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ 
      success: false,
      message: 'Admin privileges required' 
    });
  }
};

module.exports = auth;