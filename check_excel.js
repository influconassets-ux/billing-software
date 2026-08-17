const xlsx = require('xlsx');

const workbook = xlsx.readFile('../Bills Table.xlsx');
for (const sheetName of workbook.SheetNames) {
  if (!sheetName.includes('Bills - ')) continue;
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  if (data.length > 0) {
    console.log(`\nSheet: ${sheetName}`);
    console.log('Headers (Row 1):', data[0]);
    console.log('Headers (Row 2):', data[1]);
    
    const objData = xlsx.utils.sheet_to_json(sheet);
    console.log(`Total rows in object format: ${objData.length}`);
    
    // Check how many have a valid bill no
    let withBillNoSpace = 0;
    let withBillNoNoSpace = 0;
    let withSlNo = 0;
    
    for (const row of objData) {
      if (row['Bill No. ']) withBillNoSpace++;
      if (row['Bill No.']) withBillNoNoSpace++;
      if (row['Sl No. /Bill No.']) withSlNo++;
      if (row['Sl No. /Bill No. ']) withSlNo++;
    }
    
    console.log(`Rows with 'Bill No. ': ${withBillNoSpace}`);
    console.log(`Rows with 'Bill No.': ${withBillNoNoSpace}`);
    console.log(`Rows with Sl No...: ${withSlNo}`);
  }
}
