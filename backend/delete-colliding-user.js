const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const UserModel = require('./models/user-model');

const emailToDelete = 'sohrabkhansayeam@gmail.com';

const deleteUser = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log('Connected to database');

    const result = await UserModel.deleteOne({ email: new RegExp(`^${emailToDelete}$`, 'i') });

    if (result.deletedCount > 0) {
      console.log(`✅ Successfully deleted user: ${emailToDelete}`);
    } else {
      console.log(`⚠️ User not found or already deleted: ${emailToDelete}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
};

deleteUser();
