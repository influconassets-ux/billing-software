const mongoose = require('mongoose');
const Bill = require('./models/Bill');
require('dotenv').config();

const fixCourtField = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/billing');
    
    const startOfToday = new Date();
    startOfToday.setHours(0,0,0,0);
    
    // Find bills created today where court is equal to caseNumber
    const bills = await Bill.find({ 
      createdAt: { $gte: startOfToday }
    });
    
    let updatedCount = 0;
    for (const b of bills) {
      if (b.court === b.caseNumber) {
        b.court = '';
        await b.save();
        updatedCount++;
      }
    }
    
    console.log(`Successfully fixed 'court' field for ${updatedCount} bills.`);
    
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
};

fixCourtField();
