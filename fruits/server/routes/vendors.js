const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const { vendorAuth } = require('../middleware/auth');

const router = express.Router();

// @route   PUT /api/vendors/location
// @desc    Update vendor location
// @access  Private (Vendor)
router.put('/location', vendorAuth, [
  body('coordinates').isArray({ min: 2, max: 2 }).withMessage('Coordinates must be [longitude, latitude]'),
  body('address').optional().trim().notEmpty().withMessage('Address cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { coordinates, address } = req.body;
    const vendor = req.user;

    // Validate coordinates
    const [longitude, latitude] = coordinates;
    if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
      return res.status(400).json({ message: 'Invalid coordinates' });
    }

    await vendor.updateLocation(coordinates, address);

    // Emit websocket event for live location updates
    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('vendor:locationUpdated', {
          vendorId: vendor._id.toString(),
          location: vendor.location,
          lastLocationUpdate: vendor.lastLocationUpdate
        });
      }
    } catch (e) {
      // Non-blocking: log and continue response
      console.error('Socket emit error (location):', e);
    }

    res.json({
      message: 'Location updated successfully',
      location: vendor.location
    });
  } catch (error) {
    console.error('Location update error:', error);
    res.status(500).json({ message: 'Server error updating location' });
  }
});

// @route   PUT /api/vendors/availability
// @desc    Toggle vendor availability
// @access  Private (Vendor)
router.put('/availability', vendorAuth, [
  body('isAvailable').isBoolean().withMessage('isAvailable must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { isAvailable } = req.body;
    const vendor = req.user;

    vendor.isAvailable = isAvailable;
    await vendor.save();

    // Emit availability change
    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('vendor:availabilityUpdated', {
          vendorId: vendor._id.toString(),
          isAvailable: vendor.isAvailable
        });
      }
    } catch (e) {
      console.error('Socket emit error (availability):', e);
    }

    res.json({
      message: `Vendor ${isAvailable ? 'is now available' : 'is now unavailable'}`,
      isAvailable: vendor.isAvailable
    });
  } catch (error) {
    console.error('Availability update error:', error);
    res.status(500).json({ message: 'Server error updating availability' });
  }
});

// @route   GET /api/vendors/profile
// @desc    Get vendor profile
// @access  Private (Vendor)
router.get('/profile', vendorAuth, async (req, res) => {
  try {
    const vendor = req.user;
    
    // Get vendor's products count
    const productsCount = await Product.countDocuments({ vendor: vendor._id });
    const availableProductsCount = await Product.countDocuments({ 
      vendor: vendor._id, 
      isAvailable: true 
    });

    res.json({
      vendor: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
        businessName: vendor.businessName,
        description: vendor.description,
        location: vendor.location,
        isAvailable: vendor.isAvailable,
        operatingHours: vendor.operatingHours,
        rating: vendor.rating,
        totalRatings: vendor.totalRatings,
        lastLocationUpdate: vendor.lastLocationUpdate,
        isVerified: vendor.isVerified,
        productsCount,
        availableProductsCount,
        createdAt: vendor.createdAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error getting profile' });
  }
});

// @route   PUT /api/vendors/profile
// @desc    Update vendor profile
// @access  Private (Vendor)
router.put('/profile', vendorAuth, [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('phone').optional().matches(/^[\+]?[1-9][\d]{0,15}$/).withMessage('Please provide a valid phone number'),
  body('businessName').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Business name must be 2-100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot be more than 500 characters'),
  body('operatingHours.start').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid start time format'),
  body('operatingHours.end').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid end time format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone, businessName, description, operatingHours } = req.body;
    const vendor = req.user;

    // Update fields
    if (name) vendor.name = name;
    if (phone) vendor.phone = phone;
    if (businessName) vendor.businessName = businessName;
    if (description !== undefined) vendor.description = description;
    if (operatingHours) {
      if (operatingHours.start) vendor.operatingHours.start = operatingHours.start;
      if (operatingHours.end) vendor.operatingHours.end = operatingHours.end;
    }

    await vendor.save();

    res.json({
      message: 'Profile updated successfully',
      vendor: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
        businessName: vendor.businessName,
        description: vendor.description,
        operatingHours: vendor.operatingHours
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// @route   GET /api/vendors/nearby
// @desc    Get nearby vendors
// @access  Public
router.get('/nearby', [
  query('longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  query('latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  query('maxDistance').optional().isFloat({ min: 0.1, max: 100 }).withMessage('Max distance must be between 0.1 and 100 km'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { longitude, latitude, maxDistance = 10, limit = 20 } = req.query;
    const coordinates = [parseFloat(longitude), parseFloat(latitude)];

    // Find nearby vendors using geospatial query
    const vendors = await Vendor.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: coordinates
          },
          $maxDistance: parseFloat(maxDistance) * 1000 // Convert km to meters
        }
      },
      isAvailable: true
    })
    .select('-password')
    .limit(parseInt(limit))
    .lean();

    // Add distance to each vendor
    const vendorsWithDistance = vendors.map(vendor => {
      const distance = calculateDistance(coordinates, vendor.location.coordinates);
      return {
        ...vendor,
        distance: Math.round(distance * 100) / 100 // Round to 2 decimal places
      };
    });

    res.json({
      vendors: vendorsWithDistance,
      count: vendorsWithDistance.length
    });
  } catch (error) {
    console.error('Nearby vendors error:', error);
    res.status(500).json({ message: 'Server error finding nearby vendors' });
  }
});

// @route   GET /api/vendors/:id
// @desc    Get vendor by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .select('-password')
      .populate('products', 'name category price unit isAvailable');

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

  res.json({ vendor });
  } catch (error) {
    console.error('Get vendor error:', error);
    res.status(500).json({ message: 'Server error getting vendor' });
  }
});

// Helper function to calculate distance between two coordinates
function calculateDistance(coord1, coord2) {
  const R = 6371; // Earth's radius in kilometers
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;
  
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

module.exports = router;



