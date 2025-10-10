const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Customer = require('../models/Customer');
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const { customerAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/customers/search
// @desc    Search for products and vendors
// @access  Public
router.get('/search', [
  query('query').trim().notEmpty().withMessage('Search query is required'),
  query('longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  query('latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  query('maxDistance').optional().isFloat({ min: 0.1, max: 100 }).withMessage('Max distance must be between 0.1 and 100 km'),
  query('category').optional().isIn(['fruits', 'vegetables', 'dairy', 'meat', 'beverages', 'snacks', 'bakery', 'grocery', 'other']).withMessage('Invalid category'),
  query('organic').optional().isBoolean().withMessage('Organic must be a boolean'),
  query('local').optional().isBoolean().withMessage('Local must be a boolean'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      query,
      longitude,
      latitude,
      maxDistance = 10,
      category,
      organic,
      local,
      limit = 20
    } = req.query;

    const coordinates = [parseFloat(longitude), parseFloat(latitude)];

    // Build search query for products
    const productQuery = {
      $text: { $search: query },
      isAvailable: true
    };

    if (category) productQuery.category = category;
    if (organic !== undefined) productQuery.organic = organic === 'true';
    if (local !== undefined) productQuery.local = local === 'true';

    // Find products matching search criteria
    const products = await Product.find(productQuery)
      .populate('vendor', 'name businessName location rating isAvailable')
      .limit(parseInt(limit));

    // Filter products by vendor location
    const nearbyProducts = products.filter(product => {
      if (!product.vendor.location || !product.vendor.isAvailable) return false;
      
      const distance = calculateDistance(coordinates, product.vendor.location.coordinates);
      return distance <= parseFloat(maxDistance);
    });

    // Add distance to each product
    const productsWithDistance = nearbyProducts.map(product => {
      const distance = calculateDistance(coordinates, product.vendor.location.coordinates);
      return {
        ...product.toObject(),
        distance: Math.round(distance * 100) / 100
      };
    });

    // Sort by distance
    productsWithDistance.sort((a, b) => a.distance - b.distance);

    // Get unique vendors from results
    const vendorIds = [...new Set(productsWithDistance.map(p => p.vendor._id.toString()))];
    const vendors = await Vendor.find({
      _id: { $in: vendorIds },
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: coordinates
          },
          $maxDistance: parseFloat(maxDistance) * 1000
        }
      }
    }).select('-password');

    // Add distance to vendors
    const vendorsWithDistance = vendors.map(vendor => {
      const distance = calculateDistance(coordinates, vendor.location.coordinates);
      return {
        ...vendor.toObject(),
        distance: Math.round(distance * 100) / 100
      };
    });

    res.json({
      products: productsWithDistance,
      vendors: vendorsWithDistance,
      count: {
        products: productsWithDistance.length,
        vendors: vendorsWithDistance.length
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server error during search' });
  }
});

// @route   GET /api/customers/suggestions
// @desc    Get personalized suggestions
// @access  Private (Customer)
router.get('/suggestions', customerAuth, async (req, res) => {
  try {
    const customer = req.user;
    const { limit = 10 } = req.query;

    // Get personalized suggestions based on search history
    const suggestions = customer.getPersonalizedSuggestions();

    // If no search history, return popular categories
    if (suggestions.length === 0) {
      const popularCategories = ['fruits', 'vegetables', 'dairy', 'snacks'];
      return res.json({ suggestions: popularCategories.slice(0, limit) });
    }

    res.json({ suggestions: suggestions.slice(0, limit) });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ message: 'Server error getting suggestions' });
  }
});

// @route   POST /api/customers/search-history
// @desc    Add search to history
// @access  Private (Customer)
router.post('/search-history', customerAuth, [
  body('query').trim().notEmpty().withMessage('Search query is required'),
  body('location.coordinates').optional().isArray({ min: 2, max: 2 }).withMessage('Coordinates must be [longitude, latitude]'),
  body('resultsCount').optional().isInt({ min: 0 }).withMessage('Results count must be a non-negative integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { query, location, resultsCount } = req.body;
    const customer = req.user;

    await customer.addSearchHistory(query, location?.coordinates, resultsCount);

    res.json({ message: 'Search added to history' });
  } catch (error) {
    console.error('Add search history error:', error);
    res.status(500).json({ message: 'Server error adding search to history' });
  }
});

// @route   GET /api/customers/search-history
// @desc    Get search history
// @access  Private (Customer)
router.get('/search-history', customerAuth, async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const customer = req.user;

    const history = customer.searchHistory.slice(0, parseInt(limit));

    res.json({ history });
  } catch (error) {
    console.error('Get search history error:', error);
    res.status(500).json({ message: 'Server error getting search history' });
  }
});

// @route   PUT /api/customers/preferences
// @desc    Update customer preferences
// @access  Private (Customer)
router.put('/preferences', customerAuth, [
  body('categories').optional().isArray().withMessage('Categories must be an array'),
  body('maxDistance').optional().isFloat({ min: 1, max: 100 }).withMessage('Max distance must be between 1 and 100 km'),
  body('organic').optional().isBoolean().withMessage('Organic must be a boolean'),
  body('local').optional().isBoolean().withMessage('Local must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { categories, maxDistance, organic, local } = req.body;
    const customer = req.user;

    if (categories) customer.preferences.categories = categories;
    if (maxDistance) customer.preferences.maxDistance = maxDistance;
    if (organic !== undefined) customer.preferences.organic = organic;
    if (local !== undefined) customer.preferences.local = local;

    await customer.save();

    res.json({
      message: 'Preferences updated successfully',
      preferences: customer.preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Server error updating preferences' });
  }
});

// @route   PUT /api/customers/location
// @desc    Update customer location
// @access  Private (Customer)
router.put('/location', customerAuth, [
  body('coordinates').isArray({ min: 2, max: 2 }).withMessage('Coordinates must be [longitude, latitude]'),
  body('address').optional().trim().notEmpty().withMessage('Address cannot be empty'),
  body('city').optional().trim().notEmpty().withMessage('City cannot be empty'),
  body('state').optional().trim().notEmpty().withMessage('State cannot be empty'),
  body('zipCode').optional().trim().notEmpty().withMessage('ZIP code cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { coordinates, address, city, state, zipCode } = req.body;
    const customer = req.user;

    // Validate coordinates
    const [longitude, latitude] = coordinates;
    if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
      return res.status(400).json({ message: 'Invalid coordinates' });
    }

    customer.location = {
      type: 'Point',
      coordinates,
      address: address || customer.location?.address,
      city: city || customer.location?.city,
      state: state || customer.location?.state,
      zipCode: zipCode || customer.location?.zipCode
    };

    await customer.save();

    res.json({
      message: 'Location updated successfully',
      location: customer.location
    });
  } catch (error) {
    console.error('Location update error:', error);
    res.status(500).json({ message: 'Server error updating location' });
  }
});

// @route   GET /api/customers/nearby-vendors
// @desc    Get nearby vendors
// @access  Private (Customer)
router.get('/nearby-vendors', customerAuth, async (req, res) => {
  try {
    const { maxDistance = 10, limit = 20 } = req.query;
    const customer = req.user;

    if (!customer.location) {
      return res.status(400).json({ message: 'Customer location not set' });
    }

    const coordinates = customer.location.coordinates;

    // Find nearby vendors
    const vendors = await Vendor.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: coordinates
          },
          $maxDistance: parseFloat(maxDistance) * 1000
        }
      },
      isAvailable: true
    })
    .select('-password')
    .limit(parseInt(limit));

    // Add distance to each vendor
    const vendorsWithDistance = vendors.map(vendor => {
      const distance = calculateDistance(coordinates, vendor.location.coordinates);
      return {
        ...vendor.toObject(),
        distance: Math.round(distance * 100) / 100
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



