require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user-model');

const DB_URL = process.env.DB_URL || process.env.MONGODB_URI;
if (!DB_URL) {
  console.error('DB_URL is not set in .env');
  process.exit(1);
}

async function run() {
  await mongoose.connect(DB_URL, { serverSelectionTimeoutMS: 10000 });
  console.log('Connected to DB');

  const admins = await User.find({ type: 'admin' });
  console.log(`Found ${admins.length} admins`);

  for (const admin of admins) {
    const res = await User.updateOne({ _id: admin._id }, { password: 'admin123' });
    console.log(`Reset password for ${admin.email}: matched=${res.matchedCount} modified=${res.modifiedCount}`);
  }

  await mongoose.disconnect();
  console.log('Done');
}

run().catch(err => { console.error(err); process.exit(1); });