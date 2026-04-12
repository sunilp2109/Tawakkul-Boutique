require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const seedAdmin = require('./seed/seedAdmin');

// Route imports
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orders');
const bannerRoutes = require('./routes/banners');
const dashboardRoutes = require('./routes/dashboard');
const customerRoutes = require('./routes/customers');
const settingsRoutes = require('./routes/settings');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const logger = require('./services/logger');

const app = express();

// Connect to MongoDB
connectDB().then(() => seedAdmin());

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }, // Enhanced referrer policy
})); 
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(hpp()); // Prevent HTTP Parameter Pollution

// Rate Limiting Helpers
const createLimiter = (windowMs, max, message, label) => rateLimit({
  windowMs,
  max,
  message: { success: false, message },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded: ${label}. IP: ${req.ip}, URL: ${req.originalUrl}`);
    res.status(options.statusCode).send(options.message);
  }
});

// Define Limiters
const globalLimiter = createLimiter(15 * 60 * 1000, 100, 'Too many requests, please try again later', 'Global API');
const authLoginLimiter = createLimiter(60 * 60 * 1000, 10, 'Too many login attempts, please try again after an hour', 'Auth Login');
const authRegisterLimiter = createLimiter(24 * 60 * 60 * 1000, 5, 'Account creation limit reached, please try again tomorrow', 'Auth Register');
const orderPlacementLimiter = createLimiter(60 * 60 * 1000, 5, 'Order limit reached, please try again in an hour', 'Order Placement');
const productScrapingLimiter = createLimiter(60 * 1000, 60, 'Too many product requests, slowing you down for security', 'Product Scraping');
const aiGenerationLimiter = createLimiter(60 * 60 * 1000, 10, 'AI generation limit reached, please try again later', 'AI Generation');

// Apply Global API Limiter
app.use('/api/', globalLimiter);

// Apply Auth Limiter (Login)
app.use('/api/auth/login', authLoginLimiter);

// Apply Account Creation / Registration Limiter (Placeholder)
app.use('/api/auth/register', authRegisterLimiter);

// Apply Order Placement Limiter (Prevent spam orders)
app.use('/api/orders', (req, res, next) => {
  if (req.method === 'POST') {
    return orderPlacementLimiter(req, res, next);
  }
  next();
});

// Apply Product Scraping Protection
app.use('/api/products', (req, res, next) => {
  if (req.method === 'GET') {
    return productScrapingLimiter(req, res, next);
  }
  next();
});

// Apply AI Generation Requests (Placeholder)
app.use('/api/ai-generate', aiGenerationLimiter);

// HTTP Logging with Morgan and Winston
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Enforce HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Tawakkul Boutique API is running 🕌', timestamp: new Date() });
});

// Error handler
app.use((err, req, res, next) => {
  // Log the error to Winston
  logger.error(`${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`, { stack: err.stack });

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
});
