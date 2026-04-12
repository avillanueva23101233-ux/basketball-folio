// backend/scripts/createAdminAccount.js

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

// Admin account details
const ADMIN_EMAIL = 'admin@thefolio.com';
const ADMIN_PASSWORD = 'Admin@1234';
const ADMIN_NAME = 'TheFolio Admin';

async function createAdminAccount() {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Get User model
    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: String,
      bio: String,
      avatar: String,
      createdAt: Date
    }));

    // Check if admin already exists
    let admin = await User.findOne({ email: ADMIN_EMAIL });
    
    if (admin) {
      console.log('📋 Admin account found. Updating password...');
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
      
      // Update admin
      admin.password = hashedPassword;
      admin.name = ADMIN_NAME;
      admin.role = 'admin';
      await admin.save();
      
      console.log('✅ Admin account updated successfully!');
    } else {
      console.log('📝 Creating new admin account...');
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
      
      // Create new admin
      admin = new User({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: 'admin',
        bio: 'Basketball portfolio administrator',
        createdAt: new Date()
      });
      
      await admin.save();
      console.log('✅ Admin account created successfully!');
    }
    
    console.log('\n🔐 Admin Login Credentials:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   Role: ${admin.role}`);
    
    // Verify password works
    const isMatch = await bcrypt.compare(ADMIN_PASSWORD, admin.password);
    console.log(`\n✅ Password verification: ${isMatch ? 'PASSED' : 'FAILED'}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdminAccount();