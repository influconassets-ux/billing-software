const mongoose = require('mongoose');
const Bill = require('./models/Bill');
require('dotenv').config();

const updateGM = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/billing');
    console.log('Connected to MongoDB');

    const bills = await Bill.find();
    let updatedCount = 0;

    for (const bill of bills) {
      let changed = false;
      for (const item of bill.items) {
        // If gm is not a number string, or if we just want to recalculate:
        // gm should be fees / 17
        const calculatedGm = (item.fees / 17).toString();
        if (item.gm !== calculatedGm) {
          item.gm = calculatedGm;
          changed = true;
        }
      }
      if (changed) {
        await bill.save();
        updatedCount++;
      }
    }

    console.log(`Updated GM values for ${updatedCount} bills.`);
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
};

updateGM();
