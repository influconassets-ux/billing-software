require('dotenv').config();
const mongoose = require('mongoose');
const Bill = require('./models/Bill');

async function diagnose() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/billing');
  
  const bills = await Bill.find({});
  
  const bills2026 = bills.filter(b => b.date && b.date.endsWith('-2026'));
  console.log(`Total bills in 2026: ${bills2026.length}`);
  
  const aug2026 = bills2026.filter(b => b.date.includes('-08-2026'));
  console.log(`Total bills in AUG 2026: ${aug2026.length}`);
  
  // Find potential duplicates
  const seen = {};
  let duplicates = 0;
  for (const b of bills) {
    const key = `${b.date}_${b.client}_${b.caseName}`;
    if (seen[key]) {
      duplicates++;
    } else {
      seen[key] = 1;
    }
  }
  
  console.log(`Total duplicate records detected (same date, client, caseName): ${duplicates}`);
  process.exit(0);
}
diagnose();
