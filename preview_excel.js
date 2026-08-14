const xlsx = require('xlsx');

try {
  const workbook = xlsx.readFile('../Bills Table .xlsx');
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  
  console.log("Headers:");
  console.log(data[0]);
  
  console.log("\nFirst 2 Rows:");
  console.log(data[1]);
  console.log(data[2]);
} catch (err) {
  console.error("Error reading excel:", err);
}
