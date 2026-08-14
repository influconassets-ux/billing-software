const mongoose = require('mongoose');
const xlsx = require('xlsx');
const Bill = require('./models/Bill');
require('dotenv').config();

const importBills = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const workbook = xlsx.readFile('../Bills Table .xlsx');
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Skip the first row if it contains column definitions rather than real data
    // (Based on preview, the first row might be repeating headers)
    const validData = data.filter(row => row['Bill No. '] !== 'Sl No. /Bill No.' && row['Bill No. ']);

    for (const row of validData) {
      const memoNo = String(row['Bill No. '] || '');
      const caseName = row['Name of Case '] || '';
      const court = row['Case No. '] || '';
      const nature = row['Nature of Brief '] || '';
      const client = row['Client '] || '';
      const briefedBy = row['Briefed By'] || '';
      const fees = Number(row['Amount (Rs.) ']) || 0;
      let statusRaw = String(row['Status'] || '').trim();
      
      let status = 'Due';
      if (statusRaw.toLowerCase().includes('paid')) status = 'Paid';
      if (statusRaw.toLowerCase().includes('partial')) status = 'Partial';

      let amountReceived = status === 'Paid' ? fees : 0;

      // Extract date from nature (e.g. "02.01.2023")
      let dateStr = '01-01-2023'; // fallback
      const dateMatch = nature.match(/(\d{2})[./-](\d{2})[./-](\d{4})/);
      if (dateMatch) {
        dateStr = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
      } else {
        // Look for just a year like "2022"
        const yearMatch = nature.match(/(202\d)/);
        if (yearMatch) {
          dateStr = `01-01-${yearMatch[1]}`;
        }
      }

      // Check if this memoNo already exists so we don't duplicate
      const existing = await Bill.findOne({ memoNo });
      if (existing) {
        console.log(`Skipping existing bill ${memoNo}`);
        continue;
      }

      const newBill = new Bill({
        date: dateStr,
        memoNo,
        caseName,
        court,
        client,
        briefedBy,
        items: [{ nature, gm: '', fees }],
        status,
        amountReceived
      });

      await newBill.save();
      console.log(`Inserted Bill ${memoNo} (${dateStr})`);
    }

    console.log('Import completed!');
  } catch (err) {
    console.error('Error importing:', err);
  } finally {
    mongoose.connection.close();
  }
};

importBills();
