const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./src/api/models/admin.model');
const AdminDetail = require('./src/api/models/adminDetail.model');
const Role = require('./src/api/models/role.model');

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/redbus_admin', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create sample admin
const createSampleAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@admin.com' });
    if (existingAdmin) {
      console.log('Admin with email admin@admin.com already exists');
      return;
    }

    // Create admin data
    const adminData = {
      email: 'admin@admin.com',
      password: '123456',
      firstname: 'Super',
      lastname: 'Admin',
      phone: '9876543210',
      role: 'admin',
      picture: 'default.jpg',
      is_active: true,
    };

    // Create admin
    const admin = new Admin(adminData);
    await admin.save();
    console.log('Admin created successfully:', admin.email);

    // Create admin details
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
    console.log('Admin details created successfully');

    // Try to find or create a default admin role
    let adminRole = await Role.findOne({ name: 'admin' });
    if (!adminRole) {
      adminRole = new Role({
        name: 'admin',
        description: 'Super Admin Role',
        permissions: [], // You can add specific permissions here
        isActive: true,
      });
      await adminRole.save();
      console.log('Default admin role created');
    }

    // Update admin with role
    admin.roleId = adminRole._id;
    await admin.save();
    console.log('Admin role assigned successfully');

    console.log('\n=== Sample Admin Created Successfully ===');
    console.log('Email: admin@admin.com');
    console.log('Password: 123456');
    console.log('Role: admin');
    console.log('Status: Active');
    console.log('==========================================');

  } catch (error) {
    console.error('Error creating sample admin:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await createSampleAdmin();
  await mongoose.connection.close();
  console.log('Database connection closed');
  process.exit(0);
};

// Run the script
main().catch((error) => {
  console.error('Script execution error:', error);
  process.exit(1);
});
