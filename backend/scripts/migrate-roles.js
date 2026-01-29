const mongoose = require('mongoose');
const User = require('../models/user-model');
require('dotenv').config();

const migrateRoles = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log('Connected to Database');

    // Update admin to super_admin
    const result = await User.updateMany(
      { type: 'admin' },
      { $set: { type: 'super_admin' } }
    );

    console.log(`Updated ${result.modifiedCount} users from 'admin' to 'super_admin'`);

    // Update existing super admin / sub admin with underscores if they exist
    await User.updateMany({ type: 'super admin' }, { $set: { type: 'super_admin' } });
    await User.updateMany({ type: 'sub admin' }, { $set: { type: 'sub_admin' } });

    console.log('Role migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateRoles();
