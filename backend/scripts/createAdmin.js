const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('../config/db');
const User = require('../models/User');

const createAdmin = async () => {
  try {
    await connectDB();

    const email = 'admin2@zage.com';
    
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`❌ User with email ${email} already exists.`);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const admin = await User.create({
      name: 'Zage Admin 2',
      email: email,
      password: hashedPassword,
      role: 'admin',
      phone: '+94771234568',
      isActive: true,
    });

    console.log('✅ Admin user created successfully!');
    console.log(`Email: ${admin.email}`);
    console.log('Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
};

createAdmin();
