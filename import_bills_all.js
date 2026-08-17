const mongoose = require('mongoose');
const xlsx = require('xlsx');
const Bill = require('./models/Bill');
require('dotenv').config();

const importBills = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // WIPE Existing Bills (Since this is a fresh import to replace the partial one)
    await Bill.deleteMany({});
    console.log('Cleared existing bills.');

    const workbook = xlsx.readFile('../Bills Table.xlsx');
    
    // Iterate through all sheets except Sheet1 if it's empty
    for (const sheetName of workbook.SheetNames) {
      if (!sheetName.includes('Bills - ')) continue; // Skip random sheets
      console.log(`\nImporting sheet: ${sheetName}`);
      
      const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
      const validData = data.filter(row => row['Bill No. '] !== 'Sl No. /Bill No.' && row['Bill No. ']);

      for (const row of validData) {
        const memoNo = String(row['Bill No. '] || '').trim();
        const caseName = row['Name of Case '] || '';
        const court = row['Case No. '] || '';
        const nature = row['Nature of Brief '] || '';
        const client = row['Client '] || '';
        const briefedBy = row['Briefed By'] || '';
        
        // Handle varied column names
        const fees = Number(row['Amount (Rs.) ']) || Number(row['Fees (Rs.) ']) || 0;
        let statusRaw = String(row['Status'] || '').trim();
        
        let status = 'Due';
        if (statusRaw.toLowerCase().includes('paid')) status = 'Paid';
        if (statusRaw.toLowerCase().includes('partial')) status = 'Partial';

        let amountReceived = status === 'Paid' ? fees : 0;

        // Determine default year from sheet name (e.g. Bills - 2024 -> 2024)
        const sheetYearMatch = sheetName.match(/202\d/);
        const fallbackYear = sheetYearMatch ? sheetYearMatch[0] : '2023';

        // Extract date from nature (e.g. "02.01.2023")
        let dateStr = null; 
        const dateMatch = nature.match(/(\d{2})[./-](\d{2})[./-](\d{4})/);
        if (dateMatch) {
          dateStr = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
        } else {
          // Look for just a year like "2022" in nature
          const yearMatch = nature.match(/(202\d)/);
          if (yearMatch) {
            dateStr = `01-01-${yearMatch[1]}`;
          }
        }
        
        // If still no date, extract month/year from memoNo (e.g. 67/02/AUG/2026)
        if (!dateStr) {
          const memoParts = memoNo.split('/');
          if (memoParts.length >= 4) {
            const monthStr = memoParts[2].toUpperCase();
            const yearStr = memoParts[3];
            const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
            let monthIndex = monthNames.indexOf(monthStr);
            if (monthStr === "SEPT") monthIndex = 8; // Handle SEPT mapping
            
            if (monthIndex !== -1 && yearStr.match(/202\d/)) {
              dateStr = `01-${String(monthIndex + 1).padStart(2, '0')}-${yearStr.substring(0,4)}`;
            }
          }
        }
        
        // Final fallback
        if (!dateStr) {
           dateStr = `01-01-${fallbackYear}`;
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
    }

    console.log('\nAll Sheets Import completed!');
  } catch (err) {
    console.error('Error importing:', err);
  } finally {
    mongoose.connection.close();
  }
};

importBills();
