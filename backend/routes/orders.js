const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const { orderValidator } = require('../middleware/validators');
const { sendWhatsAppMessage, getStatusMessage, getNewOrderMessage } = require('../services/whatsapp');

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

// @route   POST /api/orders — create order + send WhatsApp greeting
router.post('/', orderValidator, async (req, res) => {
  try {
    const order = await Order.create(req.body);

    // Decrease product stock
    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        if (item.product) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: -item.quantity }
          });
        }
      }
    }

    // Send WhatsApp welcome message
    let whatsappStatus = 'skipped';
    if (order.customer?.phone) {
      const options = getNewOrderMessage(order.customer.name, order.orderNumber);
      const sent = await sendWhatsAppMessage(order.customer.phone, options);
      whatsappStatus = sent ? 'sent' : 'failed';
    }

    res.status(201).json({ success: true, data: order, whatsappStatus });
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

// @route   PATCH /api/orders/:id/status — update status + send WhatsApp notification
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;

    const oldOrder = await Order.findById(req.params.id);
    if (!oldOrder) return res.status(404).json({ success: false, message: 'Order not found' });

    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });

    // Restore stock if cancelled (and wasn't already cancelled)
    if (status === 'Cancelled' && oldOrder.status !== 'Cancelled') {
      if (order.items && order.items.length > 0) {
        for (const item of order.items) {
          if (item.product) {
            await Product.findByIdAndUpdate(item.product, {
              $inc: { stock: item.quantity }
            });
          }
        }
      }
    }

    // Send WhatsApp status notification
    let whatsappStatus = 'skipped';
    if (order.customer?.phone) {
      const options = getStatusMessage(status, order.customer.name, order.orderNumber);
      if (options) {
        const sent = await sendWhatsAppMessage(order.customer.phone, options);
        whatsappStatus = sent ? 'sent' : 'failed';
      }
    }

    res.json({ success: true, data: order, whatsappStatus });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   POST /api/orders/:id/whatsapp — manual WhatsApp message from admin
router.post('/:id/whatsapp', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (!order.customer?.phone) return res.status(400).json({ success: false, message: 'Customer has no phone number' });

    // Use provided custom message or fall back to current status message
    const { message: customMessage } = req.body;
    let options;
    
    if (customMessage) {
      options = { type: 'text', text: customMessage };
    } else {
      options = getStatusMessage(order.status, order.customer.name, order.orderNumber) ||
                getNewOrderMessage(order.customer.name, order.orderNumber);
    }

    const sent = await sendWhatsAppMessage(order.customer.phone, options);

    if (sent) {
      res.json({ success: true, message: 'WhatsApp message sent successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send WhatsApp message.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
