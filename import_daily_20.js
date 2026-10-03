const mongoose = require('mongoose');
const xlsx = require('xlsx');
const path = require('path');
const Bill = require('./models/Bill');
require('dotenv').config();

const importDaily = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/billing');
    console.log('Connected to MongoDB');

    const filePath = path.join(__dirname, '../Daily Billings.xlsx');
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

    // Row 20 in Excel corresponds to index 19 (header is 19 in 1-based? No, index 19 is row 20 since header is row 19)
    // We already checked that row 20 is `data[19]`
    for (let i = 19; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0 || !row[1]) continue;

      // Extract date from Excel serial number or string
      let dateObj;
      if (typeof row[0] === 'number') {
        dateObj = new Date(Math.round((row[0] - 25569) * 86400 * 1000));
      } else {
        dateObj = new Date(row[0]);
      }
      
      const dd = String(dateObj.getDate()).padStart(2, '0');
      const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
      const yyyy = String(dateObj.getFullYear());
      const dateStr = `${dd}-${mm}-${yyyy}`;

      const caseName = row[2] || '';
      const caseNumber = row[3] || '';
      const nature = row[4] || '';
      const client = row[5] || '';
      const briefedBy = row[6] || '';
      const fees = Number(row[7]) || 0;
      const breakupStr = row[8] ? String(row[8]) : null;
      const cor = row[9] || '';

      // Create items
      let items = [];
      if (breakupStr) {
        const feesArray = breakupStr.split(',').map(v => Number(v.trim())).filter(v => !isNaN(v));
        const natureArray = nature.split(/ and /i).map(v => v.trim());
        
        if (feesArray.length === natureArray.length) {
          for (let j = 0; j < feesArray.length; j++) {
            items.push({ nature: natureArray[j], gm: (feesArray[j] / 17).toString(), fees: feesArray[j] });
          }
        } else {
          for (let j = 0; j < feesArray.length; j++) {
             let n = natureArray[j] || nature;
             items.push({ nature: n, gm: (feesArray[j] / 17).toString(), fees: feesArray[j] });
          }
        }
      } else {
        items.push({ nature, gm: (fees / 17).toString(), fees });
      }

      // Generate memoNo
      const monthName = monthNames[dateObj.getMonth()];
      const yearRegex = new RegExp(`-${yyyy}$`);
      const billsThisYear = await Bill.find({ date: yearRegex });
      const monthYearRegex = new RegExp(`-${mm}-${yyyy}$`);
      const billsThisMonth = await Bill.find({ date: monthYearRegex });

      const yearlyCount = billsThisYear.length + 1;
      const monthlyCount = billsThisMonth.length + 1;
      const formattedYearly = String(yearlyCount).padStart(2, '0');
      const formattedMonthly = String(monthlyCount).padStart(2, '0');
      
      const memoNo = `${formattedYearly}/${formattedMonthly}/${monthName}/${yyyy}`;

      const newBill = new Bill({
        date: dateStr,
        memoNo,
        caseName,
        caseNumber,
        court: caseNumber, // the schema uses court for caseNumber sometimes
        client,
        briefedBy,
        cor,
        items,
        status: 'Due',
        amountReceived: 0
      });

      await newBill.save();
      console.log(`Inserted Bill ${memoNo} (${dateStr}) for ${caseName}`);
    }

    console.log('Import from Row 20 completed.');
  } catch (err) {
    console.error('Error importing:', err);
  } finally {
    mongoose.connection.close();
  }
};

importDaily();
