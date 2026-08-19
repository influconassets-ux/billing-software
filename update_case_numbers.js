const mongoose = require('mongoose');
const xlsx = require('xlsx');
const Bill = require('./models/Bill');
require('dotenv').config();

const updateCaseNumbers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const workbook = xlsx.readFile('../Bills Table.xlsx');
    
    let matchedCount = 0;
    let notFoundCount = 0;

    for (const sheetName of workbook.SheetNames) {
      if (!sheetName.includes('Bills - ')) continue; 
      console.log(`\nProcessing sheet: ${sheetName}`);
      
      const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
      const validData = data.filter(row => row['Bill No. '] !== 'Sl No. /Bill No.' && row['Bill No. ']);

      for (const row of validData) {
        let caseName = row['Name of Case '] || '';
        let caseNumber = row['Case No. '] || '';
        
        // Ensure caseNumber is a string
        if (typeof caseNumber !== 'string') {
          caseNumber = String(caseNumber);
        }
        caseNumber = caseNumber.trim();

        if (!caseNumber) continue;

        // Since the previous import saved Case No into the 'court' field, and later a memo script 
        // changed the memoNos, we can perfectly find the exact bill by matching caseName and the old court value!
        // We also use a fallback to just match caseName and missing caseNumber.
        let bill = await Bill.findOne({ caseName, court: caseNumber });
        
        if (!bill) {
          // If not found, maybe court was already cleared or modified? Try just caseName
          const potentialBills = await Bill.find({ caseName });
          // Find one that doesn't have caseNumber set yet
          bill = potentialBills.find(b => !b.caseNumber);
        }
        
        if (bill) {
          bill.caseNumber = caseNumber;
          // Clear court only if it was holding the case number
          if (bill.court === caseNumber || bill.court == Number(caseNumber)) {
             bill.court = '';
          }
          await bill.save();
          matchedCount++;
        } else {
          console.log(`Could not find match for Case: ${caseName}`);
          notFoundCount++;
        }
      }
    }

    console.log(`\nUpdate completed! Successfully matched and updated: ${matchedCount} bills. Not found: ${notFoundCount}`);
  } catch (err) {
    console.error('Error updating:', err);
  } finally {
    mongoose.connection.close();
  }
};

updateCaseNumbers();
