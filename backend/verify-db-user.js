const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./models/user-model');

const email = 'recotest850@gmail.com';

const verifyUser = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log('Connected to database');

    const user = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });

    if (user) {
      console.log('User found:', user);
    } else {
      console.log('User not found in database');
      const count = await User.countDocuments();
      console.log(`Total users in database: ${count}`);
      if (count > 0) {
        const firstUser = await User.findOne();
        console.log('First user in DB:', firstUser.email);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
};

verifyUser();
