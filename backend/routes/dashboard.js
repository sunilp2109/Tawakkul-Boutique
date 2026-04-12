const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route GET /api/dashboard
router.get('/', protect, async (req, res) => {
  try {
    const [
      totalProducts,
      totalOrders,
      pendingOrders,
      unreadOrders,
      revenueAgg,
      recentOrders,
      ordersByStatus,
      monthlyRevenue,
    ] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.countDocuments({ status: 'Pending' }),
      Order.countDocuments({ isRead: false }),
      Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.find().sort({ createdAt: -1 }).limit(10).populate('items.product', 'name images'),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      // Revenue per month (last 6 months)
      Order.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) }, status: { $ne: 'Cancelled' } } },
        { $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        }},
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;

    res.json({
      success: true,
      data: {
        totalProducts,
        totalOrders,
        pendingOrders,
        unreadOrders,
        totalRevenue,
        recentOrders,
        ordersByStatus,
        monthlyRevenue,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/dashboard/notifications
router.get('/notifications', protect, async (req, res) => {
  try {
    const notifications = await Order.find({ isRead: false })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('orderNumber customer.name items totalAmount status createdAt');
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
