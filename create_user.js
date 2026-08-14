const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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
    const email = 'admin@admin.com';
    const password = 'password123';
    
    let user = await User.findOne({ email });
    if (user) {
      console.log('User already exists: admin@admin.com / password123');
      process.exit();
    }
    
    user = new User({ email, password });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    console.log('Default user created: admin@admin.com / password123');
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
