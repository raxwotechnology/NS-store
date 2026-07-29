const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('../config/db');

// Import models
const User = require('../models/User');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const Notification = require('../models/Notification');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const EmployeeBreak = require('../models/EmployeeBreak');
const EmployeeTarget = require('../models/EmployeeTarget');
const Payroll = require('../models/Payroll');
const OvertimePay = require('../models/OvertimePay');
const PosSession = require('../models/PosSession');
const BarcodeLog = require('../models/BarcodeLog');
const CustomerReturn = require('../models/CustomerReturn');
const LoyaltyTransaction = require('../models/LoyaltyTransaction');

const resetData = async () => {
  try {
    await connectDB();

    console.log(' Wiping transactional and user collections...');

    const collectionsToClear = [
      { name: 'Orders', model: Order },
      { name: 'Carts', model: Cart },
      { name: 'Wishlists', model: Wishlist },
      { name: 'Notifications', model: Notification },
      { name: 'Attendances', model: Attendance },
      { name: 'Leaves', model: Leave },
      { name: 'EmployeeBreaks', model: EmployeeBreak },
      { name: 'EmployeeTargets', model: EmployeeTarget },
      { name: 'Payrolls', model: Payroll },
      { name: 'OvertimePays', model: OvertimePay },
      { name: 'PosSessions', model: PosSession },
      { name: 'BarcodeLogs', model: BarcodeLog },
      { name: 'CustomerReturns', model: CustomerReturn },
      { name: 'LoyaltyTransactions', model: LoyaltyTransaction }
    ];

    for (const item of collectionsToClear) {
      const res = await item.model.deleteMany({});
      console.log(`- Cleared ${item.name}: Deleted ${res.deletedCount} documents.`);
    }

    // Now delete all users
    const userRes = await User.deleteMany({});
    console.log(`- Cleared Users: Deleted ${userRes.deletedCount} documents.`);

    console.log('\n Creating new default admin user for NS Store...');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const admin = await User.create({
      name: 'NS Store Admin',
      email: 'admin@nsstore.com',
      password: hashedPassword,
      role: 'admin',
      phone: '+94 77 123 4567',
      isActive: true
    });

    console.log('✅ Default Admin created successfully!');
    console.log(`- Email: ${admin.email}`);
    console.log('- Password: admin123');

    await mongoose.disconnect();
    console.log('\nDatabase reset completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error.message);
    process.exit(1);
  }
};

resetData();
