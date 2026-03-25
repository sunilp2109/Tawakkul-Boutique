const express = require('express');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route GET /api/customers — unique customers from orders
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const customers = await Order.aggregate([
      {
        $group: {
          _id: '$customer.phone',
          name: { $last: '$customer.name' },
          phone: { $last: '$customer.phone' },
          address: { $last: '$customer.address' },
          email: { $last: '$customer.email' },
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          lastOrder: { $max: '$createdAt' },
        },
      },
      { $sort: { lastOrder: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    const countResult = await Order.aggregate([
      { $group: { _id: '$customer.phone' } },
      { $count: 'total' },
    ]);

    const total = countResult[0]?.total || 0;

    res.json({
      success: true,
      data: customers,
      pagination: { total, page, pages: Math.ceil(total / limit), limit },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/customers/:phone/orders — all orders for a customer
router.get('/:phone/orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ 'customer.phone': req.params.phone })
      .populate('product', 'name images')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
