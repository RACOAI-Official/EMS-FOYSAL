const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./models/user-model');

const email = 'recotest850@gmail.com';
const password = 'password123'; // Default password

const createUser = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log('Connected to database');

    const existingUser = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });
    if (existingUser) {
      console.log('User already exists:', existingUser.email);
    } else {
      console.log('Creating user...');
      const newUser = await User.create({
        name: 'Reco Test',
        email: email,
        password: password,
        status: 'active',
        type: 'employee' // Default type
      });
      console.log('User created successfully:', newUser);
    }
  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
};

createUser();
