const mongoose = require('mongoose');
require('dotenv').config();

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to DB');
    const user = await User.findOne();
    if (user) {
      user.email = 'rhiddhiman@admin.com';
      await user.save();
      console.log('User email updated to rhiddhiman@admin.com');
    } else {
      console.log('No user found');
    }
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
