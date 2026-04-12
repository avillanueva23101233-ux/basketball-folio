// backend/routes/user.routes.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');
const { uploadAvatar } = require('../config/upload');
const path = require('path');

// Get current user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, email, bio } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (bio !== undefined) user.bio = bio;
    
    await user.save();
    
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    
    res.json({ message: 'Profile updated successfully', user: userWithoutPassword });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user avatar
router.put('/avatar', authMiddleware, (req, res) => {
  uploadAvatar(req, res, async (err) => {
    try {
      // Handle multer errors
      if (err) {
        console.error('Multer error:', err);
        return res.status(400).json({ message: err.message });
      }
      
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      // Get user
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Delete old avatar if exists and it's not a default avatar
      if (user.avatar && user.avatar !== '/uploads/default-avatar.png') {
        const oldAvatarPath = path.join(__dirname, '..', user.avatar);
        const fs = require('fs');
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }
      
      // Update user avatar URL
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      user.avatar = avatarUrl;
      await user.save();
      
      res.json({ 
        message: 'Avatar updated successfully', 
        avatarUrl: avatarUrl 
      });
    } catch (error) {
      console.error('Avatar upload error:', error);
      res.status(500).json({ message: 'Failed to upload avatar. Please try again.' });
    }
  });
});

// Get user by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (admin only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete user avatar if exists
    if (user.avatar && user.avatar !== '/uploads/default-avatar.png') {
      const avatarPath = path.join(__dirname, '..', user.avatar);
      const fs = require('fs');
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }
    
    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;