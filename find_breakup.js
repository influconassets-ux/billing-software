const xlsx = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../Daily Billings.xlsx');
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

for (let i = 19; i < data.length; i++) {
  const row = data[i];
  if (row.length === 0) continue;
  if (typeof row[7] === 'string' && row[7].includes(',')) {
    console.log(`Row ${i+1}: ${row[7]} - ${row[4]}`);
  }
}
