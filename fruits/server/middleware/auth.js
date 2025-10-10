const jwt = require('jsonwebtoken');
const Vendor = require('../models/Vendor');
const Customer = require('../models/Customer');

// General auth: attaches req.user and req.userType ('vendor' | 'customer')
async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Try vendor first, then customer
    let user = await Vendor.findById(userId);
    if (user) {
      req.user = user;
      req.userType = 'vendor';
      return next();
    }

    user = await Customer.findById(userId);
    if (user) {
      req.user = user;
      req.userType = 'customer';
      return next();
    }

    return res.status(401).json({ message: 'User not found' });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Require vendor
async function vendorAuth(req, res, next) {
  await auth(req, res, function onAuthed(err) {
    if (err) return next(err);
    if (req.userType !== 'vendor') {
      return res.status(403).json({ message: 'Vendor access required' });
    }
    return next();
  });
}

// Require customer
async function customerAuth(req, res, next) {
  await auth(req, res, function onAuthed(err) {
    if (err) return next(err);
    if (req.userType !== 'customer') {
      return res.status(403).json({ message: 'Customer access required' });
    }
    return next();
  });
}

module.exports = { auth, vendorAuth, customerAuth };



