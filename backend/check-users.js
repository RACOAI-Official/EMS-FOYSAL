const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./models/user-model');

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log('Connected to database');

    const users = await User.find({}, 'email name type status');
    console.log('Total users:', users.length);
    console.log('Users found:');
    users.forEach(u => console.log(`- ${u.email} (${u.name}) [${u.type}] - ${u.status}`));

    const targetEmail = 'racotest850@gmail.com';
    const targetUser = await User.findOne({ email: targetEmail });
    if (targetUser) {
      console.log(`\nTARGET FOUND: ${targetEmail}`);
    } else {
      console.log(`\nTARGET NOT FOUND: ${targetEmail}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
};

checkUsers();
