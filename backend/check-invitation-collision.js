const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const InvitationModel = require('./models/invitation-model');
const UserModel = require('./models/user-model');
const fs = require('fs');

const checkCollisions = async () => {
  let results = [];
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log('Connected to database');

    const emails = ['recotest850@gmail.com', 'sohrabkhansayeam@gmail.com'];

    for (const email of emails) {
      let result = { email, invitation: null, user: null, collision: false };

      const invitation = await InvitationModel.findOne({ email: new RegExp(`^${email}$`, 'i') });
      if (invitation) {
        result.invitation = { status: invitation.status, id: invitation._id };
      }

      const user = await UserModel.findOne({ email: new RegExp(`^${email}$`, 'i') });
      if (user) {
        result.user = { id: user._id };
      }

      if (invitation && user) {
        result.collision = true;
      }
      results.push(result);
    }

    fs.writeFileSync(path.join(__dirname, 'collision-report.json'), JSON.stringify(results, null, 2));
    console.log('Report saved to collision-report.json');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected');
  }
};

checkCollisions();
