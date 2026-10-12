const mongoose = require('mongoose');
const Bill = require('./models/Bill');
require('dotenv').config();

const deleteBadBills = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/billing');
    
    // Find the bill 75/10/AUG/2026
    const badBill = await Bill.findOne({ memoNo: '75/10/AUG/2026' });
    if (!badBill) {
      console.log('Bill 75/10/AUG/2026 not found!');
      return;
    }
    
    const count = await Bill.countDocuments({ createdAt: { $gte: badBill.createdAt } });
    console.log(`Found ${count} bills created at or after ${badBill.createdAt}. Deleting them...`);
    
    const result = await Bill.deleteMany({ createdAt: { $gte: badBill.createdAt } });
    console.log(`Deleted ${result.deletedCount} bills.`);
    
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
};

deleteBadBills();
