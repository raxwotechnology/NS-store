const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('../config/db');
const User = require('../models/User');
const Store = require('../models/Store');

const addNsStore = async () => {
  try {
    await connectDB();

    const adminUser = await User.findOne({ role: 'admin' });
    const managers = await User.find({ role: 'manager' }).sort({ createdAt: 1 });
    const manager = managers[0] || adminUser;

    if (!manager) {
      console.error('❌ Error: No manager or admin user found. Please run bootstrapAdmin.js first.');
      process.exit(1);
    }

    const storeData = {
      managerId: manager._id,
      name: 'NS Store',
      slug: 'ns-store',
      description: 'Premium store offering fashion, cosmetics, and accessories.',
      address: '742 Store Lane, Colombo',
      city: 'Colombo',
      phone: '071 9781939',
      email: 'info@nsstore.com',
      bannerImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200',
      logo: '/uploads/logo-ns-store.jpg',
      operatingHours: { open: '09:00', close: '21:00' },
      isActive: true,
    };

    // Find and update, or create if doesn't exist
    const nsStore = await Store.findOneAndUpdate(
      { name: 'NS Store' },
      { $set: storeData },
      { new: true, upsert: true }
    );

    console.log('✅ NS Store successfully updated/created:', nsStore);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating/updating NS Store:', error.message);
    process.exit(1);
  }
};

addNsStore();
