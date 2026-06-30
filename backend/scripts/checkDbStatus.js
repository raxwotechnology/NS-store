const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('../config/db');

const checkStatus = async () => {
  try {
    await connectDB();
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('\n--- MongoDB Database Collections and Document Counts ---');
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`${col.name}: ${count} documents`);
    }
    console.log('-------------------------------------------------------\n');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error checking database status:', error);
    process.exit(1);
  }
};

checkStatus();
