// backend/seedAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');

// Configuration
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@thefolio.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@1234';
const ADMIN_NAME = process.env.ADMIN_NAME || 'TheFolio Admin';
const FORCE_SEED = process.argv.includes('--force') || process.argv.includes('-f');

// Validation function
function validateAdminConfig() {
  const errors = [];

  if (!ADMIN_EMAIL || ADMIN_EMAIL.trim() === '') {
    errors.push('ADMIN_EMAIL is required');
  } else if (!/^\S+@\S+\.\S+$/.test(ADMIN_EMAIL)) {
    errors.push('ADMIN_EMAIL must be a valid email address');
  }

  if (!ADMIN_PASSWORD || ADMIN_PASSWORD.trim() === '') {
    errors.push('ADMIN_PASSWORD is required');
  } else if (ADMIN_PASSWORD.length < 8) {
    errors.push('ADMIN_PASSWORD must be at least 8 characters long');
  }

  if (!ADMIN_NAME || ADMIN_NAME.trim() === '') {
    errors.push('ADMIN_NAME is required');
  }

  return errors;
}

async function seedAdmin() {
  try {
    // Validate configuration
    const validationErrors = validateAdminConfig();
    if (validationErrors.length > 0) {
      console.error('❌ Validation errors:');
      validationErrors.forEach(error => console.error(`   - ${error}`));
      process.exit(1);
    }

    // Check MongoDB URI
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/thefolio';
    console.log(`🔌 Attempting to connect to MongoDB at: ${mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
    
    // Connect to database with timeout
    await connectDB();
    
    // Test the connection
    const dbStatus = mongoose.connection.readyState;
    if (dbStatus !== 1) {
      throw new Error(`MongoDB connection state is ${dbStatus} (should be 1 for connected)`);
    }
    
    console.log('✅ Database connection established successfully');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    
    // Handle existing admin
    if (existingAdmin && !FORCE_SEED) {
      console.log(`✅ Admin account already exists for ${ADMIN_EMAIL}.`);
      console.log('   Use --force flag to recreate or update the admin account.');
      console.log('\n📋 Existing admin details:');
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Status: ${existingAdmin.status}`);
      if (existingAdmin.createdAt) {
        console.log(`   Created: ${existingAdmin.createdAt}`);
      }
      process.exit(0);
    }

    // Create or update admin
    if (existingAdmin && FORCE_SEED) {
      console.log(`🔄 Updating existing admin account for ${ADMIN_EMAIL}...`);
      
      existingAdmin.name = ADMIN_NAME;
      existingAdmin.email = ADMIN_EMAIL;
      existingAdmin.password = ADMIN_PASSWORD;
      existingAdmin.role = 'admin';
      existingAdmin.status = 'active';
      
      await existingAdmin.save();
      
      console.log('✅ Admin account updated successfully!');
      console.log('\n📋 Updated admin details:');
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Status: ${existingAdmin.status}`);
    } 
    // Create new admin
    else {
      console.log(`📝 Creating new admin account for ${ADMIN_EMAIL}...`);
      
      const newAdmin = await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'admin',
        status: 'active',
      });
      
      console.log('✅ Admin account created successfully!');
      console.log('\n📋 Admin details:');
      console.log(`   Name: ${newAdmin.name}`);
      console.log(`   Email: ${newAdmin.email}`);
      console.log(`   Role: ${newAdmin.role}`);
      console.log(`   Status: ${newAdmin.status}`);
      if (newAdmin.createdAt) {
        console.log(`   Created: ${newAdmin.createdAt}`);
      }
    }

    // Display login credentials
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n🔐 Login Credentials:');
      console.log(`   Email: ${ADMIN_EMAIL}`);
      console.log(`   Password: ${ADMIN_PASSWORD}`);
      console.log('\n⚠️  IMPORTANT: Please change these credentials in production!');
    } else {
      console.log('\n🔐 Admin account has been configured with your environment variables.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding admin account:', error.message);
    
    // Provide helpful troubleshooting tips
    console.error('\n🔧 Troubleshooting Tips:');
    console.error('   1. Make sure MongoDB is installed and running');
    console.error('   2. Check if MONGODB_URI in .env is correct');
    console.error('   3. Verify network connectivity to MongoDB server');
    console.error('   4. Check if MongoDB service is started');
    console.error('   5. Ensure firewall isn\'t blocking MongoDB port (27017)');
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 MongoDB connection refused. Try:');
      console.error('   - Start MongoDB service: net start MongoDB (Windows)');
      console.error('   - Or run: mongod --dbpath="C:\\data\\db" (Windows)');
      console.error('   - Or run: sudo systemctl start mongod (Linux)');
      console.error('   - Or run: brew services start mongodb-community (macOS)');
    }
    
    if (error.message.includes('authentication')) {
      console.error('\n💡 Authentication failed. Check your MongoDB username/password in MONGODB_URI');
    }
    
    console.error('\n📚 Full error details:', error);
    process.exit(1);
  }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('\n⚠️  Process interrupted. Exiting...');
  process.exit(0);
});

// Run the seed function
seedAdmin();