const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  storeName: { type: String, default: 'Tawakkul Boutique' },
  storeEmail: { type: String, default: 'contact@tawakkulboutique.com' },
  storePhone: { type: String, default: '+91 00000 00000' },
  storeAddress: { type: String, default: '' },
  whatsappNumber: { type: String, default: '' },
  currency: { type: String, default: 'INR' },
  currencySymbol: { type: String, default: '₹' },
  logoUrl: { type: String, default: '' },
  socialLinks: {
    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
  },
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
