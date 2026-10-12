const mongoose = require('mongoose');
const Bill = require('./models/Bill');
require('dotenv').config();

const findBills = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/billing');
    
    // Find bills created today
    const startOfToday = new Date();
    startOfToday.setHours(0,0,0,0);
    
    const count = await Bill.countDocuments({ createdAt: { $gte: startOfToday } });
    console.log(`There are ${count} bills created today.`);
    
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
};

findBills();
