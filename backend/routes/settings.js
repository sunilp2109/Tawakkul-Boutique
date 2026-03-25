const express = require('express');
const User = require('../models/User');
const Settings = require('../models/Settings');
const bcrypt = require('bcryptjs');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route GET /api/settings/store
router.get('/store', protect, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route PUT /api/settings/store
router.put('/store', protect, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route PATCH /api/settings/profile
router.patch('/profile', protect, async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email, avatar },
      { new: true, runValidators: true }
    ).select('-password');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route PATCH /api/settings/password
router.patch('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save(); // triggers pre-save hash
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
