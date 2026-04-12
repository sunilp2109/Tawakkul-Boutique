const { body, validationResult } = require('express-validator');

/**
 * Common middleware to handle validation results.
 * If errors exist, returns a 400 with the error details.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
    });
  }
  next();
};

// --- Auth Validators ---
const loginValidator = [
  body('email').isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

// --- Product Validators ---
const productValidator = [
  body('name').trim().notEmpty().withMessage('Product name is required').escape(),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('description').trim().optional().escape(),
  body('category').isMongoId().withMessage('Invalid category ID'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  validate
];

// --- Order Validators ---
const orderValidator = [
  body('customer.name').trim().notEmpty().withMessage('Customer name is required').escape(),
  body('customer.email').isEmail().withMessage('Valid customer email is required').normalizeEmail(),
  body('customer.phone').notEmpty().withMessage('Customer phone is required').matches(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/).withMessage('Invalid phone number format'),
  body('customer.address').trim().notEmpty().withMessage('Shipping address is required').escape(),
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.product').isMongoId().withMessage('Invalid product ID in items'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('totalAmount').isFloat({ min: 0 }).withMessage('Total amount must be a positive number'),
  validate
];

// --- Category Validators ---
const categoryValidator = [
  body('name').trim().notEmpty().withMessage('Category name is required').escape(),
  body('description').trim().optional().escape(),
  validate
];

// --- Settings Validators ---
const settingsValidator = [
  body('storeName').trim().optional().escape(),
  body('contactEmail').optional().isEmail().withMessage('Invalid contact email').normalizeEmail(),
  body('contactPhone').optional().matches(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/).withMessage('Invalid contact phone'),
  body('address').trim().optional().escape(),
  validate
];

// --- Banner Validators ---
const bannerValidator = [
  body('title').trim().notEmpty().withMessage('Banner title is required').escape(),
  body('order').optional().isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
  validate
];

module.exports = {
  loginValidator,
  productValidator,
  orderValidator,
  categoryValidator,
  settingsValidator,
  bannerValidator
};
