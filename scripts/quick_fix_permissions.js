#!/usr/bin/env node

/**
 * Quick fix script to add basic permissions to the admin role
 * Usage: node scripts/quick_fix_permissions.js
 */

const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import models
const Role = require('../src/api/models/role.model');
const Permission = require('../src/api/models/permission.model');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fable_backend';

async function quickFixPermissions() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    const roleId = '68d03ccfcc6de0b6cc8a3152'; // Your specific role ID

    // Find the role
    const role = await Role.findById(roleId);
    if (!role) {
      console.error(`❌ Role with ID ${roleId} not found`);
      return;
    }

    console.log(`📋 Found role: ${role.name} (${role.slug})`);
    console.log(`📊 Current permissions count: ${role.permissions.length}`);

    // Create basic permissions if they don't exist
    const basicPermissions = [
      'Master Admin',
      'Operator View',
      'Operator Create',
      'Operator Edit',
      'Operator Delete',
      'Bus View',
      'Bus Create',
      'Bus Edit',
      'Bus Delete',
      'User View',
      'User Create',
      'User Edit',
      'User Delete',
    ];

    const permissionIds = [];

    for (const permissionName of basicPermissions) {
      let permission = await Permission.findOne({ name: permissionName });
      if (!permission) {
        permission = new Permission({
          name: permissionName,
        });
        await permission.save();
        console.log(`✅ Created permission: ${permissionName}`);
      } else {
        console.log(`ℹ️  Permission exists: ${permissionName}`);
      }
      permissionIds.push(permission._id);
    }

    // Update the role with permissions
    role.permissions = permissionIds;
    await role.save();

    console.log(`✅ Updated role with ${permissionIds.length} permissions`);

    // Test the access endpoint
    console.log('\n🧪 Testing the access endpoint...');
    const updatedRole = await Role.findById(roleId).populate('permissions');
    console.log(`📊 Final permissions count: ${updatedRole.permissions.length}`);

    if (updatedRole.permissions.length > 0) {
      console.log('✅ SUCCESS! The /v1/auth/access endpoint should now return permissions.');
      console.log('\n🔗 Test with this curl command:');
      console.log(`curl 'http://localhost:8082/v1/auth/access' \\`);
      console.log(`  -H 'Content-Type: application/json' \\`);
      console.log(`  --data-raw '{"roleId":"${roleId}"}'`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
quickFixPermissions()
  .then(() => {
    console.log('✅ Quick fix completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Quick fix failed:', error);
    process.exit(1);
  });
