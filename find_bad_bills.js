const mongoose = require('mongoose');
const Bill = require('./models/Bill');
require('dotenv').config();

const findBills = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/billing');
    
    // Find bills that match the screenshot
    const bills = await Bill.find({
      $or: [
        { memoNo: '69/04/AUG/2026' },
        { memoNo: '75/10/AUG/2026' },
        { memoNo: '76/11/AUG/2026' }
      ]
    }).sort({ createdAt: 1 });
    
    for (const b of bills) {
      console.log(`MemoNo: ${b.memoNo}, Case: ${b.caseName}, CreatedAt: ${b.createdAt}`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
};

findBills();
