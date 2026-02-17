const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./models/user-model');

const promoteUser = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log('Connected to database');

    const email = 'racotest850@gmail.com';
    const user = await User.findOne({ email });

    if (user) {
      console.log('Found user:', user.email);
      user.type = 'super_admin';
      await user.save();
      console.log('User promoted to super_admin successfully.');
    } else {
      console.log('User not found:', email);
    }
  } catch (error) {
    console.error('Error promoting user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
};

promoteUser();
