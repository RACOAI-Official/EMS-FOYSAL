const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

const DB_URL = process.env.DB_URL;

mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const user = await User.findOne({ email: 'sobirahmed158@gmail.com' });

  fs.writeFileSync('current_user.json', JSON.stringify(user, null, 2));
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
