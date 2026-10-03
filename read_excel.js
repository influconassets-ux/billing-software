const xlsx = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../Daily Billings.xlsx');
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

console.log("Headers:");
console.log(data[18]); // Assuming row 19 is header
console.log("Row 20:");
console.log(data[19]);
console.log("Row 21:");
console.log(data[20]);
console.log("Row 22:");
console.log(data[21]);
