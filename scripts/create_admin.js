#!/usr/bin/env node

/**
 * Script to create a sample admin user
 * Usage: node scripts/create_admin.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import models
const Admin = require('../src/api/models/admin.model');
const AdminDetail = require('../src/api/models/adminDetail.model');
const Role = require('../src/api/models/role.model');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fable_backend';

async function createSampleAdmin() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@admin.com' });
    console.log(existingAdmin,MONGODB_URI)
    if (existingAdmin) {
      console.log('⚠️  Admin with email admin@admin.com already exists');
      console.log('Admin ID:', existingAdmin._id);
      console.log('Status:', existingAdmin.is_active ? 'Active' : 'Inactive');
      return;
    }

    // Create admin user
    console.log('Creating admin user...');
    const adminData = {
      email: 'admin@admin.com',
      password: '123456', // This will be hashed by the pre-save middleware
      firstname: 'Super',
      lastname: 'Admin',
      phone: '9876543210',
      role: 'admin',
      picture: 'default.jpg',
      is_active: true,
    };

    const admin = new Admin(adminData);
    await admin.save();
    console.log('✅ Admin user created successfully');

    // Create admin details
    console.log('Creating admin details...');
    const adminDetailData = {
      adminId: admin._id,
      company: 'RedBus Admin Panel',
      address_1: 'Admin Office',
      address_2: 'Main Building',
      city: 'Mumbai',
      pincode: '400001',
      is_agent: false,
      commission: 0,
    };

    const adminDetail = new AdminDetail(adminDetailData);
    await adminDetail.save();
    console.log('✅ Admin details created successfully');

    // Find or create admin role
    console.log('Setting up admin role...');
    let adminRole = await Role.findOne({ name: 'admin' });
    if (!adminRole) {
      // Create admin role with empty permissions array initially
      // Permissions can be added later through the admin panel
      adminRole = new Role({
        name: 'admin',
        slug: 'admin',
        permissions: [], // Empty array - permissions can be added later
      });
      await adminRole.save();
      console.log('✅ Default admin role created with empty permissions');
      console.log('ℹ️  You can add permissions later through the admin panel');
    } else {
      console.log('✅ Using existing admin role');
    }

    // Assign role to admin
    admin.roleId = adminRole._id;
    await admin.save();
    console.log('✅ Admin role assigned successfully');

    // Display success message
    console.log('\n🎉 ==========================================');
    console.log('   SAMPLE ADMIN CREATED SUCCESSFULLY');
    console.log('==========================================');
    console.log('📧 Email:    admin@admin.com');
    console.log('🔑 Password: 123456');
    console.log('👤 Role:     admin');
    console.log('✅ Status:   Active');
    console.log('🆔 Admin ID:', admin._id);
    console.log('==========================================\n');

    console.log('You can now login to the admin panel using these credentials.');

  } catch (error) {
    console.error('❌ Error creating sample admin:', error.message);
    if (error.code === 11000) {
      console.error('This usually means the email already exists in the database.');
    }
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
if (require.main === module) {
  createSampleAdmin()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = createSampleAdmin;
