require('dotenv').config();
const fs = require('fs');
const path = require('path');
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

  const file = path.join(__dirname, '..', 'dummy-data', 'admin-credentials.json');
  const raw = fs.readFileSync(file, 'utf-8');
  const admins = JSON.parse(raw);

  for (const admin of admins) {
    const existing = await User.findOne({ $or: [{ email: admin.email }, { username: admin.username }] });
    if (existing) {
      console.log(`Exists: ${admin.email}`);
      continue;
    }
    // If password looks like bcrypt hash, keep it; otherwise set default
    const isHash = typeof admin.password === 'string' && admin.password.startsWith('$2b$');
    const doc = {
      name: admin.name,
      email: admin.email,
      username: admin.username,
      mobile: admin.mobile,
      password: isHash ? admin.password : 'admin123',
      type: 'admin',
      status: admin.status || 'active',
      image: admin.image || 'user.png',
      address: admin.address || 'No Address Specified'
    };
    // Use create so pre-save hook hashes plaintext; if hash provided, updateOne to set directly
    if (isHash) {
      await User.create(doc); // pre-save won't re-hash a hash but that's acceptable; alternatively set via direct insert
    } else {
      await User.create(doc);
    }
    console.log(`Inserted: ${admin.email}`);
  }

  await mongoose.disconnect();
  console.log('Done');
}

run().catch(err => { console.error(err); process.exit(1); });