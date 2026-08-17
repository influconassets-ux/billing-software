require('dotenv').config();
const mongoose = require('mongoose');
const Bill = require('./models/Bill');

const parseDate = (dateStr) => {
  if (!dateStr) return new Date(0);
  const parts = dateStr.replace(/\./g, '-').split('-');
  if (parts.length === 3) {
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00Z`);
  }
  return new Date(0);
};

const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

async function updateMemos() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/billing');
    console.log('Connected to DB');

    const bills = await Bill.find({});
    
    bills.sort((a, b) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    const yearlyCount = {};
    const monthlyCount = {};
    const bulkOps = [];

    for (const bill of bills) {
      if (!bill.date) continue;
      const parts = bill.date.replace(/\./g, '-').split('-');
      if (parts.length !== 3) continue;

      const dd = parts[0].padStart(2, '0');
      const mm = parts[1].padStart(2, '0');
      const yyyy = parts[2];
      
      const monthIndex = parseInt(mm, 10) - 1;
      if (monthIndex < 0 || monthIndex > 11) continue;
      
      const monthName = monthNames[monthIndex];
      const yearKey = yyyy;
      const monthKey = `${mm}-${yyyy}`;

      if (!yearlyCount[yearKey]) yearlyCount[yearKey] = 0;
      if (!monthlyCount[monthKey]) monthlyCount[monthKey] = 0;

      yearlyCount[yearKey]++;
      monthlyCount[monthKey]++;

      const formattedYearly = String(yearlyCount[yearKey]).padStart(2, '0');
      const formattedMonthly = String(monthlyCount[monthKey]).padStart(2, '0');

      const newMemoNo = `${formattedYearly}/${formattedMonthly}/${monthName}/${yyyy}`;
      const correctDate = `${dd}-${mm}-${yyyy}`;
      
      if (bill.memoNo !== newMemoNo || bill.date !== correctDate) {
        bulkOps.push({
          updateOne: {
            filter: { _id: bill._id },
            update: { $set: { memoNo: newMemoNo, date: correctDate } }
          }
        });
      }
    }

    if (bulkOps.length > 0) {
      await Bill.bulkWrite(bulkOps);
      console.log(`Successfully updated ${bulkOps.length} bills with new memo numbers using bulkWrite.`);
    } else {
      console.log("No bills needed updating.");
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

updateMemos();
