const User = require('../models/User');
const Category = require('../models/Category');
const Settings = require('../models/Settings');

const seedAdmin = async () => {
  try {
    // Seed admin user
    const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (!existingAdmin) {
      await User.create({
        name: process.env.ADMIN_NAME || 'Super Admin',
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: 'superadmin',
      });
      console.log(`✅ Admin user seeded: ${process.env.ADMIN_EMAIL}`);
    }

    // Seed default categories
    const categoriesCount = await Category.countDocuments();
    if (categoriesCount === 0) {
      const defaultCategories = [
        { name: 'Gift Boxes', slug: 'gift-boxes', description: 'Beautiful Islamic gift hampers and boxes' },
        { name: 'Islamic Frames', slug: 'islamic-frames', description: 'Elegant Arabic calligraphy frames' },
        { name: 'Nikah Gifts', slug: 'nikah-gifts', description: 'Special gifts for the newly wedded couple' },
        { name: 'Eid Specials', slug: 'eid-specials', description: 'Curated gifts for Eid celebrations' },
        { name: 'Personalized Items', slug: 'personalized-items', description: 'Custom name and message gifts' },
      ];
      await Category.insertMany(defaultCategories);
      console.log('✅ Default categories seeded');
    }

    // Seed default store settings
    const settingsCount = await Settings.countDocuments();
    if (settingsCount === 0) {
      await Settings.create({
        storeName: 'Tawakkul Boutique',
        storeEmail: process.env.ADMIN_EMAIL,
        storePhone: '+91 00000 00000',
        whatsappNumber: '+91 00000 00000',
      });
      console.log('✅ Default settings seeded');
    }
  } catch (error) {
    console.error('Seed error:', error.message);
  }
};

module.exports = seedAdmin;
