const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, default: '' },
    pincode: { type: String, default: '' },
    email: { type: String, default: '' },
  },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, default: 1 },
    customization: { type: Object, default: {} },
  }],
  totalAmount: { type: Number, required: true },
  shippingFee: { type: Number, default: 59 },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  source: { type: String, enum: ['WhatsApp', 'Website', 'Direct'], default: 'Website' },
  whatsappOrderId: { type: String, default: '' },
  notes: { type: String, default: '' },
  isRead: { type: Boolean, default: false }, // for notifications
}, { timestamps: true });

// Auto-generate order number
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `TB-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Index for search and filtering
orderSchema.index({ 'customer.name': 'text', 'customer.phone': 'text', productName: 'text' });

module.exports = mongoose.model('Order', orderSchema);
