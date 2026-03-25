const express = require('express');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/orders
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.source) query.source = req.query.source;
    if (req.query.search) {
      const re = new RegExp(req.query.search, 'i');
      query.$or = [
        { 'customer.name': re },
        { 'customer.phone': re },
        { 'items.name': re },
        { orderNumber: re },
      ];
    }
    if (req.query.dateFrom || req.query.dateTo) {
      query.createdAt = {};
      if (req.query.dateFrom) query.createdAt.$gte = new Date(req.query.dateFrom);
      if (req.query.dateTo) query.createdAt.$lte = new Date(req.query.dateTo + 'T23:59:59');
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: orders,
      pagination: { total, page, pages: Math.ceil(total / limit), limit },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/orders/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name images price');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/orders
router.post('/', async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/orders/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('items.product', 'name images price');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/orders/:id/status  — just update status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/orders/:id/read — mark as read (for notifications)
router.patch('/:id/read', protect, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/orders/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Order deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
