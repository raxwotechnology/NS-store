const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('../config/db');

// List of collections that are considered transactional/financial/logs/temporary and should be cleared
const collectionsToClear = [
  'orders',
  'supplierpayments',
  'payrolls',
  'overtimepays',
  'additionalincomes',
  'expenses',
  'possessions',       // PosSession
  'stockreceipts',     // Stock Receipts
  'attendances',
  'leaves',
  'employeetargets',
  'barcodelogs',
  'carts',
  'notifications',
  'pricehistories',
  'wishlists',
  'vouchers',
  'promotions',
  'reviews',
  'customerreturns',
  'supplierreturns',
  'inventorytransfers',
  'loyaltytransactions',
  'employeebreaks',
  'registrationotps',
  'paymentotps'
];

// List of collections that MUST be kept intact
const collectionsToKeep = [
  'products',
  'users',             // Logins / Accounts
  'stores',
  'categories',
  'suppliers',
  'couriers',
  'settings'
];

const runCleanup = async () => {
  const execute = process.argv.includes('--execute');

  try {
    await connectDB();
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const existingColNames = collections.map(c => c.name);

    console.log('\n======================================================');
    console.log(execute ? 'RUNNING DATABASE CLEANUP (LIVE)...' : 'DATABASE CLEANUP DRY-RUN...');
    console.log('======================================================\n');

    console.log('--- Collections to KEEP Intact ---');
    for (const name of collectionsToKeep) {
      if (existingColNames.includes(name)) {
        const count = await db.collection(name).countDocuments();
        console.log(`✓ ${name}: keeping ${count} documents`);
      } else {
        console.log(`✓ ${name}: (does not exist in DB yet)`);
      }
    }

    console.log('\n--- Collections to CLEAR ---');
    let totalCleared = 0;
    for (const name of collectionsToClear) {
      if (existingColNames.includes(name)) {
        const count = await db.collection(name).countDocuments();
        console.log(`✗ ${name}: will clear ${count} documents`);
        
        if (execute && count > 0) {
          await db.collection(name).deleteMany({});
          console.log(`  -> Cleared ${name}`);
        }
        totalCleared += count;
      }
    }

    console.log('\n======================================================');
    if (execute) {
      console.log(`CLEANUP COMPLETE: Cleared documents from target collections.`);
    } else {
      console.log(`DRY RUN COMPLETE: Run with '--execute' to delete ${totalCleared} documents.`);
    }
    console.log('======================================================\n');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
};

runCleanup();
