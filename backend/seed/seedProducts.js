require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');

const categoriesData = ["Gift Boxes", "Islamic Frames", "Nikah Gifts", "Eid Specials"];

const productsData = [
  {
    name: "Premium Ayatul Kursi Frame",
    price: 2499,
    categoryName: "Islamic Frames",
    images: ["/uploads/ayatul_kursi.png"],
    description: "Elegant Ayatul Kursi frame featuring intricate golden calligraphy on a deep black background. Perfect for home decor or gifting.",
    isFeatured: true,
    stock: 10
  },
  {
    name: "Luxury Custom Nikah Hamper",
    price: 4999,
    categoryName: "Nikah Gifts",
    images: ["/uploads/nikah_hamper.png"],
    description: "A beautifully curated hamper for the newlyweds including personalized prayer mats, tasbeeh, and attar, elegantly boxed in a premium gold-trimmed case.",
    isFeatured: true,
    stock: 5
  },
  {
    name: "Personalized Velvet Quran Set",
    price: 3200,
    categoryName: "Gift Boxes",
    images: ["/uploads/quran_set.png"],
    description: "Includes a premium velvet-covered Quran, matching tasbeeh, and a customized golden nameplate on the beautifully crafted box.",
    isFeatured: true,
    stock: 8
  },
  {
    name: "Minimalist Sabr Frame",
    price: 1299,
    categoryName: "Islamic Frames",
    images: ["/uploads/sabr_frame.png"],
    description: "A sleek and modern abstract frame with 'Sabr' (Patience) written in beautiful Arabic typography.",
    isFeatured: false,
    stock: 15
  },
  {
    name: "Eid Special Attar & Dates Box",
    price: 1899,
    categoryName: "Eid Specials",
    images: ["/uploads/eid_attar.png"],
    description: "A premium assortment of original Ajwa dates from Madinah and luxurious non-alcoholic attar in an elegant festive box.",
    isFeatured: true,
    stock: 20
  },
  {
    name: "Custom Name Acrylic Stand",
    price: 1499,
    categoryName: "Gift Boxes",
    images: ["/uploads/acrylic_stand.png"],
    description: "Clear acrylic stand featuring a beautiful 3D mirror-gold customized name in English or Arabic typography.",
    isFeatured: false,
    stock: 12
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding');

    // Clear existing products to avoid duplicates and fix paths
    await Product.deleteMany({});
    // await Category.deleteMany({});

    // Create Categories
    const categoryMap = {};
    for (const name of categoriesData) {
      let category = await Category.findOne({ name });
      if (!category) {
        category = await Category.create({ name });
        console.log(`📁 Created category: ${name}`);
      }
      categoryMap[name] = category._id;
    }

    // Create Products
    for (const p of productsData) {
      const exists = await Product.findOne({ name: p.name });
      if (!exists) {
        await Product.create({
          ...p,
          category: categoryMap[p.categoryName]
        });
        console.log(`📦 Created product: ${p.name}`);
      } else {
        console.log(`⚠️ Product already exists: ${p.name}`);
      }
    }

    console.log('✨ Seeding completed!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedDB();
