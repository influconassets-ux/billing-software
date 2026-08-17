require('dotenv').config();
const mongoose = require('mongoose');
const Bill = require('./models/Bill');

async function dedupe() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/billing');
    console.log('Connected to DB for deduplication');

    const bills = await Bill.find({}).sort({ createdAt: 1 }); // Oldest first
    const seen = {};
    const toDelete = [];

    for (const b of bills) {
      // Normalize values to avoid casing/spacing issues making duplicates look unique
      const date = (b.date || '').trim();
      const client = (b.client || '').trim();
      const caseName = (b.caseName || '').trim();
      
      const key = `${date}_${client}_${caseName}`;
      
      if (seen[key]) {
        toDelete.push(b._id);
      } else {
        seen[key] = true;
      }
    }

    if (toDelete.length > 0) {
      await Bill.deleteMany({ _id: { $in: toDelete } });
      console.log(`Successfully deleted ${toDelete.length} duplicate bills.`);
    } else {
      console.log('No duplicates found.');
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

dedupe();
