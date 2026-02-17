const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./models/user-model');

const createUser = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log('Connected to database');

    const email = 'racotest850@gmail.com';
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log('User already exists:', existingUser.email);
    } else {
      console.log('Creating user:', email);
      const newUser = await User.create({
        name: 'Raco Test',
        email: email,
        username: 'racotest850',
        password: 'password123', // Encrypted by pre-save hook
        status: 'active',
        type: 'employee',
        employeeId: 'EMP-' + Math.floor(Math.random() * 10000)
      });
      console.log('User created successfully:', newUser.email);
    }
  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
};

createUser();
