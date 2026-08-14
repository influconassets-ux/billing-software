const mongoose = require('mongoose');
const Bill = require('./models/Bill');
require('dotenv').config();

const updateMemoNumbers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const allBills = await Bill.find({});
    console.log(`Found ${allBills.length} bills.`);

    const billsByYear = {};

    for (const bill of allBills) {
      if (!bill.date || !bill.date.includes('-')) continue;
      
      const parts = bill.date.split('-');
      if (parts.length !== 3) continue;
      
      const yyyy = parts[2];
      if (!billsByYear[yyyy]) billsByYear[yyyy] = [];
      billsByYear[yyyy].push(bill);
    }

    let updatedCount = 0;

    for (const yyyy in billsByYear) {
      const bills = billsByYear[yyyy];
      
      // Sort chronologically by DD-MM-YYYY
      bills.sort((a, b) => {
        const partsA = a.date.split('-');
        const partsB = b.date.split('-');
        const dateA = new Date(partsA[2], partsA[1] - 1, partsA[0]);
        const dateB = new Date(partsB[2], partsB[1] - 1, partsB[0]);
        return dateA - dateB;
      });

      const monthCounts = {};
      let yearlyCount = 1;

      for (const bill of bills) {
        const parts = bill.date.split('-');
        const mm = parts[1];
        
        if (!monthCounts[mm]) monthCounts[mm] = 1;
        
        const monthlyCount = monthCounts[mm];
        monthCounts[mm]++;
        
        const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        const monthName = monthNames[parseInt(mm, 10) - 1];
        
        const formattedYearly = String(yearlyCount).padStart(2, '0');
        const formattedMonthly = String(monthlyCount).padStart(2, '0');
        
        bill.memoNo = `${formattedYearly}/${formattedMonthly}/${monthName}/${yyyy}`;
        
        yearlyCount++;
        await bill.save();
        updatedCount++;
      }
    }

    console.log(`Updated ${updatedCount} bills with new memo format.`);

  } catch (err) {
    console.error('Error updating:', err);
  } finally {
    mongoose.connection.close();
  }
};

updateMemoNumbers();
