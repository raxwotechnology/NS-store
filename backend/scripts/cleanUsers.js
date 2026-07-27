const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('../config/db');
const User = require('../models/User');

const cleanUsers = async () => {
  try {
    await connectDB();

    const emailToKeep = 'admin2@zage.com';
    const adminToKeep = await User.findOne({ email: emailToKeep });

    if (!adminToKeep) {
      console.log(`❌ Admin user with email ${emailToKeep} not found in the database.`);
      process.exit(1);
    }

    console.log(`Keeping admin: ${adminToKeep.name} (${adminToKeep.email})`);

    // Delete all other users
    const deleteResult = await User.deleteMany({ _id: { $ne: adminToKeep._id } });
    console.log(`✅ Deleted ${deleteResult.deletedCount} other user(s) from the database.`);

    // Verify
    const remainingUsers = await User.find({});
    console.log(`\nRemaining users in database (Total: ${remainingUsers.length}):`);
    remainingUsers.forEach(u => {
      console.log(`- ${u.name} (${u.email}) - Role: ${u.role}`);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning users:', error.message);
    process.exit(1);
  }
};

cleanUsers();
