// backend/routes/auth.routes.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendResetEmail } = require('../config/email');

// ... (your existing login and register routes)

// =========================
// FORGOT PASSWORD ROUTE
// =========================
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // For security, don't reveal that email doesn't exist
      return res.status(200).json({ 
        message: 'If your email is registered, you will receive a password reset link.' 
      });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
    
    // Save token to database
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();
    
    // Send email with reset link
    const emailSent = await sendResetEmail(user.email, resetToken, user.name);
    
    if (emailSent) {
      res.status(200).json({ 
        message: 'Password reset link sent to your email address.' 
      });
    } else {
      // Clear token if email failed
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();
      
      res.status(500).json({ 
        message: 'Failed to send reset email. Please try again later.' 
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// =========================
// RESET PASSWORD ROUTE
// =========================
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }
    
    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      return res.status(400).json({ message: 'Password must contain at least one uppercase letter' });
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      return res.status(400).json({ message: 'Password must contain at least one lowercase letter' });
    }
    
    if (!/(?=.*\d)/.test(password)) {
      return res.status(400).json({ message: 'Password must contain at least one number' });
    }
    
    // Find user by valid token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token. Please request a new one.' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Update user password and clear reset fields
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    
    res.status(200).json({ 
      message: 'Password reset successful! You can now login with your new password.' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// =========================
// VERIFY RESET TOKEN ROUTE (Optional - for validation)
// =========================
router.get('/verify-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ valid: false, message: 'Invalid or expired token' });
    }
    
    res.json({ valid: true, message: 'Token is valid' });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;