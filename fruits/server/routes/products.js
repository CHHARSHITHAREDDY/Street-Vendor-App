const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const { vendorAuth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/products
// @desc    Create a new product
// @access  Private (Vendor)
router.post('/', vendorAuth, [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Product name must be 2-100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot be more than 500 characters'),
  body('category').isIn(['fruits', 'vegetables', 'dairy', 'meat', 'beverages', 'snacks', 'bakery', 'grocery', 'other']).withMessage('Invalid category'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('unit').isIn(['kg', 'lb', 'piece', 'dozen', 'liter', 'gallon', 'pack', 'bunch', 'bag']).withMessage('Invalid unit'),
  body('quantity').isFloat({ min: 0 }).withMessage('Quantity must be a positive number'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('organic').optional().isBoolean().withMessage('Organic must be a boolean'),
  body('local').optional().isBoolean().withMessage('Local must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      description,
      category,
      price,
      unit,
      quantity,
      images,
      tags,
      nutritionalInfo,
      organic,
      local
    } = req.body;

    const product = new Product({
      vendor: req.user._id,
      name,
      description,
      category,
      price,
      unit,
      quantity,
      images: images || [],
      tags: tags || [],
      nutritionalInfo: nutritionalInfo || {},
      organic: organic || false,
      local: local !== undefined ? local : true
    });

    await product.save();

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error creating product' });
  }
});

// @route   GET /api/products
// @desc    Get vendor's products
// @access  Private (Vendor)
router.get('/', vendorAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, category, isAvailable } = req.query;
    const query = { vendor: req.user._id };

    if (category) query.category = category;
    if (isAvailable !== undefined) query.isAvailable = isAvailable === 'true';

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error getting products' });
  }
});

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Private (Vendor)
router.get('/:id', vendorAuth, async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      vendor: req.user._id
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error getting product' });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Vendor)
router.put('/:id', vendorAuth, [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Product name must be 2-100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot be more than 500 characters'),
  body('category').optional().isIn(['fruits', 'vegetables', 'dairy', 'meat', 'beverages', 'snacks', 'bakery', 'grocery', 'other']).withMessage('Invalid category'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('unit').optional().isIn(['kg', 'lb', 'piece', 'dozen', 'liter', 'gallon', 'pack', 'bunch', 'bag']).withMessage('Invalid unit'),
  body('quantity').optional().isFloat({ min: 0 }).withMessage('Quantity must be a positive number'),
  body('isAvailable').optional().isBoolean().withMessage('isAvailable must be a boolean'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('organic').optional().isBoolean().withMessage('Organic must be a boolean'),
  body('local').optional().isBoolean().withMessage('Local must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.findOne({
      _id: req.params.id,
      vendor: req.user._id
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update fields
    const allowedUpdates = [
      'name', 'description', 'category', 'price', 'unit', 'quantity',
      'isAvailable', 'images', 'tags', 'nutritionalInfo', 'organic', 'local'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    await product.save();

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error updating product' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (Vendor)
router.delete('/:id', vendorAuth, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      vendor: req.user._id
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error deleting product' });
  }
});

// @route   PUT /api/products/:id/availability
// @desc    Toggle product availability
// @access  Private (Vendor)
router.put('/:id/availability', vendorAuth, [
  body('isAvailable').isBoolean().withMessage('isAvailable must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { isAvailable } = req.body;

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, vendor: req.user._id },
      { isAvailable },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      message: `Product ${isAvailable ? 'is now available' : 'is now unavailable'}`,
      product
    });
  } catch (error) {
    console.error('Toggle product availability error:', error);
    res.status(500).json({ message: 'Server error updating product availability' });
  }
});

module.exports = router;



