const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { productValidator } = require('../middleware/validators');

const router = express.Router();

// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    
    // Only show active products for public users (unless searching/filtering by admin)
    if (!req.query.showAll) {
      query.isActive = true;
    }

    if (req.query.category) {
      if (mongoose.Types.ObjectId.isValid(req.query.category)) {
        query.category = req.query.category;
      } else {
        // Find category by name if it's not an ID
        const cat = await Category.findOne({ name: req.query.category });
        if (cat) {
          query.category = cat._id;
        } else {
          // If category name not found, return empty results
          return res.json({ success: true, data: [], pagination: { total: 0, page, pages: 0, limit } });
        }
      }
    }

    if (req.query.isFeatured) {
      query.isFeatured = req.query.isFeatured === 'true';
    }

    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    if (req.query.random === 'true') {
      const limit = parseInt(req.query.limit) || 10;
      const exclude = req.query.exclude;
      
      if (exclude && mongoose.Types.ObjectId.isValid(exclude)) {
        query._id = { $ne: new mongoose.Types.ObjectId(exclude) };
      }

      const randomProducts = await Product.aggregate([
        { $match: query },
        { $sample: { size: limit } }
      ]);
      
      const populatedProducts = await Product.populate(randomProducts, { path: 'category', select: 'name slug' });

      return res.json({
        success: true,
        data: populatedProducts,
        pagination: { total: populatedProducts.length, page: 1, pages: 1, limit },
      });
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: products,
      pagination: { total, page, pages: Math.ceil(total / limit), limit },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/products
// @access  Private
router.post('/', protect, upload.array('images', 10), productValidator, async (req, res) => {
  try {
    const { name, price, description, category, isFeatured, stock, tags } = req.body;
    const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

    const product = await Product.create({
      name, price, description, category, isFeatured: isFeatured === 'true',
      stock: stock || 0, images, tags: tags ? tags.split(',').map(t => t.trim()) : [],
    });

    const populated = await product.populate('category', 'name slug');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/products/:id
// @access  Private
router.put('/:id', protect, upload.array('images', 10), productValidator, async (req, res) => {
  try {
    const { name, price, description, category, isFeatured, stock, tags, existingImages } = req.body;
    const newImages = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
    const oldImages = existingImages ? (Array.isArray(existingImages) ? existingImages : [existingImages]) : [];
    const images = [...oldImages, ...newImages];

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, price, description, category, isFeatured: isFeatured === 'true', stock, images,
        tags: tags ? tags.split(',').map(t => t.trim()) : [] },
      { new: true, runValidators: true }
    ).populate('category', 'name slug');

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/products/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/products/:id/toggle
// @access  Private
router.patch('/:id/toggle', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    product.isActive = !product.isActive;
    await product.save();

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/products/:id/featured
// @access  Private
router.patch('/:id/featured', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    product.isFeatured = !product.isFeatured;
    await product.save();

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
