const mongoose = require('mongoose');
const Product = require('./backend/models/Product');
const dotenv = require('dotenv');

dotenv.config({ path: './backend/.env' });

async function checkProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const products = await Product.find({ isActive: true });
    console.log(`Total active products: ${products.length}`);
    
    const featured = products.filter(p => p.isFeatured);
    console.log(`Total featured products: ${featured.length}`);
    
    if (featured.length === 0 && products.length > 0) {
      console.log('Marking first 3 products as featured for testing...');
      for (let i = 0; i < Math.min(3, products.length); i++) {
        products[i].isFeatured = true;
        await products[i].save();
        console.log(`Marked ${products[i].name} as featured`);
      }
    }
    
    const featuredAfter = await Product.find({ isFeatured: true, isActive: true });
    console.log(`Featured products after update: ${featuredAfter.length}`);
    featuredAfter.forEach(p => console.log(`- ${p.name}`));

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkProducts();
